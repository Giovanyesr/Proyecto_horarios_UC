import { useEffect, useState } from 'react'
import { coursesApi } from '../../api'
import type { Course } from '../../types'
import { Spinner } from '../../components/common/Spinner'
import { Badge } from '../../components/common/Badge'
import { Modal } from '../../components/common/Modal'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { CourseForm } from './CourseForm'
import { useUIStore } from '../../store/uiStore'

const ROOM_TYPE_LABELS: Record<string, string> = { lecture: 'Teórico', lab: 'Laboratorio', computer_lab: 'Cómputo', seminar: 'Seminario' }

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { addToast } = useUIStore()
  const SIZE = 10

  const load = () => {
    setLoading(true)
    coursesApi.list({ page, size: SIZE, search: search || undefined })
      .then((res) => { setCourses(res.items); setTotal(res.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, search])

  const onSaved = () => { setModalOpen(false); load(); addToast('success', editing ? 'Curso actualizado' : 'Curso creado') }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try { await coursesApi.delete(deleteTarget.id); setDeleteTarget(null); load(); addToast('success', 'Curso desactivado') }
    catch (e: unknown) { addToast('error', e instanceof Error ? e.message : 'Error') }
    finally { setDeleteLoading(false) }
  }

  const pages = Math.ceil(total / SIZE) || 1

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
          <p className="text-sm text-gray-500 mt-1">{total} registros</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true) }}>+ Nuevo curso</button>
      </div>
      <div className="card mb-6">
        <div className="p-4">
          <input className="input max-w-xs" placeholder="Buscar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} aria-label="Buscar cursos" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                {['Código', 'Nombre', 'Créditos', 'Semestre', 'Aula', 'Departamento', 'Prerreq.', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="py-12 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-gray-400">Sin resultados</td></tr>
              ) : courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-blue-700">{c.course_code}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-center">{c.credits}</td>
                  <td className="px-4 py-3 text-center">{c.semester_level}</td>
                  <td className="px-4 py-3"><Badge variant="blue">{ROOM_TYPE_LABELS[c.required_room_type] ?? c.required_room_type}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{c.department}</td>
                  <td className="px-4 py-3 text-center">{c.prerequisites?.length ?? 0}</td>
                  <td className="px-4 py-3"><Badge variant={c.is_active ? 'green' : 'gray'}>{c.is_active ? 'Activo' : 'Inactivo'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary py-1 px-3 text-xs" onClick={() => { setEditing(c); setModalOpen(true) }}>Editar</button>
                      <button className="btn-danger py-1 px-3 text-xs" onClick={() => setDeleteTarget(c)}>Eliminar</button>
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar curso' : 'Nuevo curso'} size="lg">
        <CourseForm initial={editing} onSaved={onSaved} onCancel={() => setModalOpen(false)} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} loading={deleteLoading} title="Desactivar curso" message={`¿Desactivar "${deleteTarget?.name}"?`} confirmLabel="Desactivar" />
    </div>
  )
}
