import { useForm } from 'react-hook-form'
import { classroomsApi } from '../../api'
import type { Classroom } from '../../types'
import { useState } from 'react'

interface Props { initial: Classroom | null; onSaved: () => void; onCancel: () => void }
interface FormData { room_code: string; building: string; capacity: number; room_type: string; has_projector: boolean; has_computers: boolean }

export function ClassroomForm({ initial, onSaved, onCancel }: Props) {
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: initial ?? { room_type: 'lecture', has_projector: false, has_computers: false, capacity: 30 },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      if (initial) await classroomsApi.update(initial.id, data)
      else await classroomsApi.create(data)
      onSaved()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Código</label><input className="input" {...register('room_code', { required: true })} placeholder="A101" /></div>
        <div><label className="label">Edificio</label><input className="input" {...register('building', { required: true })} placeholder="A" /></div>
        <div><label className="label">Capacidad</label><input className="input" type="number" min={1} {...register('capacity', { required: true, valueAsNumber: true })} /></div>
        <div><label className="label">Tipo</label>
          <select className="input" {...register('room_type')}>
            {[['lecture', 'Teórico'], ['lab', 'Laboratorio'], ['computer_lab', 'Cómputo'], ['seminar', 'Seminario']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" {...register('has_projector')} /> Proyector</label>
        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" {...register('has_computers')} /> Computadoras</label>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
