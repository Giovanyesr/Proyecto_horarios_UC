import { useForm } from 'react-hook-form'
import { teachersApi } from '../../api'
import type { Teacher } from '../../types'
import { useState } from 'react'

interface Props { initial: Teacher | null; onSaved: () => void; onCancel: () => void }
interface FormData { teacher_code: string; first_name: string; last_name: string; email: string; department: string; max_hours_per_week: number }

export function TeacherForm({ initial, onSaved, onCancel }: Props) {
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormData>({
    defaultValues: initial ?? { max_hours_per_week: 20 },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      if (initial) await teachersApi.update(initial.id, data)
      else await teachersApi.create(data)
      onSaved()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Código</label>
          <input className="input" {...register('teacher_code', { required: 'Requerido' })} placeholder="T001" />
          {errors.teacher_code && <p className="text-xs text-red-500 mt-1">{errors.teacher_code.message}</p>}
        </div>
        <div>
          <label className="label">Hrs/Semana máx</label>
          <input className="input" type="number" min={1} max={40} {...register('max_hours_per_week', { required: true, valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Nombre</label>
          <input className="input" {...register('first_name', { required: 'Requerido' })} />
          {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
        </div>
        <div>
          <label className="label">Apellido</label>
          <input className="input" {...register('last_name', { required: 'Requerido' })} />
          {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
        </div>
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" {...register('email', { required: 'Requerido' })} />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label">Departamento</label>
        <input className="input" {...register('department', { required: 'Requerido' })} placeholder="Sistemas" />
        {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
