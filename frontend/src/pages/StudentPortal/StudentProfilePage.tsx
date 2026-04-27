import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { studentsApi } from '../../api'
import type { Student } from '../../types'
import { Spinner } from '../../components/common/Spinner'
import { useUIStore } from '../../store/uiStore'
import { useForm } from 'react-hook-form'

interface ProfileForm { first_name: string; last_name: string; email: string }

const ACADEMIC: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Activo',            color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
  probation: { label: 'En observación',    color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  resting:   { label: 'Año de descanso',   color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
}

const SEMESTER_LABELS = ['Primer','Segundo','Tercer','Cuarto','Quinto','Sexto','Sétimo','Octavo','Noveno','Décimo']
const semLabel = (n: number) => `${SEMESTER_LABELS[n - 1] ?? n + 'vo'} Semestre`

const CARD = { background: 'var(--sp-card-bg)', border: '1px solid var(--sp-card-border)', borderRadius: 16 }

export default function StudentProfilePage() {
  const { username, studentId } = useAuthStore()
  const { addToast } = useUIStore()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>()

  const load = async () => {
    if (!studentId) { setLoading(false); return }
    try {
      const s = await studentsApi.get(studentId)
      setStudent(s)
      reset({ first_name: s.first_name, last_name: s.last_name, email: s.email })
    } catch { addToast('error', 'No se pudo cargar tu perfil') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [studentId])

  const onSubmit = async (data: ProfileForm) => {
    if (!studentId || !student) return
    setSaving(true)
    try {
      const updated = await studentsApi.update(studentId, {
        first_name: data.first_name.trim(), last_name: data.last_name.trim(), email: data.email.trim(),
      })
      setStudent(updated); setEditing(false)
      addToast('success', 'Perfil actualizado correctamente')
    } catch (err: any) { addToast('error', err.message || 'Error al actualizar') }
    finally { setSaving(false) }
  }

  const creditPct = student ? Math.min((student.max_credits / 25) * 100, 100) : 0
  const acInfo = ACADEMIC[student?.academic_status ?? 'active'] ?? ACADEMIC.active

  const inputStyle: React.CSSProperties = {
    background: 'var(--sp-input-bg)',
    border: '1px solid var(--sp-input-brd)',
    color: 'var(--sp-input-txt)',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 13,
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div className="p-6 xl:p-8 space-y-5 animate-fadeIn">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl px-7 py-5"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 45%, #2563eb 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div style={{ position: 'absolute', top: -50, right: -40, width: 220, height: 220,
            background: 'radial-gradient(circle, rgba(147,197,253,0.15) 0%, transparent 65%)' }} />
        </div>
        <div className="relative flex items-center gap-2 mb-1">
          <svg className="w-4 h-4" style={{ color: 'rgba(147,197,253,0.8)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(147,197,253,0.7)' }}>Perfil</span>
        </div>
        <h1 className="relative text-2xl font-extrabold text-white">Mi Perfil</h1>
        <p className="relative text-sm mt-0.5" style={{ color: 'rgba(147,197,253,0.6)' }}>Consulta y actualiza tu información académica</p>
      </div>

      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {!loading && !studentId && (
        <div className="flex flex-col items-center py-14 rounded-2xl" style={CARD}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <svg className="w-6 h-6" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="font-bold text-sm" style={{ color: 'var(--sp-t1)' }}>Cuenta no vinculada</p>
          <p className="text-xs mt-1" style={{ color: 'var(--sp-t3)' }}>Comunícate con administración para vincular tu cuenta.</p>
        </div>
      )}

      {!loading && student && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: avatar + info (spans 2 cols) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Avatar banner */}
            <div className="rounded-2xl overflow-hidden" style={CARD}>
              <div className="relative px-6 py-5 flex items-center gap-5 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #2563eb 100%)' }}>
                <div className="pointer-events-none absolute inset-0">
                  <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160,
                    background: 'radial-gradient(circle, rgba(147,197,253,0.12) 0%, transparent 65%)' }} />
                </div>
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {student.first_name[0]}{student.last_name[0]}
                </div>
                <div className="relative">
                  <h2 className="text-white text-xl font-extrabold">{student.first_name} {student.last_name}</h2>
                  <p className="text-sm mt-0.5 font-mono" style={{ color: 'rgba(147,197,253,0.7)' }}>{student.student_code}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(255,255,255,0.12)', color: '#bfdbfe' }}>
                      {semLabel(student.semester)}
                    </span>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${student.is_active ? 'bg-emerald-400/20 text-emerald-200' : 'bg-rose-400/20 text-rose-200'}`}>
                      {student.is_active ? '● Activo' : '● Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info / edit form */}
              <div className="p-6">
                {!editing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sp-t3)' }}>
                        Información personal
                      </span>
                      <button onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                        style={{ color: '#60a5fa' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#93c5fd')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#60a5fa')}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                      {[
                        { label: 'Nombre',          value: student.first_name },
                        { label: 'Apellido',         value: student.last_name },
                        { label: 'Correo',           value: student.email },
                        { label: 'Código',           value: student.student_code },
                        { label: 'Semestre',         value: semLabel(student.semester) },
                        { label: 'Miembro desde',    value: new Date(student.created_at).toLocaleDateString('es') },
                      ].map(({ label, value }) => (
                        <div key={label} className="col-span-2 sm:col-span-1">
                          <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--sp-t3)' }}>{label}</div>
                          <div className="text-sm font-semibold" style={{ color: 'var(--sp-t1)' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] pt-3" style={{ color: 'var(--sp-t3)', borderTop: '1px solid var(--sp-divider)' }}>
                      El código y semestre solo pueden modificarse por administración.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sp-t3)' }}>
                        Editar información
                      </span>
                      <button type="button" onClick={() => { setEditing(false); reset() }}
                        className="text-xs font-medium transition-colors" style={{ color: 'var(--sp-t3)' }}>
                        Cancelar
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--sp-t3)' }}>Nombre *</label>
                        <input style={inputStyle}
                          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                          onBlur={e => (e.currentTarget.style.borderColor = 'var(--sp-input-brd)')}
                          {...register('first_name', { required: 'Requerido', minLength: { value: 2, message: 'Min. 2 chars' } })} />
                        {errors.first_name && <p className="text-xs mt-1 text-rose-400">{errors.first_name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--sp-t3)' }}>Apellido *</label>
                        <input style={inputStyle}
                          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                          onBlur={e => (e.currentTarget.style.borderColor = 'var(--sp-input-brd)')}
                          {...register('last_name', { required: 'Requerido', minLength: { value: 2, message: 'Min. 2 chars' } })} />
                        {errors.last_name && <p className="text-xs mt-1 text-rose-400">{errors.last_name.message}</p>}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--sp-t3)' }}>Correo *</label>
                        <input type="email" style={inputStyle}
                          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                          onBlur={e => (e.currentTarget.style.borderColor = 'var(--sp-input-brd)')}
                          {...register('email', { required: 'Requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' } })} />
                        {errors.email && <p className="text-xs mt-1 text-rose-400">{errors.email.message}</p>}
                      </div>
                    </div>
                    <div className="px-3 py-2.5 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--sp-t3)', border: '1px solid var(--sp-divider)' }}>
                      Solo lectura: <strong style={{ color: 'var(--sp-t2)' }}>Código</strong> y <strong style={{ color: 'var(--sp-t2)' }}>Semestre</strong>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => { setEditing(false); reset() }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{ background: 'var(--sp-card-bg)', color: 'var(--sp-t2)', border: '1px solid var(--sp-card-border)' }}>
                        Cancelar
                      </button>
                      <button type="submit" disabled={saving}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
                        {saving ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right: academic status + account */}
          <div className="space-y-4">

            {/* Academic status */}
            <div className="p-5 rounded-2xl space-y-4" style={CARD}>
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sp-t3)' }}>
                Estado Académico
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl"
                style={{ background: acInfo.bg, border: `1px solid ${acInfo.color}30` }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: acInfo.color, boxShadow: `0 0 6px ${acInfo.color}` }} />
                <div>
                  <div className="font-bold text-sm" style={{ color: acInfo.color }}>{acInfo.label}</div>
                </div>
              </div>

              {/* Credit bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--sp-t3)' }}>Créditos permitidos</span>
                  <span className="font-extrabold text-sm" style={{ color: 'var(--sp-t1)' }}>
                    {student.max_credits} <span className="font-normal text-xs" style={{ color: 'var(--sp-t3)' }}>/ 25</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--sp-grid-cell)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${creditPct}%`,
                      background: student.max_credits >= 22
                        ? 'linear-gradient(90deg, #059669, #34d399)'
                        : student.max_credits >= 15
                        ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                        : 'linear-gradient(90deg, #dc2626, #f87171)',
                    }} />
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: 'var(--sp-t3)' }}>
                  Máximo del sistema: 25 créditos
                </p>
              </div>

              {student.academic_status === 'probation' && student.mandatory_course_id && (
                <div className="px-3 py-2.5 rounded-xl text-xs"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fcd34d' }}>
                  Tienes un curso obligatorio asignado. Revisa tus matrículas.
                </div>
              )}
            </div>

            {/* Account */}
            <div className="p-5 rounded-2xl" style={CARD}>
              <div className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--sp-t3)' }}>
                Cuenta de acceso
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  {username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--sp-t1)' }}>{username}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--sp-t3)' }}>Portal del Alumno · Horario</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
