import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

const NAV = [
  {
    to: '/student', end: true,
    label: 'Mi Panel',
    color: '#818cf8', glow: 'rgba(99,102,241,0.16)',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    to: '/student/schedule', end: false,
    label: 'Mi Horario',
    color: '#22d3ee', glow: 'rgba(6,182,212,0.16)',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/student/enrollments', end: false,
    label: 'Mis Matrículas',
    color: '#34d399', glow: 'rgba(16,185,129,0.16)',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/student/availability', end: false,
    label: 'Disponibilidad',
    color: '#f472b6', glow: 'rgba(244,114,182,0.16)',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/student/profile', end: false,
    label: 'Mi Perfil',
    color: '#a78bfa', glow: 'rgba(139,92,246,0.16)',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

// ── Sun icon ──────────────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
)

// ── Moon icon ─────────────────────────────────────────────────────────────────
const MoonIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

export function StudentSidebar() {
  const { username, logout } = useAuthStore()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col h-full relative"
      style={{
        background: 'var(--sp-sb-bg)',
        borderRight: '1px solid var(--sp-sb-border)',
      }}
    >
      {/* Ambient glow (dark only) */}
      {isDark && (
        <div className="pointer-events-none absolute left-0 top-0 w-full h-40 overflow-hidden">
          <div style={{
            position: 'absolute', top: -80, left: -40, width: 260, height: 260,
            background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)',
          }} />
        </div>
      )}

      {/* Brand */}
      <div className="relative px-5 pt-5 pb-4"
        style={{ borderBottom: '1px solid var(--sp-sb-inner-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-[13px] leading-none tracking-tight"
              style={{ color: 'var(--sp-t1)' }}>Horario</div>
            <div className="text-[10px] mt-0.5 font-semibold uppercase tracking-widest"
              style={{ color: isDark ? 'rgba(129,140,248,0.7)' : '#6366f1' }}>
              Portal Alumno
            </div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="relative mx-3 mt-3 px-3 py-3 rounded-2xl"
        style={{ background: 'var(--sp-sb-user-bg)', border: '1px solid var(--sp-sb-user-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            {username?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold truncate leading-none" style={{ color: 'var(--sp-t1)' }}>
              {username}
            </div>
            <div className="text-[10px] mt-1 font-medium" style={{ color: 'var(--sp-sb-user-sub)' }}>
              Estudiante
            </div>
          </div>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: '#34d399', boxShadow: '0 0 5px #34d399' }} />
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-3 space-y-0.5 mt-1 overflow-y-auto"
        aria-label="Navegación alumno">
        <div className="text-[9px] font-bold uppercase tracking-[0.18em] px-2 mb-2"
          style={{ color: 'var(--sp-sb-label)' }}>Menú</div>

        {NAV.map(({ to, end, label, icon, color, glow }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
            style={({ isActive }) => isActive ? {
              background: glow,
              borderLeft: `2px solid ${color}`,
              paddingLeft: 10,
              color: 'var(--sp-t1)',
            } : {
              color: 'var(--sp-sb-nav-text)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              if (!el.getAttribute('aria-current')) {
                el.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9'
                el.style.color = 'var(--sp-t1)'
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              if (!el.getAttribute('aria-current')) {
                el.style.background = 'transparent'
                el.style.color = 'var(--sp-sb-nav-text)'
              }
            }}
          >
            <span className="flex-shrink-0" style={{ color: 'inherit' }}>{icon}</span>
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative px-3 pb-3 space-y-1"
        style={{ borderTop: '1px solid var(--sp-sb-inner-border)', paddingTop: 10 }}>

        {/* Theme toggle */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
          style={{ background: 'var(--sp-sb-user-bg)', border: '1px solid var(--sp-sb-user-border)' }}>
          <div className="flex items-center gap-2">
            <span style={{ color: isDark ? '#a78bfa' : '#f59e0b' }}>
              {isDark ? <MoonIcon /> : <SunIcon />}
            </span>
            <span className="text-[11px] font-medium" style={{ color: 'var(--sp-t2)' }}>
              {isDark ? 'Modo oscuro' : 'Modo claro'}
            </span>
          </div>
          {/* Toggle pill */}
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                : '#e2e8f0',
            }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full shadow transition-all duration-300"
              style={{
                left: isDark ? 'calc(100% - 18px)' : '2px',
                background: isDark ? '#ffffff' : '#94a3b8',
              }}
            />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/login', { replace: true }) }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
          style={{ color: 'rgba(248,113,133,0.75)' }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'
            ;(e.currentTarget as HTMLElement).style.color = '#fca5a5'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(248,113,133,0.75)'
          }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>

        <p className="text-[9px] text-center font-medium tracking-wide pt-0.5"
          style={{ color: 'var(--sp-sb-footer)' }}>
          ISI · Taller 2 · UC 2025
        </p>
      </div>
    </aside>
  )
}
