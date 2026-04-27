import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '../../store/authStore'

const navGroups = [
  {
    label: 'Principal',
    dot: '#7c3aed',
    items: [
      {
        to: '/admin', label: 'Dashboard', end: true,
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        to: '/admin/schedules', label: 'Horarios', end: false,
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Académico',
    dot: '#0891b2',
    items: [
      {
        to: '/admin/students', label: 'Estudiantes', end: false,
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        ),
      },
      {
        to: '/admin/teachers', label: 'Docentes', end: false,
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        to: '/admin/courses', label: 'Cursos', end: false,
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
      },
      {
        to: '/admin/classrooms', label: 'Aulas', end: false,
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        to: '/admin/enrollments', label: 'Matrículas', end: false,
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Acceso',
    dot: '#059669',
    items: [
      {
        to: '/admin/users', label: 'Usuarios', end: false,
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        to: '/admin/allowed-emails', label: 'Correos autorizados', end: false,
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
      },
    ],
  },
]

export function Sidebar() {
  const { username, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-60 flex flex-col h-full" style={{ background: '#f6f5ff', borderRight: '1px solid #e4e2f7' }}>
      {/* Brand */}
      <div className="relative overflow-hidden px-4 py-3.5"
        style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 55%, #8b5cf6 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 10% 90%, rgba(196,181,253,0.3) 0%, transparent 60%), radial-gradient(circle at 90% 10%, rgba(167,139,250,0.2) 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-extrabold text-[15px] leading-none tracking-tight">Horario</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-violet-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" style={{ boxShadow: '0 0 5px #34d399' }} />
                Admin · Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User card */}
      {username && (
        <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl" style={{ background: 'white', border: '1px solid #ede9fe', boxShadow: '0 1px 4px rgba(109,40,217,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}>
              {username[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-slate-800 text-xs font-bold truncate">{username}</div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                style={{ background: '#ede9fe', color: '#6d28d9' }}>
                Administrador
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="En línea" />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 mt-1" aria-label="Navegación principal">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="flex items-center gap-1.5 px-2.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: group.dot }} />
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{group.label}</p>
            </div>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                      isActive
                        ? 'text-white'
                        : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm',
                    )
                  }
                  style={({ isActive }) => isActive ? {
                    background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
                    boxShadow: '0 2px 8px rgba(109,40,217,0.25)',
                  } : {}}
                >
                  <span className="flex-shrink-0">{icon}</span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2.5" style={{ borderTop: '1px solid #e4e2f7' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150"
        >
          <svg className="w-[17px] h-[17px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </button>
        <p className="text-[9px] text-slate-300 text-center pt-2 font-medium tracking-wide">Taller 2 ISI · UC · 2025</p>
      </div>
    </aside>
  )
}
