import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { coursesApi } from '../../api'
import type { Course } from '../../types'

interface Props { initial: Course | null; onSaved: () => void; onCancel: () => void }
interface FormData {
  course_code: string; name: string; credits: number; hours_per_week: number
  semester_level: number; required_room_type: string; min_students: number; max_students: number; department: string
}

const ROOM_TYPES = [{ value: 'lecture', label: 'Teórico' }, { value: 'lab', label: 'Laboratorio' }, { value: 'computer_lab', label: 'Cómputo' }, { value: 'seminar', label: 'Seminario' }]

export function CourseForm({ initial, onSaved, onCancel }: Props) {
  const [error, setError] = useState('')
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>([])

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormData>({
    defaultValues: initial ?? { required_room_type: 'lecture', min_students: 5, max_students: 30, credits: 4, hours_per_week: 4, semester_level: 1 },
  })

  useEffect(() => {
    coursesApi.list({ size: 100 }).then((r) => setAllCourses(r.items.filter(c => c.id !== initial?.id)))
    if (initial) setSelectedPrereqs(initial.prerequisites?.map(p => String(p.id)) ?? [])
  }, [initial?.id])

  const togglePrereq = (id: string) => setSelectedPrereqs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const payload = { ...data, prerequisite_ids: selectedPrereqs }
      if (initial) {
        await coursesApi.update(initial.id, data)
        // Sync prerequisites
        const current = initial.prerequisites?.map(p => p.id) ?? []
        for (const id of selectedPrereqs.filter(id => !current.includes(id)))
          await coursesApi.addPrerequisite(initial.id, id)
        for (const id of current.filter(id => !selectedPrereqs.includes(id)))
          await coursesApi.removePrerequisite(initial.id, id)
      } else {
        await coursesApi.create(payload)
      }
      onSaved()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Código</label>
          <input className="input" {...register('course_code', { required: 'Requerido' })} placeholder="SI101" />
          {errors.course_code && <p className="text-xs text-red-500 mt-1">{errors.course_code.message}</p>}
        </div>
        <div>
          <label className="label">Departamento</label>
          <input className="input" {...register('department', { required: 'Requerido' })} placeholder="Sistemas" />
        </div>
        <div className="col-span-2">
          <label className="label">Nombre del curso</label>
          <input className="input" {...register('name', { required: 'Requerido' })} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Créditos (1-10)</label>
          <input className="input" type="number" min={1} max={10} {...register('credits', { required: true, valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Horas/Semana</label>
          <input className="input" type="number" min={1} max={20} {...register('hours_per_week', { required: true, valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Nivel de semestre</label>
          <input className="input" type="number" min={1} max={12} {...register('semester_level', { required: true, valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Tipo de aula</label>
          <select className="input" {...register('required_room_type')}>
            {ROOM_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Min. estudiantes</label>
          <input className="input" type="number" min={1} {...register('min_students', { required: true, valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Max. estudiantes</label>
          <input className="input" type="number" min={1} {...register('max_students', { required: true, valueAsNumber: true })} />
        </div>
      </div>
      {allCourses.length > 0 && (
        <div>
          <label className="label">Prerrequisitos</label>
          <div className="border rounded-lg max-h-32 overflow-y-auto divide-y">
            {allCourses.map(c => (
              <label key={c.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                <input type="checkbox" checked={selectedPrereqs.includes(c.id)} onChange={() => togglePrereq(c.id)} />
                <span className="font-mono text-xs text-blue-700">{c.course_code}</span> {c.name}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
