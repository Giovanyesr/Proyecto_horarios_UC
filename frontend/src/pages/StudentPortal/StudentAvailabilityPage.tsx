import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { studentsApi } from '../../api'
import type { AvailabilitySlot } from '../../types'
import { Spinner } from '../../components/common/Spinner'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`)

function slotKey(day: number, hour: string) { return `${day}-${hour}` }

function parseSlots(slots: AvailabilitySlot[]): Set<string> {
  const keys = new Set<string>()
  slots.forEach(s => {
    const startH = parseInt(s.start_time.split(':')[0])
    const endH = parseInt(s.end_time.split(':')[0])
    for (let h = startH; h < endH; h++) keys.add(slotKey(s.day_of_week, `${String(h).padStart(2, '0')}:00`))
  })
  return keys
}

function buildSlots(selected: Set<string>): AvailabilitySlot[] {
  const byDay: Record<number, number[]> = {}
  selected.forEach(key => {
    const [d, h] = key.split('-')
    const day = parseInt(d); const hour = parseInt(h)
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(hour)
  })
  const result: AvailabilitySlot[] = []
  Object.entries(byDay).forEach(([day, hours]) => {
    const sorted = [...hours].sort((a, b) => a - b)
    let start = sorted[0]; let prev = sorted[0]
    for (let i = 1; i <= sorted.length; i++) {
      if (i === sorted.length || sorted[i] !== prev + 1) {
        result.push({ day_of_week: parseInt(day), start_time: `${String(start).padStart(2, '0')}:00`, end_time: `${String(prev + 1).padStart(2, '0')}:00` })
        if (i < sorted.length) { start = sorted[i]; prev = sorted[i] }
      } else { prev = sorted[i] }
    }
  })
  return result
}

export default function StudentAvailabilityPage() {
  const { studentId } = useAuthStore()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add')

  useEffect(() => {
    if (!studentId) { setLoading(false); return }
    studentsApi.getAvailability(studentId)
      .then(slots => setSelected(parseSlots(slots)))
      .catch(() => setError('No se pudo cargar la disponibilidad'))
      .finally(() => setLoading(false))
  }, [studentId])

  const toggle = (key: string, forceMode?: 'add' | 'remove') => {
    setSelected(prev => {
      const next = new Set(prev)
      const mode = forceMode ?? dragMode
      if (mode === 'add') next.add(key); else next.delete(key)
      return next
    })
    setSaved(false)
  }

  const handleMouseDown = (key: string) => {
    const newMode = selected.has(key) ? 'remove' : 'add'
    setDragMode(newMode); setDragging(true); toggle(key, newMode)
  }

  const handleMouseEnter = (key: string) => { if (dragging) toggle(key, dragMode) }

  const handleSave = async () => {
    if (!studentId) return
    setSaving(true); setError('')
    try { await studentsApi.setAvailability(studentId, buildSlots(selected)); setSaved(true) }
    catch { setError('Error al guardar la disponibilidad') }
    finally { setSaving(false) }
  }

  return (
    <div
      className="p-6 xl:p-8 space-y-5 select-none animate-fadeIn"
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
    >
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl px-7 py-5"
        style={{ background: 'linear-gradient(135deg, #4a044e 0%, #701a75 40%, #a21caf 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div style={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220,
            background: 'radial-gradient(circle, rgba(244,114,182,0.18) 0%, transparent 65%)' }} />
        </div>
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4" style={{ color: 'rgba(249,168,212,0.8)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(249,168,212,0.7)' }}>Disponibilidad</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Mi Disponibilidad</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(249,168,212,0.6)' }}>
              Arrastra para marcar los horarios en que puedes asistir
            </p>
          </div>
          <div className="flex gap-2.5 items-center">
            <button onClick={() => { setSelected(new Set()); setSaved(false) }}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
              Limpiar todo
            </button>
            <button onClick={handleSave} disabled={saving || !studentId}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60"
              style={{ background: saved ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {!studentId && (
        <div className="px-4 py-3.5 rounded-2xl text-sm"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: 'var(--sp-t2)' }}>
          Tu cuenta no está vinculada a un estudiante. Contacta a administración.
        </div>
      )}
      {error && (
        <div className="px-4 py-3.5 rounded-2xl text-sm"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {loading
        ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        : (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--sp-card-bg)', border: '1px solid var(--sp-card-border)' }}>

            {/* Legend + stats */}
            <div className="px-5 py-3 flex items-center gap-5 flex-wrap"
              style={{ background: 'var(--sp-cal-header)', borderBottom: '1px solid var(--sp-divider)' }}>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--sp-t2)' }}>
                <div className="w-4 h-4 rounded-md"
                  style={{ background: 'linear-gradient(135deg, #a21caf, #ec4899)' }} />
                Disponible
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--sp-t3)' }}>
                <div className="w-4 h-4 rounded-md"
                  style={{ background: 'var(--sp-grid-cell)', border: '1px solid var(--sp-card-border)' }} />
                No disponible
              </div>
              <span className="ml-auto text-xs" style={{ color: 'var(--sp-t3)' }}>
                {selected.size} bloque{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''}
              </span>
              <span className="text-xs" style={{ color: 'var(--sp-t3)' }}>Clic o arrastra para editar</span>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-left w-16 font-medium text-xs"
                      style={{ color: 'var(--sp-t3)', borderBottom: '1px solid var(--sp-divider)' }}>
                      Hora
                    </th>
                    {DAYS.map((d, i) => (
                      <th key={i} className="py-3 px-2 text-center text-xs font-semibold"
                        style={{ color: 'var(--sp-t2)', borderBottom: '1px solid var(--sp-divider)' }}>
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((hour, hi) => (
                    <tr key={hour} style={{ borderBottom: hi < HOURS.length - 1 ? '1px solid var(--sp-divider)' : 'none' }}>
                      <td className="py-1 px-4 text-xs font-mono" style={{ color: 'var(--sp-t3)' }}>{hour}</td>
                      {DAYS.map((_, day) => {
                        const key = slotKey(day, hour)
                        const isSel = selected.has(key)
                        return (
                          <td key={day} className="px-1.5 py-1">
                            <div
                              className="h-7 rounded-lg cursor-pointer transition-all duration-75"
                              style={isSel ? {
                                background: 'linear-gradient(135deg, rgba(162,28,175,0.75), rgba(236,72,153,0.65))',
                                border: '1px solid rgba(244,114,182,0.4)',
                                boxShadow: '0 0 6px rgba(244,114,182,0.2)',
                              } : {
                                background: 'var(--sp-grid-cell)',
                                border: '1px solid var(--sp-card-border)',
                              }}
                              onMouseDown={() => handleMouseDown(key)}
                              onMouseEnter={e => {
                                handleMouseEnter(key)
                                if (!isSel) (e.currentTarget as HTMLElement).style.background = 'var(--sp-grid-hover)'
                              }}
                              onMouseLeave={e => {
                                if (!selected.has(key)) (e.currentTarget as HTMLElement).style.background = 'var(--sp-grid-cell)'
                              }}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div>
  )
}
