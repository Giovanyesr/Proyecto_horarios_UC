import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { enrollmentsApi, schedulesApi, studentsApi } from '../../api'
import type { Student } from '../../types'

interface Stats {
  enrolled: number
  credits: number
  maxCredits: number
  academicStatus: string
  latestRun: string | null
  latestStatus: string | null
}

const runMeta: Record<string, { label: string; color: string; dot: string }> = {
  completed:  { label: 'Disponible',    color: '#34d399', dot: '#34d399' },
  running:    { label: 'Generando…',    color: '#60a5fa', dot: '#60a5fa' },
  infeasible: { label: 'Sin solución',  color: '#fbbf24', dot: '#fbbf24' },
  error:      { label: 'Error',         color: '#f87171', dot: '#f87171' },
}

const acMeta: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Al día',           color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  probation: { label: 'En observación',   color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  resting:   { label: 'Año de descanso',  color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function getTodayName() {
  return new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
}

const CARD = { background: 'var(--sp-card-bg)', border: '1px solid var(--sp-card-border)', borderRadius: 16 }
const T1 = 'var(--sp-t1)'
const T2 = 'var(--sp-t2)'
const T3 = 'var(--sp-t3)'

export default function StudentDashboard() {
  const { username, studentId } = useAuthStore()
  const [stats, setStats] = useState<Stats>({
    enrolled: 0, credits: 0, maxCredits: 22, academicStatus: 'active',
    latestRun: null, latestStatus: null,
  })
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [enrollRes, runsRes, studentRes] = await Promise.all([
          studentId
            ? enrollmentsApi.list({ student_id: studentId, size: 100 })
            : Promise.resolve({ items: [], total: 0 }),
          schedulesApi.listRuns({ size: 1 }),
          studentId ? studentsApi.get(studentId) : Promise.resolve(null),
        ])
        const active = (enrollRes.items ?? []).filter((e: any) => e.status === 'enrolled')
        const credits = active.reduce((sum: number, e: any) => sum + (e.course?.credits ?? 0), 0)
        const latestRun = Array.isArray(runsRes) ? runsRes[0] : (runsRes as any).items?.[0] ?? null
        if (studentRes) setStudent(studentRes)
        setStats({
          enrolled: active.length,
          credits,
          maxCredits: studentRes?.max_credits ?? 22,
          academicStatus: studentRes?.academic_status ?? 'active',
          latestRun: latestRun?.academic_period ?? null,
          latestStatus: latestRun?.status ?? null,
        })
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [studentId])

  const creditPct = Math.min((stats.credits / stats.maxCredits) * 100, 100)
  const statusInfo = acMeta[stats.academicStatus] ?? acMeta.active
  const scheduleInfo = stats.latestStatus ? (runMeta[stats.latestStatus] ?? runMeta.error) : null

  return (
    <div className="p-6 xl:p-8 space-y-5 animate-fadeIn">

      {/* ── Alert banners ─────────────────────────────── */}
      {stats.academicStatus === 'resting' && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#fca5a5' }}>Período de descanso académico</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(252,165,165,0.7)' }}>Jalaste el mismo curso durante un año. No puedes matricularte este período.</div>
          </div>
        </div>
      )}
      {stats.academicStatus === 'probation' && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#fcd34d' }}>Observación académica activa</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(252,211,77,0.7)' }}>Tus créditos se redujeron a {stats.maxCredits}. Tienes un curso obligatorio asignado.</div>
          </div>
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl px-7 py-6"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #4338ca 65%, #3730a3 100%)' }}>
        {/* mesh accents */}
        <div className="pointer-events-none absolute inset-0">
          <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280,
            background: 'radial-gradient(circle, rgba(165,180,252,0.18) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: '35%', width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)' }} />
        </div>
        <div className="relative flex items-center gap-5 flex-wrap">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            {student ? `${student.first_name[0]}${student.last_name[0]}` : username?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(199,210,254,0.7)' }}>{getGreeting()}</p>
            <h1 className="text-2xl font-extrabold text-white leading-tight mt-0.5">
              {student ? `${student.first_name} ${student.last_name}` : username}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {student && <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(199,210,254,0.8)' }}>{student.student_code}</span>}
              {student && <span className="text-[11px]" style={{ color: 'rgba(199,210,254,0.6)' }}>Semestre {student.semester}</span>}
              <span className="text-[11px] capitalize" style={{ color: 'rgba(199,210,254,0.5)' }}>{getTodayName()}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background: statusInfo.bg, color: statusInfo.color, border: `1px solid ${statusInfo.color}33` }}>
              {statusInfo.label}
            </span>
            <span className="text-[11px]" style={{ color: 'rgba(199,210,254,0.4)' }}>UC · Portal Alumno</span>
          </div>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Cursos */}
        <div style={CARD} className="overflow-hidden">
          <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #818cf8, #a78bfa)' }} />
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <svg className="w-5 h-5" style={{ color: '#818cf8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-3xl font-black" style={{ color: T1 }}>{loading ? '—' : stats.enrolled}</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wide" style={{ color: T2 }}>Cursos matriculados</div>
            <div className="text-[11px] mt-0.5" style={{ color: T3 }}>Período activo</div>
          </div>
        </div>

        {/* Créditos */}
        <div style={CARD} className="overflow-hidden">
          <div className="h-[2px]" style={{ background: creditPct > 85 ? 'linear-gradient(90deg, #34d399, #6ee7b7)' : creditPct > 60 ? 'linear-gradient(90deg, #fbbf24, #fcd34d)' : 'linear-gradient(90deg, #22d3ee, #67e8f9)' }} />
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.25)' }}>
                <svg className="w-5 h-5" style={{ color: '#22d3ee' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black" style={{ color: T1 }}>{loading ? '—' : stats.credits}</span>
                <span className="text-sm ml-1" style={{ color: T3 }}>/ {stats.maxCredits}</span>
              </div>
            </div>
            <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: T2 }}>Créditos este ciclo</div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${creditPct}%`,
                  background: creditPct > 85 ? 'linear-gradient(90deg, #34d399, #6ee7b7)' : creditPct > 60 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #06b6d4, #22d3ee)',
                }} />
            </div>
            <div className="text-[11px] mt-1.5" style={{ color: T3 }}>{Math.round(creditPct)}% · {stats.maxCredits - stats.credits} disponibles</div>
          </div>
        </div>

        {/* Horario */}
        <div style={CARD} className="overflow-hidden">
          <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                <svg className="w-5 h-5" style={{ color: '#a78bfa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-xs font-bold uppercase tracking-wide" style={{ color: T2 }}>Horario activo</div>
            <div className="font-extrabold text-lg mt-1 leading-tight" style={{ color: T1 }}>
              {loading ? '—' : (stats.latestRun ?? 'Sin horario')}
            </div>
            {scheduleInfo && (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold mt-2"
                style={{ background: `${scheduleInfo.color}18`, color: scheduleInfo.color, border: `1px solid ${scheduleInfo.color}30` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: scheduleInfo.dot }} />
                {scheduleInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom row ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Mini week (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-2xl" style={CARD}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-bold text-sm" style={{ color: T1 }}>Esta semana</div>
              <div className="text-[11px] mt-0.5" style={{ color: T3 }}>
                {stats.enrolled > 0 ? `${stats.enrolled} curso${stats.enrolled > 1 ? 's' : ''} activos` : 'Sin cursos matriculados'}
              </div>
            </div>
            <Link to="/student/schedule"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}>
              Ver horario →
            </Link>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {DAYS.map((d, i) => {
              const todayIdx = new Date().getDay() - 1
              const isToday = todayIdx === i
              const date = new Date(Date.now() - (todayIdx - i) * 86400000).getDate()
              return (
                <div key={d} className="flex flex-col items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: isToday ? '#818cf8' : T3 }}>{d}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={isToday ? {
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: '#fff',
                      boxShadow: '0 0 12px rgba(99,102,241,0.4)',
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      color: T2,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                    {date}
                  </div>
                  {stats.enrolled > 0 && (
                    <div className="w-1 h-1 rounded-full"
                      style={{ background: isToday ? '#818cf8' : 'rgba(255,255,255,0.12)' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick links (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {[
            { to: '/student/schedule',     label: 'Mi Horario',     color: '#818cf8', bg: 'rgba(99,102,241,0.12)',    border: 'rgba(99,102,241,0.2)',  icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            )},
            { to: '/student/enrollments',  label: 'Matrículas',     color: '#34d399', bg: 'rgba(16,185,129,0.12)',   border: 'rgba(16,185,129,0.2)',  icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            )},
            { to: '/student/availability', label: 'Disponibilidad', color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.2)', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )},
            { to: '/student/profile',      label: 'Mi Perfil',      color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.2)',  icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            )},
          ].map(({ to, label, color, bg, border, icon }) => (
            <Link key={to} to={to}
              className="group flex flex-col items-center justify-center gap-2.5 rounded-2xl p-4 text-center transition-all duration-150"
              style={{ background: bg, border: `1px solid ${border}` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${color}20` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
              <div style={{ color }}>{icon}</div>
              <span className="text-xs font-semibold" style={{ color: T1 }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {!studentId && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#fcd34d' }}>Cuenta sin vincular</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(252,211,77,0.7)' }}>Tu cuenta no está vinculada a un registro de estudiante. Contacta a administración.</div>
          </div>
        </div>
      )}
    </div>
  )
}
