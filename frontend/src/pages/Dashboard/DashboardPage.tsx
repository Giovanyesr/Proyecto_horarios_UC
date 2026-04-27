import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentsApi, teachersApi, coursesApi, classroomsApi, schedulesApi } from '../../api'
import { Spinner } from '../../components/common/Spinner'
import type { ScheduleRun } from '../../types'

interface Stats {
  students: number
  teachers: number
  courses: number
  classrooms: number
}

const statusMeta: Record<string, { color: string; bg: string; label: string; dot: string }> = {
  completed:  { color: '#059669', bg: '#f0fdf4', label: 'Completado',    dot: '#10b981' },
  running:    { color: '#2563eb', bg: '#eff6ff', label: 'Ejecutando',    dot: '#3b82f6' },
  infeasible: { color: '#d97706', bg: '#fffbeb', label: 'Sin solución',  dot: '#f59e0b' },
  error:      { color: '#dc2626', bg: '#fef2f2', label: 'Error',         dot: '#ef4444' },
  timeout:    { color: '#6b7280', bg: '#f9fafb', label: 'Tiempo agotado', dot: '#9ca3af' },
}

function StatCard({ label, value, to, gradient, icon, trend, trendUp }: {
  label: string; value: number; to: string; gradient: string
  icon: React.ReactNode; trend: string; trendUp?: boolean
}) {
  return (
    <Link to={to}
      className="group relative rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ background: 'white', border: '1px solid #f1f0fb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: gradient }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ background: gradient }}>
            {icon}
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-slate-900 leading-none">{value}</div>
            <div className={`flex items-center justify-end gap-0.5 mt-1 text-xs font-semibold ${trendUp ? 'text-emerald-500' : 'text-slate-400'}`}>
              {trendUp && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
              )}
              {trend}
            </div>
          </div>
        </div>
        <div className="text-sm font-bold text-slate-700">{label}</div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-slate-400">Ver detalle</div>
          <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

const quickActions = [
  { label: 'Registrar Estudiante', desc: 'Nuevo alumno al sistema', to: '/admin/students', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', icon: '👩‍🎓' },
  { label: 'Registrar Docente', desc: 'Agregar nuevo docente', to: '/admin/teachers', gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: '👨‍🏫' },
  { label: 'Matricular Alumno', desc: 'Inscribir en cursos', to: '/admin/enrollments', gradient: 'linear-gradient(135deg, #0d9488, #10b981)', icon: '📝' },
  { label: 'Agregar Curso', desc: 'Nuevo curso académico', to: '/admin/courses', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', icon: '📚' },
  { label: 'Agregar Aula', desc: 'Registrar sala/laboratorio', to: '/admin/classrooms', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: '🏢' },
  { label: 'Generar Horarios', desc: 'Ejecutar algoritmo CSP', to: '/admin/schedules', gradient: 'linear-gradient(135deg, #dc2626, #ef4444)', icon: '⚡' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDate() {
  return new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [runs, setRuns] = useState<ScheduleRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studentsApi.list({ size: 1 }),
      teachersApi.list({ size: 1 }),
      coursesApi.list({ size: 1 }),
      classroomsApi.list({ size: 1 }),
      schedulesApi.listRuns(),
    ]).then(([s, t, c, cl, r]) => {
      setStats({ students: s.total, teachers: t.total, courses: c.total, classrooms: cl.total })
      setRuns(r.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="p-6 xl:p-8 space-y-6 max-w-7xl animate-fadeIn">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #3b0764 0%, #5b21b6 40%, #7c3aed 75%, #9333ea 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(196,181,253,0.2) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(167,139,250,0.15) 0%, transparent 50%)' }} />
        {/* Decorative grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative px-7 py-6 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 7px #34d399' }} />
              <span className="text-violet-200 text-xs font-semibold uppercase tracking-widest">Sistema Activo · Horario</span>
            </div>
            <h1 className="text-2xl xl:text-3xl font-extrabold text-white leading-tight">
              {getGreeting()}, Administrador
            </h1>
            <p className="text-violet-300 text-sm mt-1 capitalize">{formatDate()}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: 'Estudiantes', val: stats?.students ?? 0, color: '#c4b5fd' },
              { label: 'Docentes', val: stats?.teachers ?? 0, color: '#a5f3fc' },
              { label: 'Cursos', val: stats?.courses ?? 0, color: '#6ee7b7' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="text-xl font-extrabold leading-none" style={{ color }}>{val}</div>
                <div className="text-[10px] text-white/60 font-medium mt-0.5 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Estudiantes" value={stats?.students ?? 0} to="/admin/students"
          gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" trendUp
          trend="+2 este mes"
          icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>}
        />
        <StatCard label="Docentes" value={stats?.teachers ?? 0} to="/admin/teachers"
          gradient="linear-gradient(135deg, #0891b2, #06b6d4)"
          trend="Disponibles"
          icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
        <StatCard label="Cursos" value={stats?.courses ?? 0} to="/admin/courses"
          gradient="linear-gradient(135deg, #0d9488, #10b981)" trendUp
          trend="Activos"
          icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
        <StatCard label="Aulas" value={stats?.classrooms ?? 0} to="/admin/classrooms"
          gradient="linear-gradient(135deg, #d97706, #f59e0b)"
          trend="Registradas"
          icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Acciones rápidas</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map(({ label, desc, to, gradient, icon }) => (
              <Link key={label} to={to}
                className="group flex flex-col p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm mb-3 group-hover:scale-110 transition-transform duration-150"
                  style={{ background: gradient }}>
                  <span>{icon}</span>
                </div>
                <div className="text-[13px] font-bold text-slate-700 group-hover:text-slate-900 leading-tight">{label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* System status */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Estado del sistema</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full">
            <div className="p-4 space-y-3">
              {[
                { label: 'API Backend', status: 'online', color: '#10b981' },
                { label: 'Base de Datos', status: 'online', color: '#10b981' },
                { label: 'Motor CSP', status: 'online', color: '#10b981' },
                { label: 'Auth JWT', status: 'online', color: '#10b981' },
              ].map(({ label, status, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
                    <span className="text-sm text-slate-700 font-medium">{label}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: '#f0fdf4', color: '#059669' }}>
                    {status}
                  </span>
                </div>
              ))}
              <div className="pt-2">
                <div className="text-xs text-slate-400 font-medium">Algoritmo CSP</div>
                <div className="flex gap-1 mt-1.5">
                  {['MRV', 'LCV', 'AC-3', 'FC'].map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
                      style={{ background: '#f5f3ff', color: '#7c3aed' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent runs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #faf5ff, #f5f3ff)' }}>
          <div>
            <h2 className="font-bold text-slate-900">Últimas generaciones de horario</h2>
            <p className="text-xs text-slate-400 mt-0.5">Historial del algoritmo CSP · Backtracking + AC-3</p>
          </div>
          <Link to="/admin/schedules"
            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors">
            Ver todos
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {runs.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl"
              style={{ background: '#f5f3ff' }}>
              ⚡
            </div>
            <p className="text-slate-600 text-sm font-semibold">Sin generaciones registradas</p>
            <p className="text-slate-400 text-xs mt-1">El historial aparecerá aquí después de generar horarios</p>
            <Link to="/admin/schedules"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' }}>
              Generar primer horario
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {runs.map((run) => {
              const meta = statusMeta[run.status] ?? statusMeta.timeout
              return (
                <div key={run.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: meta.bg }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.dot, boxShadow: `0 0 4px ${meta.dot}` }} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900">Período {run.academic_period}</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">{new Date(run.created_at).toLocaleString('es-PE')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {run.duration_ms && (
                      <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded">{run.duration_ms}ms</span>
                    )}
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                      style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
