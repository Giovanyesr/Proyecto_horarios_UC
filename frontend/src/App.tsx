import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { StudentShell } from './components/layout/StudentShell'
import { Spinner } from './components/common/Spinner'
import { useAuthStore } from './store/authStore'
import { isTokenExpired, msUntilExpiry } from './utils/security'

// ── Admin pages ───────────────────────────────────────────────────────────────
const DashboardPage     = lazy(() => import('./pages/Dashboard/DashboardPage'))
const StudentsPage      = lazy(() => import('./pages/Students/StudentsPage'))
const TeachersPage      = lazy(() => import('./pages/Teachers/TeachersPage'))
const CoursesPage       = lazy(() => import('./pages/Courses/CoursesPage'))
const ClassroomsPage    = lazy(() => import('./pages/Classrooms/ClassroomsPage'))
const EnrollmentsPage   = lazy(() => import('./pages/Enrollments/EnrollmentsPage'))
const SchedulesPage     = lazy(() => import('./pages/Schedules/SchedulesPage'))
const UsersPage         = lazy(() => import('./pages/Admin/UsersPage'))
const AllowedEmailsPage = lazy(() => import('./pages/Admin/AllowedEmailsPage'))

// ── Student portal pages ──────────────────────────────────────────────────────
const StudentDashboard    = lazy(() => import('./pages/StudentPortal/StudentDashboard'))
const StudentSchedule     = lazy(() => import('./pages/StudentPortal/StudentSchedulePage'))
const StudentEnrollments  = lazy(() => import('./pages/StudentPortal/StudentEnrollmentsPage'))
const StudentAvailability = lazy(() => import('./pages/StudentPortal/StudentAvailabilityPage'))
const StudentProfile      = lazy(() => import('./pages/StudentPortal/StudentProfilePage'))

// ── Auth pages ────────────────────────────────────────────────────────────────
const LoginPage    = lazy(() => import('./pages/Login/LoginPage'))
const RegisterPage = lazy(() => import('./pages/Login/RegisterPage'))

// ── Constants ─────────────────────────────────────────────────────────────────
const INACTIVITY_MS = 30 * 60 * 1000   // 30 min
const EXPIRY_WARN_MS = 5 * 60 * 1000   // warn 5 min before expiry

// ── Helpers ───────────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#0d0d0f' }}>
      <Spinner size="lg" />
    </div>
  )
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

// ── Session expiry warning banner ─────────────────────────────────────────────
function ExpiryBanner({ onLogout }: { onLogout: () => void }) {
  const [show, setShow] = useState(false)
  const token = useAuthStore(s => s.token)

  useEffect(() => {
    if (!token) return
    const check = () => {
      const ms = msUntilExpiry(token)
      setShow(ms > 0 && ms <= EXPIRY_WARN_MS)
    }
    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [token])

  if (!show) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium"
      style={{ background: '#1a1a1a', border: '1px solid rgba(245,158,11,0.4)', color: '#fbbf24' }}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      Tu sesión expira en menos de 5 minutos.
      <button onClick={onLogout}
        className="ml-2 text-xs underline underline-offset-2 hover:text-white transition-colors">
        Cerrar sesión
      </button>
    </div>
  )
}

// ── Auto-logout hook (inactivity + token expiry) ───────────────────────────────
function useSessionGuard() {
  const { token, logout } = useAuthStore()
  const navigate = useNavigate()
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doLogout = useCallback((reason: 'inactivity' | 'expired') => {
    logout()
    navigate('/login', { replace: true, state: { reason } })
  }, [logout, navigate])

  // Inactivity timer — reset on any user interaction
  useEffect(() => {
    if (!token) return

    const reset = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      inactivityTimer.current = setTimeout(() => doLogout('inactivity'), INACTIVITY_MS)
    }

    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      EVENTS.forEach(e => window.removeEventListener(e, reset))
    }
  }, [token, doLogout])

  // Token expiry timer — fires exactly when the JWT expires
  useEffect(() => {
    if (!token) return
    const ms = msUntilExpiry(token)
    if (ms <= 0) { doLogout('expired'); return }

    const id = setTimeout(() => doLogout('expired'), ms)
    return () => clearTimeout(id)
  }, [token, doLogout])

  return doLogout
}

// ── RequireAuth (verifies authentication + role + token validity) ─────────────
function RequireAuth({ role, children }: { role: 'admin' | 'student'; children: React.ReactNode }) {
  const { isAuthenticated, role: userRole, token, logout } = useAuthStore()
  const navigate = useNavigate()

  // Not logged in at all
  if (!isAuthenticated || !token) return <Navigate to="/login" replace />

  // Token expired (e.g. page refreshed after long sleep)
  if (isTokenExpired(token)) {
    logout()
    return <Navigate to="/login" replace state={{ reason: 'expired' }} />
  }

  // Wrong role
  if (userRole !== role) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/student'} replace />
  }

  return <>{children}</>
}

// ── RootRedirect ──────────────────────────────────────────────────────────────
function RootRedirect() {
  const { isAuthenticated, role, token, logout } = useAuthStore()
  if (!isAuthenticated || !token) return <Navigate to="/login" replace />
  if (isTokenExpired(token)) {
    logout()
    return <Navigate to="/login" replace />
  }
  return <Navigate to={role === 'admin' ? '/admin' : '/student'} replace />
}

// ── Inner app (needs Router context for useNavigate) ─────────────────────────
function InnerApp() {
  const { token, isAuthenticated } = useAuthStore()
  const doLogout = useSessionGuard()

  return (
    <>
      {/* Expiry warning banner — only when authenticated */}
      {isAuthenticated && token && (
        <ExpiryBanner onLogout={() => doLogout('expired')} />
      )}

      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Wrap><LoginPage /></Wrap>} />
        <Route path="/register" element={<Wrap><RegisterPage /></Wrap>} />

        {/* Admin portal */}
        <Route element={<RequireAuth role="admin"><AppShell /></RequireAuth>}>
          <Route path="/admin"                element={<Wrap><DashboardPage /></Wrap>} />
          <Route path="/admin/students"       element={<Wrap><StudentsPage /></Wrap>} />
          <Route path="/admin/teachers"       element={<Wrap><TeachersPage /></Wrap>} />
          <Route path="/admin/courses"        element={<Wrap><CoursesPage /></Wrap>} />
          <Route path="/admin/classrooms"     element={<Wrap><ClassroomsPage /></Wrap>} />
          <Route path="/admin/enrollments"    element={<Wrap><EnrollmentsPage /></Wrap>} />
          <Route path="/admin/schedules"      element={<Wrap><SchedulesPage /></Wrap>} />
          <Route path="/admin/users"          element={<Wrap><UsersPage /></Wrap>} />
          <Route path="/admin/allowed-emails" element={<Wrap><AllowedEmailsPage /></Wrap>} />
        </Route>

        {/* Student portal */}
        <Route element={<RequireAuth role="student"><StudentShell /></RequireAuth>}>
          <Route path="/student"               element={<Wrap><StudentDashboard /></Wrap>} />
          <Route path="/student/schedule"      element={<Wrap><StudentSchedule /></Wrap>} />
          <Route path="/student/enrollments"   element={<Wrap><StudentEnrollments /></Wrap>} />
          <Route path="/student/availability"  element={<Wrap><StudentAvailability /></Wrap>} />
          <Route path="/student/profile"       element={<Wrap><StudentProfile /></Wrap>} />
        </Route>

        {/* Root & fallback */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  )
}
