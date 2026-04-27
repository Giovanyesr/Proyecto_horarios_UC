import { useForm } from 'react-hook-form'
import { studentsApi } from '../../api'
import type { Student } from '../../types'
import { useState } from 'react'

interface Props {
  initial: Student | null
  onSaved: () => void
  onCancel: () => void
}

interface FormData {
  student_code: string
  first_name: string
  last_name: string
  email: string
  semester: number
  max_credits: number
}

export function StudentForm({ initial, onSaved, onCancel }: Props) {
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<FormData>({
    defaultValues: initial
      ? {
          student_code: initial.student_code,
          first_name: initial.first_name,
          last_name: initial.last_name,
          email: initial.email,
          semester: initial.semester,
          max_credits: initial.max_credits ?? 22,
        }
      : { max_credits: 22 },
  })

  const maxCredits = watch('max_credits')

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      if (initial) await studentsApi.update(initial.id, data)
      else await studentsApi.create(data)
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Código *</label>
          <input className="input" {...register('student_code', { required: 'Requerido' })} placeholder="U2024001" />
          {errors.student_code && <p className="text-xs text-rose-500 mt-1">{errors.student_code.message}</p>}
        </div>
        <div>
          <label className="label">Semestre *</label>
          <input className="input" type="number" min={1} max={12}
            {...register('semester', { required: true, min: 1, max: 12, valueAsNumber: true })} />
          {errors.semester && <p className="text-xs text-rose-500 mt-1">Semestre 1-12</p>}
        </div>
        <div>
          <label className="label">Nombre *</label>
          <input className="input" {...register('first_name', { required: 'Requerido' })} />
          {errors.first_name && <p className="text-xs text-rose-500 mt-1">{errors.first_name.message}</p>}
        </div>
        <div>
          <label className="label">Apellido *</label>
          <input className="input" {...register('last_name', { required: 'Requerido' })} />
          {errors.last_name && <p className="text-xs text-rose-500 mt-1">{errors.last_name.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Email *</label>
        <input className="input" type="email" {...register('email', { required: 'Requerido' })} />
        {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label mb-0">Créditos máximos</label>
          <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-lg text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' }}>
            {maxCredits}
          </span>
        </div>
        <input
          type="range" min={1} max={25}
          {...register('max_credits', { valueAsNumber: true, min: 1, max: 25 })}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#7c3aed' }}
        />
        <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1.5">
          <span>1 mín.</span>
          <span className="text-amber-500">15 sanción</span>
          <span>22 normal</span>
          <span className="text-violet-600">25 máx.</span>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
