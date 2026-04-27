import { useEffect, useState } from 'react'
import { studentsApi, coursesApi, enrollmentsApi } from '../../api'
import type { Student, Course, Enrollment, CreditSummary } from '../../types'
import { Spinner } from '../../components/common/Spinner'
import { Badge } from '../../components/common/Badge'
import { useUIStore } from '../../store/uiStore'
import clsx from 'clsx'

export default function EnrollmentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | ''>('')
  const [period, setPeriod] = useState('2026-1')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [summary, setSummary] = useState<CreditSummary | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | ''>('')
  const [loading, setLoading] = useState(false)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const { addToast } = useUIStore()

  useEffect(() => {
    studentsApi.list({ size: 100, is_active: true }).then(r => setStudents(r.items))
    coursesApi.list({ size: 100, is_active: true }).then(r => setCourses(r.items))
  }, [])

  useEffect(() => {
    if (!selectedStudent || !period) return
    setLoading(true)
    Promise.all([
      enrollmentsApi.list({ student_id: selectedStudent, academic_period: period, size: 50 }),
      enrollmentsApi.creditsSummary(selectedStudent, period),
    ]).then(([e, s]) => {
      setEnrollments(e.items)
      setSummary(s)
    }).catch(() => {
      setEnrollments([])
      setSummary(null)
    }).finally(() => setLoading(false))
  }, [selectedStudent, period])

  const enrolledCourseIds = enrollments.map(e => e.course_id)
  const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.id))

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourseId || !period) return
    setEnrollLoading(true)
    try {
      await enrollmentsApi.create({ student_id: selectedStudent, course_id: selectedCourseId, academic_period: period })
      addToast('success', 'Matrícula registrada exitosamente')
      setSelectedCourseId('')
      // Reload
      const [e, s] = await Promise.all([
        enrollmentsApi.list({ student_id: selectedStudent, academic_period: period, size: 50 }),
        enrollmentsApi.creditsSummary(selectedStudent, period),
      ])
      setEnrollments(e.items)
      setSummary(s)
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Error al matricular')
    } finally {
      setEnrollLoading(false)
    }
  }

  const handleWithdraw = async (enrollmentId: string) => {
    try {
      await enrollmentsApi.updateStatus(enrollmentId, 'withdrawn')
      addToast('info', 'Retiro registrado')
      const [e, s] = await Promise.all([
        enrollmentsApi.list({ student_id: selectedStudent, academic_period: period, size: 50 }),
        enrollmentsApi.creditsSummary(selectedStudent, period),
      ])
      setEnrollments(e.items)
      setSummary(s)
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Error')
    }
  }

  const totalCredits = summary?.total_credits ?? 0
  const creditStatus = totalCredits < 20 ? 'under' : totalCredits > 22 ? 'over' : 'ok'

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Matrículas</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Selectors */}
        <div className="space-y-4">
          <div className="card p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Seleccionar estudiante</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Estudiante</label>
                <select className="input" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value || '')} aria-label="Seleccionar estudiante">
                  <option value="">-- Seleccionar --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.student_code})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Período académico</label>
                <input className="input" value={period} onChange={e => setPeriod(e.target.value)} placeholder="2026-1" />
              </div>
            </div>
          </div>

          {/* Credit counter */}
          {selectedStudent && (
            <div className={clsx('card p-4', creditStatus === 'ok' ? 'border-green-300' : creditStatus === 'under' ? 'border-yellow-300' : 'border-red-300')}>
              <h2 className="font-semibold text-gray-900 mb-2">Créditos</h2>
              <div className={clsx('text-4xl font-bold mb-1', creditStatus === 'ok' ? 'text-green-600' : creditStatus === 'under' ? 'text-yellow-600' : 'text-red-600')}>
                {totalCredits}<span className="text-sm font-normal text-gray-500"> / 20-22</span>
              </div>
              <p className="text-xs text-gray-500">
                {creditStatus === 'ok' ? '✅ Dentro del límite' : creditStatus === 'under' ? '⚠️ Por debajo del mínimo' : '❌ Excede el límite'}
              </p>
            </div>
          )}
        </div>

        {/* Center: Enroll form */}
        <div className="card p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Agregar curso</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Curso disponible</label>
              <select className="input" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value || '')} disabled={!selectedStudent} aria-label="Seleccionar curso">
                <option value="">-- Seleccionar curso --</option>
                {availableCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.course_code} — {c.name} ({c.credits} cred.)</option>
                ))}
              </select>
            </div>
            <button
              className="btn-primary w-full"
              disabled={!selectedStudent || !selectedCourseId || enrollLoading}
              onClick={handleEnroll}
            >
              {enrollLoading ? <><Spinner size="sm" /> Matriculando...</> : '+ Matricular'}
            </button>
          </div>
        </div>

        {/* Right: Enrolled courses */}
        <div className="card p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Cursos matriculados</h2>
          {loading ? <Spinner className="mx-auto block mt-4" />
          : !selectedStudent ? <p className="text-sm text-gray-400">Selecciona un estudiante</p>
          : enrollments.length === 0 ? <p className="text-sm text-gray-400">Sin matrículas en este período</p>
          : (
            <div className="space-y-2">
              {enrollments.map(e => (
                <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                  <div>
                    <span className="font-mono text-xs text-blue-700">{e.course?.course_code}</span>
                    <span className="ml-2">{e.course?.name}</span>
                    <span className="ml-2 text-gray-500">({e.course?.credits} cr.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={e.status === 'enrolled' ? 'green' : e.status === 'withdrawn' ? 'gray' : 'yellow'}>
                      {e.status === 'enrolled' ? 'Activo' : e.status === 'withdrawn' ? 'Retirado' : e.status}
                    </Badge>
                    {e.status === 'enrolled' && (
                      <button className="text-xs text-red-500 hover:underline" onClick={() => handleWithdraw(e.id)}>Retirar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
