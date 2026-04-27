import { useState } from 'react'
import type { ScheduledSection } from '../../types'
import { getCourseColor, DAY_NAMES } from '../../utils/colorPalette'

interface Props {
  sections: ScheduledSection[]
  compact?: boolean
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7)   // 07 – 21
const ROW_H = 40   // px per 30-min slot

function timeToSlot(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h - 7) * 2 + Math.round(m / 30)
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function teacherInitials(first?: string, last?: string) {
  if (!first && !last) return ''
  return `${first?.[0] ?? ''}. ${last ?? ''}`.trim()
}

interface TooltipProps { section: ScheduledSection; color: { bg: string; text: string; border: string } }
function EventTooltip({ section, color }: TooltipProps) {
  return (
    <div
      className="absolute z-50 w-56 rounded-xl shadow-xl border text-xs pointer-events-none"
      style={{
        top: '100%', left: '50%', transform: 'translateX(-50%)',
        background: 'white', borderColor: color.border,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        marginTop: 4,
      }}
    >
      <div className="px-3 py-2 rounded-t-xl font-bold text-sm" style={{ background: color.bg, color: color.text }}>
        {section.course?.course_code} — {section.course?.name}
      </div>
      <div className="px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-slate-700 font-medium">
            {section.teacher ? `${section.teacher.first_name} ${section.teacher.last_name}` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-slate-700 font-medium">{section.classroom?.room_code ?? '—'}</span>
          {section.classroom?.building && (
            <span className="text-slate-400">Edif. {section.classroom.building}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-slate-700 font-medium">{formatTime(section.start_time)} – {formatTime(section.end_time)}</span>
        </div>
        {section.course?.credits && (
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-slate-700 font-medium">{section.course.credits} créditos</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CalendarEvent({ section }: { section: ScheduledSection }) {
  const [hovered, setHovered] = useState(false)
  const color = getCourseColor(section.course?.course_code ?? String(section.course_id))
  const startSlot = timeToSlot(section.start_time)
  const endSlot = timeToSlot(section.end_time)
  const span = endSlot - startSlot
  const heightPx = span * ROW_H
  const shortName = section.course?.name
    ? section.course.name.length > 22
      ? section.course.name.slice(0, 22) + '…'
      : section.course.name
    : ''

  return (
    <div
      className="absolute inset-x-0.5 rounded-lg overflow-hidden cursor-pointer transition-all duration-150 select-none"
      style={{
        top: startSlot * ROW_H + 2,
        height: heightPx - 4,
        backgroundColor: color.bg,
        borderLeft: `3px solid ${color.border}`,
        boxShadow: hovered ? `0 4px 12px rgba(0,0,0,0.12)` : '0 1px 3px rgba(0,0,0,0.06)',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        zIndex: hovered ? 30 : 10,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="px-2 py-1.5 h-full flex flex-col">
        {/* Code badge */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide leading-none"
            style={{ background: color.border, color: color.text }}>
            {section.course?.course_code ?? `#${section.course_id}`}
          </span>
          <span className="text-[9px] font-medium opacity-60" style={{ color: color.text }}>
            {formatTime(section.start_time)}
          </span>
        </div>

        {/* Course name */}
        {heightPx >= 56 && (
          <div className="text-[11px] font-bold leading-tight mt-0.5" style={{ color: color.text }}>
            {shortName}
          </div>
        )}

        {/* Teacher */}
        {heightPx >= 80 && section.teacher && (
          <div className="flex items-center gap-1 mt-auto">
            <svg className="w-3 h-3 flex-shrink-0 opacity-60" style={{ color: color.text }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] truncate" style={{ color: color.text, opacity: 0.8 }}>
              {teacherInitials(section.teacher.first_name, section.teacher.last_name)}
            </span>
          </div>
        )}

        {/* Room */}
        {heightPx >= 96 && section.classroom && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0 opacity-60" style={{ color: color.text }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-[10px]" style={{ color: color.text, opacity: 0.7 }}>
              {section.classroom.room_code}
            </span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hovered && <EventTooltip section={section} color={color} />}
    </div>
  )
}

export function WeeklyCalendar({ sections, compact = false }: Props) {
  const totalH = HOURS.length * 2 * ROW_H

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-semibold">No hay secciones para mostrar</p>
        <p className="text-xs mt-0.5">Genera un horario o verifica los filtros</p>
      </div>
    )
  }

  // Group sections by day
  const byDay: Record<number, ScheduledSection[]> = {}
  sections.forEach(s => {
    if (!byDay[s.day_of_week]) byDay[s.day_of_week] = []
    byDay[s.day_of_week].push(s)
  })

  const activeDays = Object.keys(byDay).map(Number).sort()
  const showDays = compact ? activeDays : [0, 1, 2, 3, 4, 5]

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[680px]">
        {/* Day headers */}
        <div className="flex" style={{ paddingLeft: 52 }}>
          {showDays.map(d => {
            const hasClasses = !!byDay[d]
            return (
              <div key={d} className="flex-1 text-center py-3 border-b"
                style={{ borderColor: '#f1f0fb' }}>
                <div className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: hasClasses ? '#7c3aed' : '#cbd5e1' }}>
                  {DAY_NAMES[d]}
                </div>
                {hasClasses && (
                  <div className="text-[10px] font-medium mt-0.5"
                    style={{ color: '#a78bfa' }}>
                    {byDay[d].length} clase{byDay[d].length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Grid body */}
        <div className="flex relative" style={{ height: totalH }}>
          {/* Time column */}
          <div className="flex-none relative" style={{ width: 52 }}>
            {HOURS.map((h, i) => (
              <div key={h}
                className="absolute flex items-start justify-end pr-2"
                style={{ top: i * 2 * ROW_H, height: ROW_H * 2, width: 52 }}>
                <span className="text-[10px] font-semibold mt-1" style={{ color: '#94a3b8' }}>
                  {h.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex flex-1">
            {showDays.map(d => (
              <div key={d} className="flex-1 relative border-l" style={{ borderColor: '#f1f0fb' }}>
                {/* Hour lines */}
                {HOURS.map((_, i) => (
                  <div key={i}>
                    <div className="absolute w-full border-t" style={{ top: i * 2 * ROW_H, borderColor: '#f1f0fb' }} />
                    <div className="absolute w-full border-t border-dashed" style={{ top: i * 2 * ROW_H + ROW_H, borderColor: '#f8fafc' }} />
                  </div>
                ))}
                {/* Events */}
                {(byDay[d] ?? []).map(s => (
                  <CalendarEvent key={s.id} section={s} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        {sections.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pt-4 pb-2 border-t mt-1" style={{ borderColor: '#f1f0fb' }}>
            {[...new Map(sections.map(s => [s.course_id, s])).values()].map(s => {
              const color = getCourseColor(s.course?.course_code ?? String(s.course_id))
              return (
                <div key={s.course_id} className="flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1"
                  style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                  <span className="font-bold">{s.course?.course_code}</span>
                  {s.course?.name && (
                    <span className="opacity-75 hidden sm:inline">{s.course.name}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
