import { useEffect, useState } from 'react'
import { studentsApi, coursesApi } from '../../api'
import type { Student, Course } from '../../types'
import { Spinner } from '../../components/common/Spinner'
import { Modal } from '../../components/common/Modal'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { StudentForm } from './StudentForm'
import { useUIStore } from '../../store/uiStore'

const ACADEMIC_STATUS = {
  active:    { label: 'Activo', color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' },
  probation: { label: 'Observación', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  resting:   { label: 'Descanso', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

interface CreditForm {
  max_credits: number
  academic_status: string
  mandatory_course_id: string | null
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [creditTarget, setCreditTarget] = useState<Student | null>(null)
  const [creditForm, setCreditForm] = useState<CreditForm>({ max_credits: 22, academic_status: 'active', mandatory_course_id: null })
  const [savingCredits, setSavingCredits] = useState(false)
  const { addToast } = useUIStore()
  const SIZE = 10

  const load = () => {
    setLoading(true)
    studentsApi.list({ page, size: SIZE, search: search || undefined })
      .then((res) => {
        setStudents(res.items ?? [])
        setTotal(res.total ?? 0)
      })
      .catch((err: unknown) => {
        addToast('error', err instanceof Error ? err.message : 'Error al cargar estudiantes')
      })
      .finally(() => setLoading(false))

    if (courses.length === 0) {
      coursesApi.list({ size: 200 })
        .then((res) => setCourses((res as any).items ?? []))
        .catch(() => { /* cursos opcionales */ })
    }
  }

  useEffect(() => { load() }, [page, search])

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (s: Student) => { setEditing(s); setModalOpen(true) }
  const onSaved = () => { setModalOpen(false); load(); addToast('success', editing ? 'Estudiante actualizado' : 'Estudiante creado') }

  const openCreditModal = (s: Student) => {
    setCreditTarget(s)
    setCreditForm({
      max_credits: s.max_credits ?? 22,
      academic_status: s.academic_status ?? 'active',
      mandatory_course_id: s.mandatory_course_id ?? null,
    })
  }

  const saveCredits = async () => {
    if (!creditTarget) return
    setSavingCredits(true)
    try {
      await studentsApi.setAcademic(creditTarget.id, creditForm)
      addToast('success', 'Configuración académica actualizada')
      setCreditTarget(null)
      load()
    } catch (err: any) {
      addToast('error', err.message || 'Error al actualizar')
    } finally {
      setSavingCredits(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await studentsApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      load()
      addToast('success', 'Estudiante desactivado')
    } catch (e: unknown) {
      addToast('error', e instanceof Error ? e.message : 'Error al eliminar')
    } finally {
      setDeleteLoading(false)
    }
  }

  const pages = Math.ceil(total / SIZE) || 1
  const mandatoryCourseName = (id: string | null) => {
    if (!id) return null
    const c = courses.find(c => c.id === id)
    return c ? `${c.name} (${c.course_code})` : `#${id}`
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Estudiantes</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">{total} registros en total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-md hover:opacity-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo estudiante
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white placeholder-slate-400 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none shadow-sm"
          placeholder="Buscar por nombre, código o email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #faf5ff, #f5f3ff)' }}>
                {['Estudiante', 'Email', 'Semestre', 'Créditos máx.', 'Estado académico', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <div className="text-4xl mb-2">👩‍🎓</div>
                  <p className="text-slate-400 text-sm font-medium">Sin resultados</p>
                </td></tr>
              ) : students.map((s) => {
                const status = ACADEMIC_STATUS[s.academic_status ?? 'active'] ?? ACADEMIC_STATUS.active
                const creditPct = Math.min(((s.max_credits ?? 22) / 25) * 100, 100)
                return (
                  <tr key={s.id} className="hover:bg-violet-50/20 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}>
                          {s.first_name[0]}{s.last_name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{s.first_name} {s.last_name}</div>
                          <div className="text-xs text-slate-400 font-mono">{s.student_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{s.email}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                        {s.semester}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => openCreditModal(s)} className="flex items-center gap-2 group/btn hover:opacity-80 transition-opacity">
                        <div className="relative flex-shrink-0">
                          <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#7c3aed" strokeWidth="3"
                              strokeDasharray={`${creditPct * 0.88} 88`}
                              strokeLinecap="round" className="transition-all duration-500" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-violet-700">
                            {s.max_credits ?? 22}
                          </span>
                        </div>
                        <div className="text-left hidden group-hover/btn:block">
                          <div className="text-[10px] text-slate-400 leading-tight">de 25 máx.</div>
                          <div className="text-[10px] text-violet-600 font-bold">Editar</div>
                        </div>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold border"
                          style={{ background: status.bg, color: status.color, borderColor: status.border }}>
                          {status.label}
                        </span>
                        {s.mandatory_course_id && (
                          <div className="text-[10px] text-amber-600 mt-1 font-medium">
                            Oblig.: {mandatoryCourseName(s.mandatory_course_id)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${s.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {s.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openCreditModal(s)} title="Configurar créditos"
                          className="p-2 rounded-xl text-violet-500 hover:bg-violet-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button onClick={() => openEdit(s)} title="Editar"
                          className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteTarget(s)} title="Desactivar"
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50">
          <span className="text-sm text-slate-400 font-medium">Página {page} de {pages} · {total} registros</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <button className="px-3 py-1.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
          </div>
        </div>
      </div>

      {/* Credit configuration modal */}
      <Modal open={!!creditTarget} onClose={() => setCreditTarget(null)} title="Configuración Académica">
        {creditTarget && (
          <div className="space-y-5">
            {/* Student info */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}>
                {creditTarget.first_name[0]}{creditTarget.last_name[0]}
              </div>
              <div>
                <div className="font-bold text-slate-900">{creditTarget.first_name} {creditTarget.last_name}</div>
                <div className="text-xs text-slate-400">{creditTarget.student_code} · Semestre {creditTarget.semester}</div>
              </div>
            </div>

            {/* Credit slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-700">Créditos máximos permitidos</label>
                <span className="inline-flex items-center justify-center min-w-[2.5rem] h-8 px-2 rounded-xl text-white text-sm font-extrabold"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' }}>
                  {creditForm.max_credits}
                </span>
              </div>
              <input
                type="range" min={1} max={25} value={creditForm.max_credits}
                onChange={e => setCreditForm(f => ({ ...f, max_credits: Number(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: '#7c3aed' }}
              />
              <div className="flex justify-between text-[10px] font-bold mt-2 text-slate-400">
                <span>1</span>
                <span className="text-amber-500">15 (sanción)</span>
                <span className="text-slate-500">22 (normal)</span>
                <span className="text-violet-600">25 (máx)</span>
              </div>

              {/* Rules explanation */}
              <div className="mt-3 rounded-xl p-3.5 text-xs" style={{ background: '#fefce8', border: '1px solid #fde68a' }}>
                <div className="font-bold text-amber-800 mb-1.5">📋 Reglas académicas</div>
                <ul className="space-y-1 text-amber-700">
                  <li>• El alumno puede llevar hasta <strong>25 créditos</strong> como máximo.</li>
                  <li>• Si jala un curso <strong>2 semestres seguidos</strong> → créditos reducidos a <strong>15</strong> y ese curso es obligatorio el 3er semestre.</li>
                  <li>• Si jala el mismo curso <strong>un año entero</strong> (2 semestres) → <strong>año de descanso</strong> sin matrícula.</li>
                </ul>
              </div>
            </div>

            {/* Academic status */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5">Estado académico</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'active', label: 'Activo', desc: 'Carga normal', icon: '✅' },
                  { value: 'probation', label: 'Observación', desc: 'Cred. reducidos', icon: '⚠️' },
                  { value: 'resting', label: 'Descanso', desc: 'Sin matrícula', icon: '🚫' },
                ].map(({ value, label, desc, icon }) => {
                  const s = ACADEMIC_STATUS[value as keyof typeof ACADEMIC_STATUS]
                  const isSelected = creditForm.academic_status === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setCreditForm(f => ({
                          ...f,
                          academic_status: value,
                          max_credits: value === 'probation' && f.max_credits > 15 ? 15 : f.max_credits,
                        }))
                      }}
                      className="p-3 rounded-xl border-2 text-left transition-all duration-150"
                      style={isSelected ? {
                        background: s.bg, color: s.color, borderColor: s.border,
                      } : {
                        background: 'white', color: '#64748b', borderColor: '#e2e8f0',
                      }}
                    >
                      <div className="text-base mb-1">{icon}</div>
                      <div className="text-xs font-bold">{label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mandatory course */}
            {creditForm.academic_status === 'probation' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Curso obligatorio
                  <span className="ml-1 text-xs font-medium text-slate-400">(que debe llevar obligatoriamente)</span>
                </label>
                <select
                  value={creditForm.mandatory_course_id ?? ''}
                  onChange={e => setCreditForm(f => ({ ...f, mandatory_course_id: e.target.value || null }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none bg-white"
                >
                  <option value="">Sin curso obligatorio</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.course_code}) — {c.credits} cr.</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setCreditTarget(null)}
                className="px-4 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
                Cancelar
              </button>
              <button type="button" onClick={saveCredits} disabled={savingCredits}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 shadow-sm hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' }}>
                {savingCredits ? 'Guardando...' : 'Guardar configuración'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar estudiante' : 'Nuevo estudiante'}>
        <StudentForm initial={editing} onSaved={onSaved} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Desactivar estudiante"
        message={`¿Desactivar a ${deleteTarget?.first_name} ${deleteTarget?.last_name}?`}
        confirmLabel="Desactivar"
      />
    </div>
  )
}
