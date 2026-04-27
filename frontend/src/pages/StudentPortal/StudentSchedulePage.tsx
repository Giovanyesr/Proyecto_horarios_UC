import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { schedulesApi, enrollmentsApi } from '../../api'
import { WeeklyCalendar } from '../../components/schedule/WeeklyCalendar'
import type { ScheduleRun, ScheduledSection, Enrollment } from '../../types'
import { Spinner } from '../../components/common/Spinner'

const CARD = { background: 'var(--sp-card-bg)', border: '1px solid var(--sp-card-border)', borderRadius: 16 }
const T1 = 'var(--sp-t1)'
const T2 = 'var(--sp-t2)'
const T3 = 'var(--sp-t3)'

export default function StudentSchedulePage() {
  const { studentId } = useAuthStore()
  const [runs, setRuns] = useState<ScheduleRun[]>([])
  const [selectedRun, setSelectedRun] = useState<string | null>(null)
  const [sections, setSections] = useState<ScheduledSection[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSections, setLoadingSections] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    schedulesApi.listRuns()
      .then(data => {
        const completed = (Array.isArray(data) ? data : (data as any).items ?? [])
          .filter((r: ScheduleRun) => r.status === 'completed')
        setRuns(completed)
        if (completed.length > 0) setSelectedRun(completed[0].id)
      })
      .catch(() => setError('No se pudo cargar los horarios'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedRun) return
    setLoadingSections(true)
    setError('')

    const activeRun = runs.find(r => r.id === selectedRun)
    const period = activeRun?.academic_period

    const sectionsP = studentId
      ? schedulesApi.getStudentSchedule(selectedRun, studentId)
      : schedulesApi.getSections(selectedRun)

    const enrollmentsP = studentId && period
      ? enrollmentsApi.list({ student_id: studentId, academic_period: period, status: 'enrolled', size: 100 }).then(r => (r as any).items ?? r ?? [])
      : Promise.resolve([])

    Promise.all([sectionsP, enrollmentsP])
      .then(([secs, enrs]) => { setSections(secs); setEnrollments(enrs) })
      .catch(() => setError('No se pudo cargar las secciones'))
      .finally(() => setLoadingSections(false))
  }, [selectedRun, studentId, runs])

  const activeRun = runs.find(r => r.id === selectedRun)
  const scheduledCourseIds = new Set(sections.map(s => s.course_id))
  const unscheduled = enrollments.filter(e => !scheduledCourseIds.has(e.course_id))
  const totalCredits = [...new Map(sections.map(s => [s.course_id, s])).values()]
    .reduce((sum, s) => sum + (s.course?.credits ?? 0), 0)

  return (
    <div className="p-6 xl:p-8 space-y-5 animate-fadeIn">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl px-7 py-5"
        style={{ background: 'linear-gradient(135deg, #164e63 0%, #155e75 40%, #0e7490 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div style={{ position: 'absolute', top: -60, right: -40, width: 250, height: 250,
            background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 65%)' }} />
        </div>
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4" style={{ color: 'rgba(103,232,249,0.8)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(103,232,249,0.7)' }}>Horario Académico</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Mi Horario</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(103,232,249,0.6)' }}>Calendario del período activo</p>
          </div>
          {activeRun && (sections.length > 0 || enrollments.length > 0) && (
            <div className="flex items-center gap-3">
              {[
                { n: enrollments.length || sections.length, label: 'Cursos' },
                { n: totalCredits, label: 'Créditos' },
              ].map(({ n, label }) => (
                <div key={label} className="text-center px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="text-xl font-extrabold text-white">{n}</div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(103,232,249,0.7)' }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {!loading && runs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={CARD}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <svg className="w-7 h-7" style={{ color: '#22d3ee' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-bold text-sm" style={{ color: T1 }}>Sin horario disponible</h3>
          <p className="text-xs mt-1 max-w-xs text-center" style={{ color: T3 }}>
            Aún no se ha generado un horario para tu periodo. Contacta a administración.
          </p>
        </div>
      )}

      {!loading && runs.length > 0 && (
        <>
          {/* Period selector */}
          <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl" style={CARD}>
            <span className="text-xs font-bold uppercase tracking-wide flex-shrink-0" style={{ color: T2 }}>Período:</span>
            <div className="flex gap-2 flex-wrap">
              {runs.map(r => (
                <button key={r.id} onClick={() => setSelectedRun(r.id)}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                  style={selectedRun === r.id ? {
                    background: 'linear-gradient(135deg, #0e7490, #06b6d4)',
                    color: '#fff',
                    boxShadow: '0 2px 10px rgba(6,182,212,0.3)',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    color: T2,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                  {r.academic_period}
                </button>
              ))}
            </div>
            {activeRun && (
              <span className="ml-auto text-[11px]" style={{ color: T3 }}>
                Generado el {new Date(activeRun.created_at).toLocaleDateString('es-PE')}
              </span>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm" style={{ color: '#fca5a5' }}>{error}</span>
            </div>
          )}

          {loadingSections
            ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            : (
              <>
                {/* Unscheduled warning */}
                {unscheduled.length > 0 && (
                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <div className="flex items-start gap-3 px-5 py-3 border-b" style={{ borderColor: 'rgba(251,191,36,0.15)' }}>
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <span className="font-semibold text-sm" style={{ color: '#fcd34d' }}>
                          {unscheduled.length} curso{unscheduled.length > 1 ? 's' : ''} sin horario asignado
                        </span>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(252,211,77,0.65)' }}>
                          Están en tu matrícula pero no tienen sección en el horario actual. Solicita a administración que regenere el horario.
                        </p>
                      </div>
                    </div>
                    <div className="px-5 py-3 flex flex-wrap gap-2">
                      {unscheduled.map(e => {
                        const c = e.course
                        return (
                          <div key={e.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
                            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.18)', color: '#fcd34d' }}>
                            <span className="font-mono">{c?.course_code ?? `#${e.course_id}`}</span>
                            {c?.name && <span style={{ color: 'rgba(252,211,77,0.7)' }}>{c.name}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Calendar */}
                <div className="rounded-2xl overflow-hidden" style={CARD}>
                  <div className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                      <div className="font-bold text-sm" style={{ color: T1 }}>
                        {activeRun ? `Período ${activeRun.academic_period}` : 'Horario'}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: T3 }}>
                        {sections.length > 0
                          ? `${sections.length} sección${sections.length > 1 ? 'es' : ''} · ${totalCredits} créditos`
                          : 'Sin secciones asignadas'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399', boxShadow: '0 0 5px #34d399' }} />
                      <span className="text-xs font-semibold" style={{ color: '#34d399' }}>Activo</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <WeeklyCalendar sections={sections} />
                  </div>
                </div>

                {sections.length === 0 && enrollments.length === 0 && !error && (
                  <div className="text-center py-8 rounded-2xl"
                    style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
                    <p className="text-sm font-semibold" style={{ color: '#22d3ee' }}>No tienes secciones asignadas en este horario</p>
                    <p className="text-xs mt-1" style={{ color: T3 }}>Verifica tu matrícula con administración.</p>
                  </div>
                )}
              </>
            )
          }
        </>
      )}
    </div>
  )
}
