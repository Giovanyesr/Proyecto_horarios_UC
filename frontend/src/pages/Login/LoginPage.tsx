import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore, type UserRole } from '../../store/authStore'

type Phase = 'select' | 'form'
type ApiStatus = 'checking' | 'online' | 'offline'

// ─── micro icons ─────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)
const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

export default function LoginPage() {
  const [phase, setPhase] = useState<Phase>('select')
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({})
  const [touched, setTouched] = useState<{ username: boolean; password: boolean }>({ username: false, password: false })

  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()
  const location = useLocation()
  const usernameRef = useRef<HTMLInputElement>(null)

  // Reason for being redirected to login
  const logoutReason = (location.state as any)?.reason as string | undefined

  // API health check
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    fetch('/api/health', { signal: controller.signal })
      .then(r => setApiStatus(r.ok ? 'online' : 'offline'))
      .catch(() => setApiStatus('offline'))
      .finally(() => clearTimeout(timer))
    return () => { controller.abort(); clearTimeout(timer) }
  }, [])

  // Focus username when form appears
  useEffect(() => {
    if (phase === 'form') setTimeout(() => usernameRef.current?.focus(), 80)
  }, [phase])

  const validateField = (name: string, value: string): string => {
    if (name === 'username') {
      if (!value.trim()) return 'El usuario es requerido'
      if (value.trim().length < 3) return 'Mínimo 3 caracteres'
    }
    if (name === 'password') {
      if (!value) return 'La contraseña es requerida'
      if (value.length < 4) return 'Contraseña muy corta'
    }
    return ''
  }

  const handleBlur = (name: 'username' | 'password', value: string) => {
    setTouched(t => ({ ...t, [name]: true }))
    const err = validateField(name, value)
    setFieldErrors(fe => ({ ...fe, [name]: err }))
  }

  const handleChange = (name: 'username' | 'password', value: string) => {
    if (name === 'username') setUsername(value)
    else setPassword(value)
    if (touched[name]) {
      const err = validateField(name, value)
      setFieldErrors(fe => ({ ...fe, [name]: err }))
    }
    if (error) setError('')
  }

  const handleCapsLock = (e: React.KeyboardEvent) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'))
    }
  }

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role)
    setError('')
    setFieldErrors({})
    setTouched({ username: false, password: false })
    setPhase('form')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const ue = validateField('username', username)
    const pe = validateField('password', password)
    setFieldErrors({ username: ue, password: pe })
    setTouched({ username: true, password: true })
    if (ue || pe) return

    setLoading(true)
    setError('')
    try {
      const data = await authApi.login(username.trim(), password, selectedRole)
      setAuth({ token: data.access_token, role: data.role, userId: data.user_id, username: data.username, studentId: data.student_id })
      navigate(data.role === 'admin' ? '/admin' : '/student', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setPhase('select')
    setError('')
    setUsername('')
    setPassword('')
    setShowPassword(false)
    setCapsLockOn(false)
    setFieldErrors({})
    setTouched({ username: false, password: false })
  }

  const isAdmin = selectedRole === 'admin'

  const statusDot = {
    checking: { color: '#6b7280', label: 'Verificando...', pulse: true },
    online:   { color: '#22c55e', label: 'Sistema en línea', pulse: false },
    offline:  { color: '#ef4444', label: 'Sin conexión', pulse: false },
  }[apiStatus]

  return (
    <div className="min-h-screen flex relative overflow-hidden"
      style={{ background: '#05050a' }}>

      {/* ── Aurora background ───────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Orb 1 — indigo, top-left */}
        <div className="absolute rounded-full"
          style={{
            width: 750, height: 750, top: -220, left: -180,
            background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.06) 45%, transparent 70%)',
            animation: 'aurora1 20s ease-in-out infinite',
          }} />
        {/* Orb 2 — violet, center-right */}
        <div className="absolute rounded-full"
          style={{
            width: 650, height: 650, top: '15%', right: -160,
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.05) 45%, transparent 70%)',
            animation: 'aurora2 26s ease-in-out infinite',
          }} />
        {/* Orb 3 — teal, bottom-center */}
        <div className="absolute rounded-full"
          style={{
            width: 580, height: 580, bottom: -140, left: '25%',
            background: 'radial-gradient(circle, rgba(20,184,166,0.18) 0%, rgba(20,184,166,0.04) 45%, transparent 70%)',
            animation: 'aurora3 22s ease-in-out infinite',
          }} />
        {/* Orb 4 — blue, top-right */}
        <div className="absolute rounded-full"
          style={{
            width: 420, height: 420, top: -80, right: '8%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0.04) 45%, transparent 70%)',
            animation: 'aurora4 30s ease-in-out infinite',
          }} />
        {/* Orb 5 — rose accent, bottom-left */}
        <div className="absolute rounded-full"
          style={{
            width: 380, height: 380, bottom: '10%', left: -80,
            background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)',
            animation: 'aurora5 17s ease-in-out infinite',
          }} />
      </div>

      {/* Noise grain overlay (keeps the premium film look) */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* API status — top right */}
      <div className="fixed top-4 right-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusDot.pulse ? 'animate-pulse' : ''}`}
          style={{ background: statusDot.color }} />
        <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {statusDot.label}
        </span>
      </div>

      {/* ── Left brand panel ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between px-16 py-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <svg className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.8)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">Horario</span>
        </div>

        {/* Hero text */}
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-5"
              style={{ color: 'rgba(255,255,255,0.2)' }}>
              Universidad Continental · ISI
            </p>
            <h2 className="font-black leading-[1.05] tracking-tight"
              style={{ fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', color: '#ffffff' }}>
              Generación<br />
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>Óptima de</span><br />
              Horarios
            </h2>
            <p className="mt-5 text-sm leading-relaxed max-w-xs"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              Sistema inteligente basado en algoritmos CSP para la planificación académica sin conflictos.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-2.5">
            {[
              { icon: '◆', text: 'Backtracking con AC-3 y heurísticas MRV/LCV' },
              { icon: '◇', text: 'Restricciones automáticas de disponibilidad' },
              { icon: '◈', text: 'Optimización de carga horaria y créditos' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="text-[10px] mt-0.5 font-bold flex-shrink-0"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>{icon}</span>
                <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
          Taller de Proyectos 2 — 2025
        </p>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px self-stretch my-10"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)' }} />

      {/* ── Right form panel ─────────────────────────── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Universidad Continental
            </p>
            <h1 className="text-2xl font-black text-white tracking-tight">Horario</h1>
          </div>

          {/* ── Phase: role selection ── */}
          {phase === 'select' && (
            <div className="animate-enter space-y-6">
              {/* Session-ended notice */}
              {logoutReason && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span style={{ color: '#fcd34d' }}>
                    {logoutReason === 'inactivity'
                      ? 'Sesión cerrada por inactividad (30 min).'
                      : 'Tu sesión ha expirado. Vuelve a iniciar sesión.'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Bienvenido</h3>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  ¿Cómo deseas ingresar?
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Student card */}
                <RoleCard
                  role="student"
                  title="Alumno"
                  description="Ver horarios, matrículas y disponibilidad"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                  onClick={() => handleSelectRole('student')}
                  variant="ghost"
                />

                {/* Admin card */}
                <RoleCard
                  role="admin"
                  title="Administración"
                  description="Gestionar horarios, docentes y académicos"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  }
                  onClick={() => handleSelectRole('admin')}
                  variant="solid"
                />
              </div>

              <div className="pt-1 flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <Link to="/register" className="text-xs transition-colors"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
                  Registrar cuenta de alumno →
                </Link>
              </div>
            </div>
          )}

          {/* ── Phase: login form ── */}
          {phase === 'form' && (
            <div className="animate-enter space-y-6">
              {/* Back + header */}
              <div>
                <button onClick={resetForm}
                  className="inline-flex items-center gap-1.5 text-xs mb-5 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isAdmin ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${isAdmin ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
                    }}>
                    {isAdmin
                      ? <svg className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      : <svg className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.65)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    }
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {isAdmin ? 'Portal de Administración' : 'Portal del Alumno'}
                    </h3>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Ingresa tus credenciales
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-2"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>Usuario</label>
                  <input
                    ref={usernameRef}
                    type="text"
                    value={username}
                    onChange={e => handleChange('username', e.target.value)}
                    onBlur={() => handleBlur('username', username)}
                    onKeyUp={handleCapsLock}
                    placeholder={isAdmin ? 'admin' : 'alumno01'}
                    autoComplete="username"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-150"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${touched.username && fieldErrors.username ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                    onFocus={e => { if (!(touched.username && fieldErrors.username)) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
                    onBlurCapture={e => { if (!(touched.username && fieldErrors.username)) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                  {touched.username && fieldErrors.username && (
                    <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: 'rgba(239,68,68,0.85)' }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {fieldErrors.username}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-2"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => handleChange('password', e.target.value)}
                      onBlur={() => handleBlur('password', password)}
                      onKeyUp={handleCapsLock}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-11 rounded-xl text-white text-sm outline-none transition-all duration-150"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${touched.password && fieldErrors.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      }}
                      onFocus={e => { if (!(touched.password && fieldErrors.password)) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
                      onBlurCapture={e => { if (!(touched.password && fieldErrors.password)) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  {/* Caps lock warning */}
                  {capsLockOn && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#f59e0b' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-[11px] font-medium" style={{ color: '#f59e0b' }}>
                        Bloq Mayús activado
                      </span>
                    </div>
                  )}

                  {touched.password && fieldErrors.password && !capsLockOn && (
                    <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: 'rgba(239,68,68,0.85)' }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Global error */}
                {error && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm" style={{ color: '#fca5a5' }}>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#ffffff', color: '#0d0d0f' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#f0f0f0' }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#ffffff' }}>
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Verificando...
                      </span>
                    : 'Iniciar sesión'
                  }
                </button>
              </form>

              {/* Credentials hint */}
              <div className="text-center space-y-2">
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                  {isAdmin ? '→  admin · admin123' : '→  alumno01 · alumno123'}
                </p>
                {!isAdmin && (
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    ¿Sin cuenta?{' '}
                    <Link to="/register" className="underline underline-offset-2 transition-colors"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                      Regístrate aquí
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes enter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-enter { animation: enter 0.2s ease-out; }

        input::placeholder { color: rgba(255,255,255,0.15); }
        input { color-scheme: dark; }

        @keyframes aurora1 {
          0%,100% { transform: translate(0,0) scale(1); }
          30%  { transform: translate(90px, 130px) scale(1.18); }
          65%  { transform: translate(-70px, 70px) scale(0.88); }
        }
        @keyframes aurora2 {
          0%,100% { transform: translate(0,0) scale(1); }
          25%  { transform: translate(-110px, 70px) scale(1.22); }
          55%  { transform: translate(60px,-90px) scale(0.85); }
          80%  { transform: translate(-50px,-30px) scale(1.1); }
        }
        @keyframes aurora3 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%  { transform: translate(130px,-90px) scale(1.12); }
          72%  { transform: translate(-90px,-50px) scale(0.9); }
        }
        @keyframes aurora4 {
          0%,100% { transform: translate(0,0) scale(1); }
          35%  { transform: translate(-80px, 110px) scale(1.35); }
          70%  { transform: translate(70px, 90px) scale(0.78); }
        }
        @keyframes aurora5 {
          0%,100% { transform: translate(0,0) scale(1); }
          45%  { transform: translate(100px,-70px) scale(1.2); }
          75%  { transform: translate(60px, 40px) scale(0.85); }
        }
      `}</style>
    </div>
  )
}

// ─── Role Card ────────────────────────────────────────────────────────────────
interface RoleCardProps {
  role: string
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  variant: 'solid' | 'ghost'
}
function RoleCard({ title, description, icon, onClick, variant }: RoleCardProps) {
  const [hovered, setHovered] = useState(false)

  const bg = hovered
    ? variant === 'solid' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'
    : variant === 'solid' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'

  const border = hovered
    ? variant === 'solid' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.14)'
    : variant === 'solid' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full text-left rounded-2xl px-5 py-4 transition-all duration-150"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        transform: hovered ? 'translateX(2px)' : 'translateX(0)',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-150"
          style={{
            background: variant === 'solid' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: variant === 'solid' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
          }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{description}</p>
        </div>
        <svg className="w-4 h-4 flex-shrink-0 transition-transform duration-150"
          style={{
            color: 'rgba(255,255,255,0.2)',
            transform: hovered ? 'translateX(2px)' : 'translateX(0)',
          }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
