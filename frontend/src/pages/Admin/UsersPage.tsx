import { useEffect, useState } from 'react'
import { authApi, type UserRecord, type UserCreatePayload } from '../../api/auth'
import { studentsApi } from '../../api'
import type { Student } from '../../types'
import { Badge } from '../../components/common/Badge'
import { Modal } from '../../components/common/Modal'
import { Spinner } from '../../components/common/Spinner'

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<UserCreatePayload>({
    username: '',
    email: '',
    password: '',
    role: 'student',
    student_id: null,
  })

  const load = async () => {
    try {
      const [u, s] = await Promise.all([
        authApi.listUsers(),
        studentsApi.list({ limit: 200 }),
      ])
      setUsers(u)
      setStudents((s as any).items ?? s ?? [])
    } catch {
      setError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) {
      setError('Completa todos los campos obligatorios')
      return
    }
    setSaving(true)
    setError('')
    try {
      await authApi.createUser(form)
      setShowModal(false)
      setForm({ username: '', email: '', password: '', role: 'student', student_id: null })
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: UserRecord) => {
    if (!confirm(`¿Eliminar usuario "${user.username}"?`)) return
    try {
      await authApi.deleteUser(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const studentName = (id: string | null) => {
    if (!id) return null
    const s = students.find(st => st.id === id)
    return s ? `${s.first_name} ${s.last_name} (${s.student_code})` : `ID ${id}`
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Administra las cuentas de alumnos y administradores</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError('') }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {error && !showModal && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      {loading
        ? <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Usuario', 'Email', 'Rol', 'Vinculado a', 'Estado', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold`}
                          style={{ background: u.role === 'admin' ? 'linear-gradient(135deg, #6d28d9, #8b5cf6)' : 'linear-gradient(135deg, #2563eb, #0891b2)' }}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{u.email}</td>
                    <td className="px-5 py-4">
                      <Badge variant={u.role === 'admin' ? 'yellow' : 'blue'}>
                        {u.role === 'admin' ? 'Administrador' : 'Alumno'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {u.student_id ? studentName(u.student_id) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={u.is_active ? 'green' : 'red'}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
                        title="Eliminar usuario"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">Sin usuarios registrados</div>
            )}
          </div>
        )
      }

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo usuario"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                placeholder="nombre.usuario"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as any, student_id: null }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
              >
                <option value="student">Alumno</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                placeholder="usuario@ucontinental.edu.pe"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            {form.role === 'student' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vincular a alumno</label>
                <select
                  value={form.student_id ?? ''}
                  onChange={e => setForm(f => ({ ...f, student_id: e.target.value || null }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                >
                  <option value="">Sin vincular</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} — {s.student_code}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}
            >
              {saving ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
