import { useEffect, useState } from 'react'
import { teachersApi } from '../../api'
import type { Teacher } from '../../types'
import { Spinner } from '../../components/common/Spinner'
import { Badge } from '../../components/common/Badge'
import { Modal } from '../../components/common/Modal'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { TeacherForm } from './TeacherForm'
import { useUIStore } from '../../store/uiStore'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { addToast } = useUIStore()
  const SIZE = 10

  const load = () => {
    setLoading(true)
    teachersApi.list({ page, size: SIZE, search: search || undefined })
      .then((res) => { setTeachers(res.items); setTotal(res.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, search])

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (t: Teacher) => { setEditing(t); setModalOpen(true) }
  const onSaved = () => { setModalOpen(false); load(); addToast('success', editing ? 'Docente actualizado' : 'Docente creado') }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await teachersApi.delete(deleteTarget.id)
      setDeleteTarget(null); load(); addToast('success', 'Docente desactivado')
    } catch (e: unknown) {
      addToast('error', e instanceof Error ? e.message : 'Error')
    } finally { setDeleteLoading(false) }
  }

  const pages = Math.ceil(total / SIZE) || 1

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Docentes</h1>
          <p className="text-sm text-gray-500 mt-1">{total} registros</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Nuevo docente</button>
      </div>
      <div className="card mb-6">
        <div className="p-4">
          <input className="input max-w-xs" placeholder="Buscar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} aria-label="Buscar docentes" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                {['Código', 'Nombre', 'Email', 'Departamento', 'Hrs/Semana', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">Sin resultados</td></tr>
              ) : teachers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{t.teacher_code}</td>
                  <td className="px-4 py-3 font-medium">{t.first_name} {t.last_name}</td>
                  <td className="px-4 py-3 text-gray-600">{t.email}</td>
                  <td className="px-4 py-3">{t.department}</td>
                  <td className="px-4 py-3 text-center">{t.max_hours_per_week}</td>
                  <td className="px-4 py-3"><Badge variant={t.is_active ? 'green' : 'gray'}>{t.is_active ? 'Activo' : 'Inactivo'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary py-1 px-3 text-xs" onClick={() => openEdit(t)}>Editar</button>
                      <button className="btn-danger py-1 px-3 text-xs" onClick={() => setDeleteTarget(t)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-gray-500">Página {page} de {pages}</span>
          <div className="flex gap-2">
            <button className="btn-secondary py-1 px-3 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <button className="btn-secondary py-1 px-3 text-xs" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
          </div>
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar docente' : 'Nuevo docente'}>
        <TeacherForm initial={editing} onSaved={onSaved} onCancel={() => setModalOpen(false)} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} loading={deleteLoading} title="Desactivar docente" message={`¿Desactivar a ${deleteTarget?.first_name} ${deleteTarget?.last_name}?`} confirmLabel="Desactivar" />
    </div>
  )
}
