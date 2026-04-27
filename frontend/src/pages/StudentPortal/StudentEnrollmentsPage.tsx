import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { enrollmentsApi, coursesApi, studentsApi } from '../../api'
import type { Enrollment, Course, Student } from '../../types'
import { Spinner } from '../../components/common/Spinner'
import { useUIStore } from '../../store/uiStore'
import clsx from 'clsx'

const CARD = { background: 'var(--sp-card-bg)', border: '1px solid var(--sp-card-border)', borderRadius: 16 }
const T1 = 'var(--sp-t1)'
const T2 = 'var(--sp-t2)'
const T3 = 'var(--sp-t3)'

const STATUS_LABEL: Record<string, string> = {
  enrolled: 'Matriculado', waitlist: 'En espera', withdrawn: 'Retirado', completed: 'Completado'
}
const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  enrolled:  { color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  waitlist:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  withdrawn: { color: T2,       bg: 'rgba(255,255,255,0.06)'  },
  completed: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
}

function currentPeriod() {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() < 7 ? 1 : 2}`
}

const PERIODS = (() => {
  const y = new Date().getFullYear()
  return [`${y - 1}-1`, `${y - 1}-2`, `${y}-1`, `${y}-2`, `${y + 1}-1`]
})()

export default function StudentEnrollmentsPage() {
  const { studentId } = useAuthStore()
  const { addToast } = useUIStore()

  const [period, setPeriod] = useState(currentPeriod())
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [studentData, setStudentData] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'enrolled' | 'available'>('enrolled')

  const maxCredits = studentData?.max_credits ?? 22
  const isResting = studentData?.academic_status === 'resting'
  const isOnProbation = studentData?.academic_status === 'probation'
  const mandatoryId = studentData?.mandatory_course_id ?? null

  const loadEnrollments = async () => {
    if (!studentId) return
    const res = await enrollmentsApi.list({ student_id: studentId, academic_period: period, size: 100 })
    setEnrollments((res as any).items ?? res ?? [])
  }

  useEffect(() => {
    if (!studentId) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      loadEnrollments(),
      coursesApi.list({ size: 200, is_active: true }).then(r => setAllCourses((r as any).items ?? [])),
      studentsApi.get(studentId).then(s => setStudentData(s)),
    ]).finally(() => setLoading(false))
  }, [studentId, period])

  const enrolledIds = new Set(enrollments.filter(e => e.status === 'enrolled').map(e => e.course_id))
  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled')
  const totalCredits = activeEnrollments.reduce((sum, e) => sum + ((e as any).course?.credits ?? 0), 0)
  const creditPct = Math.min((totalCredits / maxCredits) * 100, 100)
  const creditOk = totalCredits <= maxCredits && totalCredits >= 15

  const mandatoryCourse = mandatoryId ? allCourses.find(c => c.id === mandatoryId) : null
  const availableCourses = allCourses.filter(c =>
    !enrolledIds.has(c.id) &&
    (search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.course_code.toLowerCase().includes(search.toLowerCase()))
  )

  const handleEnroll = async (course: Course) => {
    if (!studentId || isResting) return
    setEnrolling(course.id)
    try {
      await enrollmentsApi.create({ student_id: studentId, course_id: course.id, academic_period: period })
      addToast('success', `Matriculado en ${course.name}`)
      await loadEnrollments()
    } catch (err: any) {
      addToast('error', err.message || 'Error al matricular')
    } finally { setEnrolling(null) }
  }

  const handleWithdraw = async (enrollment: Enrollment) => {
    if (!confirm(`¿Retirarte de ${(enrollment as any).course?.name ?? 'este curso'}?`)) return
    setWithdrawing(enrollment.id)
    try {
      await enrollmentsApi.updateStatus(enrollment.id, 'withdrawn')
      addToast('info', 'Retiro registrado')
      await loadEnrollments()
    } catch (err: any) {
      addToast('error', err.message || 'Error al retirar')
    } finally { setWithdrawing(null) }
  }

  return (
    <div className="p-6 xl:p-8 space-y-5 animate-fadeIn">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl px-7 py-5"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220,
            background: 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 65%)' }} />
        </div>
        <div className="relative flex items-start justify-between gap-5 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4" style={{ color: 'rgba(110,231,183,0.8)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(110,231,183,0.7)' }}>Matrículas</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Mis Matrículas</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs" style={{ color: 'rgba(110,231,183,0.6)' }}>Período:</span>
              <select value={period} onChange={e => setPeriod(e.target.value)}
                className="text-xs font-semibold rounded-lg px-2.5 py-1 outline-none"
                style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
                {PERIODS.map(p => <option key={p} value={p} style={{ background: '#065f46' }}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Credit meter */}
          <div className="px-5 py-4 rounded-2xl min-w-[150px]"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-3xl font-black text-white">{totalCredits}</span>
              <span className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>/ {maxCredits} cr.</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${creditPct}%`,
                  background: totalCredits > maxCredits ? '#f87171' : creditPct >= 70 ? '#34d399' : '#fbbf24',
                }} />
            </div>
            <div className="text-[11px] font-semibold mt-1.5"
              style={{ color: creditOk ? '#6ee7b7' : totalCredits > maxCredits ? '#fca5a5' : '#fcd34d' }}>
              {totalCredits > maxCredits ? 'Excede el límite' : creditOk ? 'Carga correcta' : 'Bajo el mínimo'}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {isResting && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#fca5a5' }}>Período de descanso obligatorio</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(252,165,165,0.7)' }}>No puedes realizar nuevas matrículas. Contacta administración.</div>
          </div>
        </div>
      )}

      {isOnProbation && mandatoryCourse && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#fcd34d' }}>Curso obligatorio este semestre</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(252,211,77,0.7)' }}>
              Debes matricularte en: <strong className="text-white">{mandatoryCourse.name} ({mandatoryCourse.course_code})</strong>
              · {mandatoryCourse.credits} créditos · Máximo: {maxCredits} cr.
            </div>
          </div>
        </div>
      )}

      {!studentId && (
        <div className="px-4 py-3.5 rounded-2xl text-sm"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fcd34d' }}>
          Tu cuenta no está vinculada a un estudiante. Contacta a administración.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', maxWidth: 360 }}>
        {[
          { key: 'enrolled',  label: `Mis cursos (${activeEnrollments.length})` },
          { key: 'available', label: 'Matricularme' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150"
            style={tab === key ? {
              background: 'rgba(255,255,255,0.08)',
              color: T1,
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            } : { color: T3 }}>
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {/* ── Tab: Enrolled ── */}
      {!loading && tab === 'enrolled' && (
        <div className="space-y-2.5">
          {enrollments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 rounded-2xl" style={CARD}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <svg className="w-6 h-6" style={{ color: T3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="font-semibold text-sm" style={{ color: T2 }}>Sin matrículas este periodo</p>
              <p className="text-xs mt-1" style={{ color: T3 }}>Usa la pestaña "Matricularme" para inscribirte</p>
            </div>
          )}

          {enrollments.map(enrollment => {
            const course = (enrollment as any).course as Course | undefined
            const isMandatory = course?.id === mandatoryId
            const sc = STATUS_COLOR[enrollment.status] ?? STATUS_COLOR.withdrawn
            return (
              <div key={enrollment.id}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150"
                style={isMandatory ? {
                  background: 'rgba(251,191,36,0.07)',
                  border: '1px solid rgba(251,191,36,0.18)',
                  borderRadius: 16,
                } : CARD}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: isMandatory ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'linear-gradient(135deg, #0e7490, #06b6d4)' }}>
                  {course?.course_code?.slice(0, 2) ?? '??'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate" style={{ color: T1 }}>{course?.name ?? `Curso #${enrollment.course_id}`}</span>
                    {isMandatory && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                        Obligatorio
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px]" style={{ color: T3 }}>
                    <span className="font-mono">{course?.course_code}</span>
                    {course?.credits && <span style={{ color: T2 }}>{course.credits} cr.</span>}
                    {course?.department && <span>{course.department}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}25` }}>
                    {STATUS_LABEL[enrollment.status] ?? enrollment.status}
                  </span>
                  {enrollment.status === 'enrolled' && (
                    <button onClick={() => handleWithdraw(enrollment)} disabled={withdrawing === enrollment.id}
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl transition-all disabled:opacity-50"
                      style={{ color: 'rgba(248,113,113,0.7)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fca5a5' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'rgba(248,113,133,0.7)' }}>
                      {withdrawing === enrollment.id ? '...' : 'Retirar'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Tab: Available ── */}
      {!loading && tab === 'available' && (
        <div className="space-y-4">
          {isResting && (
            <div className="px-4 py-3.5 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>
              No puedes matricularte durante tu período de descanso.
            </div>
          )}

          {!isResting && totalCredits >= maxCredits && (
            <div className="px-4 py-3.5 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>
              Has alcanzado el límite de {maxCredits} créditos. No puedes matricularte en más cursos.
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o código…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: T1,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
            />
          </div>

          {/* Mandatory pinned */}
          {mandatoryCourse && !enrolledIds.has(mandatoryCourse.id) && (
            <div className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
              style={{ background: 'rgba(251,191,36,0.08)', border: '2px solid rgba(251,191,36,0.3)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                {mandatoryCourse.course_code.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate" style={{ color: T1 }}>{mandatoryCourse.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>OBLIGATORIO</span>
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: T3 }}>
                  <span className="font-mono mr-2">{mandatoryCourse.course_code}</span>
                  <span style={{ color: '#fbbf24' }}>{mandatoryCourse.credits} cr.</span>
                </div>
              </div>
              <button onClick={() => handleEnroll(mandatoryCourse)} disabled={enrolling === mandatoryCourse.id || isResting}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', boxShadow: '0 2px 10px rgba(217,119,6,0.3)' }}>
                {enrolling === mandatoryCourse.id ? 'Matriculando...' : 'Matricularme'}
              </button>
            </div>
          )}

          {availableCourses.length === 0 && (
            <div className="flex flex-col items-center py-12 rounded-2xl" style={CARD}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <svg className="w-5 h-5" style={{ color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: T2 }}>
                {search ? 'Sin resultados' : 'Ya estás matriculado en todos los cursos disponibles'}
              </p>
            </div>
          )}

          <div className="space-y-2.5">
            {availableCourses.filter(c => c.id !== mandatoryId).map(course => {
              const isEnrolling = enrolling === course.id
              const overLimit = totalCredits + course.credits > maxCredits
              return (
                <div key={course.id}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150"
                  style={CARD}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    {course.course_code.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: T1 }}>{course.name}</div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px]" style={{ color: T3 }}>
                      <span className="font-mono">{course.course_code}</span>
                      <span style={{ color: '#a78bfa' }}>{course.credits} cr.</span>
                      {course.department && <span>{course.department}</span>}
                      {course.hours_per_week && <span>{course.hours_per_week}h/sem</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {overLimit
                      ? <span className="text-xs font-semibold px-2.5 py-1 rounded-xl"
                          style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>Excede límite</span>
                      : isResting
                        ? <span className="text-xs px-2.5 py-1 rounded-xl" style={{ color: T3 }}>No disponible</span>
                        : <button onClick={() => handleEnroll(course)} disabled={isEnrolling || !studentId}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #0e7490, #06b6d4)', boxShadow: '0 2px 8px rgba(6,182,212,0.25)' }}>
                            {isEnrolling
                              ? <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Matriculando</>
                              : 'Matricularme'
                            }
                          </button>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
