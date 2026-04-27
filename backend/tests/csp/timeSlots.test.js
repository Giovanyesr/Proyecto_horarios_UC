/**
 * PRUEBAS TDD — Módulo: timeSlots.js
 * Ciclo: RED → GREEN → REFACTOR
 * Cobertura: slotOverlaps, generateSlots, timeToMinutes, minutesToTime
 */

const { slotOverlaps, generateSlots, timeToMinutes, minutesToTime } = require('../../src/csp/timeSlots')

// ─── timeToMinutes ────────────────────────────────────────────────────────────
describe('timeToMinutes', () => {
  test('convierte 07:00 a 420 minutos', () => {
    expect(timeToMinutes('07:00')).toBe(420)
  })

  test('convierte 08:30 a 510 minutos', () => {
    expect(timeToMinutes('08:30')).toBe(510)
  })

  test('convierte 00:00 a 0 minutos', () => {
    expect(timeToMinutes('00:00')).toBe(0)
  })

  test('convierte 22:00 a 1320 minutos', () => {
    expect(timeToMinutes('22:00')).toBe(1320)
  })

  test('convierte 12:45 correctamente', () => {
    expect(timeToMinutes('12:45')).toBe(765)
  })
})

// ─── minutesToTime ────────────────────────────────────────────────────────────
describe('minutesToTime', () => {
  test('convierte 420 a 07:00', () => {
    expect(minutesToTime(420)).toBe('07:00')
  })

  test('convierte 0 a 00:00', () => {
    expect(minutesToTime(0)).toBe('00:00')
  })

  test('convierte 90 a 01:30', () => {
    expect(minutesToTime(90)).toBe('01:30')
  })

  test('convierte 1320 a 22:00', () => {
    expect(minutesToTime(1320)).toBe('22:00')
  })

  test('es inversa de timeToMinutes', () => {
    expect(minutesToTime(timeToMinutes('14:30'))).toBe('14:30')
  })
})

// ─── slotOverlaps ─────────────────────────────────────────────────────────────
describe('slotOverlaps', () => {
  test('dos slots en el mismo día y misma hora se superponen', () => {
    const s1 = { day_of_week: 1, start_time: '08:00', end_time: '10:00' }
    const s2 = { day_of_week: 1, start_time: '08:00', end_time: '10:00' }
    expect(slotOverlaps(s1, s2)).toBe(true)
  })

  test('dos slots en días distintos no se superponen', () => {
    const s1 = { day_of_week: 1, start_time: '08:00', end_time: '10:00' }
    const s2 = { day_of_week: 2, start_time: '08:00', end_time: '10:00' }
    expect(slotOverlaps(s1, s2)).toBe(false)
  })

  test('slots consecutivos (sin solapamiento) no se superponen', () => {
    const s1 = { day_of_week: 1, start_time: '08:00', end_time: '10:00' }
    const s2 = { day_of_week: 1, start_time: '10:00', end_time: '12:00' }
    expect(slotOverlaps(s1, s2)).toBe(false)
  })

  test('slot que comienza antes y termina durante otro se superpone', () => {
    const s1 = { day_of_week: 0, start_time: '07:00', end_time: '09:00' }
    const s2 = { day_of_week: 0, start_time: '08:00', end_time: '10:00' }
    expect(slotOverlaps(s1, s2)).toBe(true)
  })

  test('slot completamente dentro de otro se superpone', () => {
    const s1 = { day_of_week: 3, start_time: '08:00', end_time: '12:00' }
    const s2 = { day_of_week: 3, start_time: '09:00', end_time: '11:00' }
    expect(slotOverlaps(s1, s2)).toBe(true)
  })

  test('slot que termina antes de que empiece otro no se superpone', () => {
    const s1 = { day_of_week: 2, start_time: '07:00', end_time: '09:00' }
    const s2 = { day_of_week: 2, start_time: '10:00', end_time: '12:00' }
    expect(slotOverlaps(s1, s2)).toBe(false)
  })
})

// ─── generateSlots ────────────────────────────────────────────────────────────
describe('generateSlots', () => {
  test('genera slots de 2 horas entre 07:00 y 09:00 para un día', () => {
    const slots = generateSlots({ start: '07:00', end: '09:00', durationHours: 2, days: [0] })
    expect(slots).toHaveLength(1)
    expect(slots[0]).toEqual({ day_of_week: 0, start_time: '07:00', end_time: '09:00' })
  })

  test('genera múltiples slots sin solapamiento', () => {
    const slots = generateSlots({ start: '07:00', end: '11:00', durationHours: 2, days: [1] })
    expect(slots).toHaveLength(2)
    expect(slots[0].end_time).toBe(slots[1].start_time)
  })

  test('genera slots para todos los días si no se especifica days', () => {
    const slots = generateSlots({ start: '07:00', end: '09:00', durationHours: 2 })
    expect(slots).toHaveLength(6) // días 0–5
  })

  test('genera slots para múltiples días especificados', () => {
    const slots = generateSlots({ start: '07:00', end: '09:00', durationHours: 2, days: [0, 1, 2] })
    expect(slots).toHaveLength(3)
    const days = slots.map(s => s.day_of_week)
    expect(days).toEqual([0, 1, 2])
  })

  test('no genera slots si la duración excede el rango', () => {
    const slots = generateSlots({ start: '07:00', end: '08:00', durationHours: 2, days: [0] })
    expect(slots).toHaveLength(0)
  })

  test('cada slot tiene start_time menor a end_time', () => {
    const slots = generateSlots({ start: '07:00', end: '22:00', durationHours: 2, days: [0] })
    slots.forEach(slot => {
      expect(timeToMinutes(slot.start_time)).toBeLessThan(timeToMinutes(slot.end_time))
    })
  })
})
