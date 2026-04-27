import { useEffect, useState } from 'react'
import { classroomsApi } from '../../api'
import type { Classroom } from '../../types'
import { Spinner } from '../../components/common/Spinner'
import { Badge } from '../../components/common/Badge'
import { Modal } from '../../components/common/Modal'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { ClassroomForm } from './ClassroomForm'
import { useUIStore } from '../../store/uiStore'

const ROOM_TYPES: Record<string, string> = { lecture: 'Teórico', lab: 'Laboratorio', computer_lab: 'Cómputo', seminar: 'Seminario' }

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Classroom | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Classroom | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { addToast } = useUIStore()
  const SIZE = 10

  const load = () => {
    setLoading(true)
    classroomsApi.list({ page, size: SIZE }).then((res) => { setClassrooms(res.items); setTotal(res.total) }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [page])

  const onSaved = () => { setModalOpen(false); load(); addToast('success', editing ? 'Aula actualizada' : 'Aula creada') }
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try { await classroomsApi.delete(deleteTarget.id); setDeleteTarget(null); load(); addToast('success', 'Aula desactivada') }
    catch (e: unknown) { addToast('error', e instanceof Error ? e.message : 'Error') }
    finally { setDeleteLoading(false) }
  }

  const pages = Math.ceil(total / SIZE) || 1

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Aulas</h1><p className="text-sm text-gray-500 mt-1">{total} registros</p></div>
        <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true) }}>+ Nueva aula</button>
      </div>
      <div className="card mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>{['Código', 'Edificio', 'Capacidad', 'Tipo', 'Proyector', 'Computadoras', 'Estado', 'Acciones'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={8} className="py-12 text-center"><Spinner className="mx-auto" /></td></tr>
              : classrooms.length === 0 ? <tr><td colSpan={8} className="py-12 text-center text-gray-400">Sin resultados</td></tr>
              : classrooms.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{c.room_code}</td>
                  <td className="px-4 py-3">{c.building}</td>
                  <td className="px-4 py-3 text-center">{c.capacity}</td>
                  <td className="px-4 py-3"><Badge variant="blue">{ROOM_TYPES[c.room_type] ?? c.room_type}</Badge></td>
                  <td className="px-4 py-3 text-center">{c.has_projector ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-center">{c.has_computers ? '✓' : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={c.is_active ? 'green' : 'gray'}>{c.is_active ? 'Activo' : 'Inactivo'}</Badge></td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <button className="btn-secondary py-1 px-3 text-xs" onClick={() => { setEditing(c); setModalOpen(true) }}>Editar</button>
                    <button className="btn-danger py-1 px-3 text-xs" onClick={() => setDeleteTarget(c)}>Eliminar</button>
                  </div></td>
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar aula' : 'Nueva aula'}>
        <ClassroomForm initial={editing} onSaved={onSaved} onCancel={() => setModalOpen(false)} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} loading={deleteLoading} title="Desactivar aula" message={`¿Desactivar aula "${deleteTarget?.room_code}"?`} confirmLabel="Desactivar" />
    </div>
  )
}
