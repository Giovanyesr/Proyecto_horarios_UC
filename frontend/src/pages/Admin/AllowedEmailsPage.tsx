import { useEffect, useState } from 'react'
import { authApi, type AllowedEmailRecord } from '../../api/auth'
import { studentsApi } from '../../api'
import type { Student } from '../../types'
import { Modal } from '../../components/common/Modal'
import { Spinner } from '../../components/common/Spinner'
import { useUIStore } from '../../store/uiStore'

export default function AllowedEmailsPage() {
  const [emails, setEmails] = useState<AllowedEmailRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [form, setForm] = useState({ email: '', student_id: '', notes: '' })
  const { addToast } = useUIStore()

  const load = async () => {
    try {
      const [e, s] = await Promise.all([
        authApi.listAllowedEmails(),
        studentsApi.list({ limit: 300 }),
      ])
      setEmails(e)
      setStudents((s as any).items ?? s ?? [])
    } catch {
      addToast('error', 'Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim()) return
    setSaving(true)
    try {
      await authApi.createAllowedEmail({
        email: form.email.trim(),
        student_id: form.student_id || null,
        notes: form.notes.trim() || null,
      })
      addToast('success', `Correo autorizado: ${form.email.trim()}`)
      setForm({ email: '', student_id: '', notes: '' })
      setShowModal(false)
      await load()
    } catch (err: any) {
      addToast('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault()
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) return
    setSaving(true)
    let ok = 0; let fail = 0
    for (const line of lines) {
      try {
        await authApi.createAllowedEmail({ email: line })
        ok++
      } catch { fail++ }
    }
    addToast('success', `${ok} correos añadidos${fail ? `, ${fail} ya existían` : ''}`)
    setBulkText('')
    setShowModal(false)
    await load()
    setSaving(false)
  }

  const handleDelete = async (entry: AllowedEmailRecord) => {
    if (!confirm(`¿Quitar autorización para "${entry.email}"?`)) return
    try {
      await authApi.deleteAllowedEmail(entry.id)
      setEmails(prev => prev.filter(e => e.id !== entry.id))
      addToast('success', 'Correo eliminado')
    } catch (err: any) {
      addToast('error', err.message)
    }
  }

  const studentName = (id: string | null) => {
    if (!id) return null
    const s = students.find(st => st.id === id)
    return s ? `${s.first_name} ${s.last_name}` : `#${id}`
  }

  const total = emails.length
  const used = emails.filter(e => e.is_used).length
  const pending = total - used

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Correos Autorizados</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona los correos que pueden auto-registrarse como alumnos en el portal
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Autorizar correo(s)
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total autorizados', value: total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Pendientes de registro', value: pending, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Ya registrados', value: used, color: 'text-emerald-700', bg: 'bg-emerald-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-gray-100`}>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-gray-500 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Flow explanation */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-blue-800 text-sm">
            <strong>¿Cómo funciona?</strong> El alumno va a{' '}
            <code className="bg-blue-100 px-1 rounded text-xs">/register</code>,
            ingresa su correo autorizado y crea su cuenta. Si vinculas el correo a un estudiante existente,
            la cuenta queda automáticamente asociada a su expediente.
          </div>
        </div>
      </div>

      {/* Table */}
      {loading
        ? <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {emails.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="font-medium text-gray-500">Sin correos autorizados</p>
                <p className="text-sm mt-1">Añade correos para que los alumnos puedan registrarse</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Correo electrónico', 'Alumno vinculado', 'Estado', 'Notas', 'Creado', ''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {emails.map(entry => (
                    <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900">{entry.email}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">
                        {entry.student_id
                          ? <span className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
                                {studentName(entry.student_id)?.[0] ?? '?'}
                              </div>
                              {studentName(entry.student_id)}
                            </span>
                          : <span className="text-gray-300">Sin vincular</span>
                        }
                      </td>
                      <td className="px-5 py-4">
                        {entry.is_used
                          ? <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Registrado
                            </span>
                          : <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Pendiente
                            </span>
                        }
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs max-w-xs truncate">
                        {entry.notes || '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">
                        {new Date(entry.created_at).toLocaleDateString('es')}
                      </td>
                      <td className="px-5 py-4">
                        {!entry.is_used && (
                          <button
                            onClick={() => handleDelete(entry)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
                            title="Revocar autorización"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      }

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Autorizar correo(s)" size="md">
        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm">
            <button
              onClick={() => setBulkMode(false)}
              className={`flex-1 py-2.5 font-medium transition-colors ${!bulkMode ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Un correo
            </button>
            <button
              onClick={() => setBulkMode(true)}
              className={`flex-1 py-2.5 font-medium transition-colors ${bulkMode ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Varios correos
            </button>
          </div>

          {!bulkMode ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="alumno@ucontinental.edu.pe"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vincular a alumno (opcional)
                </label>
                <select
                  value={form.student_id}
                  onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                >
                  <option value="">Sin vincular</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} — {s.student_code}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Ej: Semestre 2026-1, sección A"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}>
                  {saving ? 'Autorizando...' : 'Autorizar correo'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleBulk} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correos (uno por línea)
                </label>
                <textarea
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  rows={8}
                  placeholder={'alumno1@ucontinental.edu.pe\nalumno2@ucontinental.edu.pe\nalumno3@ucontinental.edu.pe'}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none font-mono resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {bulkText.split('\n').filter(l => l.trim()).length} correo(s) detectados
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving || !bulkText.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}>
                  {saving ? 'Autorizando...' : `Autorizar ${bulkText.split('\n').filter(l => l.trim()).length} correo(s)`}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  )
}
