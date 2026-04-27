/**
 * PRUEBAS TDD — Módulo: constraints.js
 * Ciclo: RED → GREEN → REFACTOR
 * Cobertura: teacherNoOverlap, classroomNoOverlap, isConsistent
 */

const { isConsistent, teacherNoOverlap, classroomNoOverlap } = require('../../src/csp/constraints')

// ─── Helpers para construir assignments y problems ────────────────────────────
function makeAssignment(teacher_id, classroom_id, slot) {
  return { teacher_id, classroom_id, slot }
}

function makeSlot(day, start, end) {
  return { day_of_week: day, start_time: start, end_time: end }
}

function makeProblem(neighbors = new Map(), teacherSharedStudents = new Map()) {
  return { neighbors, teacherSharedStudents }
}

// ─── teacherNoOverlap ─────────────────────────────────────────────────────────
describe('teacherNoOverlap', () => {
  test('mismo docente en el mismo horario genera conflicto', () => {
    const slot = makeSlot(1, '08:00', '10:00')
    const a1 = makeAssignment('T001', 'A101', slot)
    const a2 = makeAssignment('T001', 'A102', slot)
    expect(teacherNoOverlap(a1, a2)).toBe(false)
  })

  test('docentes distintos en el mismo horario no generan conflicto', () => {
    const slot = makeSlot(1, '08:00', '10:00')
    const a1 = makeAssignment('T001', 'A101', slot)
    const a2 = makeAssignment('T002', 'A101', slot)
    expect(teacherNoOverlap(a1, a2)).toBe(true)
  })

  test('mismo docente en horarios distintos no genera conflicto', () => {
    const a1 = makeAssignment('T001', 'A101', makeSlot(1, '08:00', '10:00'))
    const a2 = makeAssignment('T001', 'A102', makeSlot(1, '10:00', '12:00'))
    expect(teacherNoOverlap(a1, a2)).toBe(true)
  })

  test('mismo docente en días distintos no genera conflicto', () => {
    const a1 = makeAssignment('T001', 'A101', makeSlot(0, '08:00', '10:00'))
    const a2 = makeAssignment('T001', 'A101', makeSlot(1, '08:00', '10:00'))
    expect(teacherNoOverlap(a1, a2)).toBe(true)
  })

  test('mismo docente con horarios solapados genera conflicto', () => {
    const a1 = makeAssignment('T001', 'A101', makeSlot(2, '08:00', '10:00'))
    const a2 = makeAssignment('T001', 'A102', makeSlot(2, '09:00', '11:00'))
    expect(teacherNoOverlap(a1, a2)).toBe(false)
  })
})

// ─── classroomNoOverlap ───────────────────────────────────────────────────────
describe('classroomNoOverlap', () => {
  test('misma aula en el mismo horario genera conflicto', () => {
    const slot = makeSlot(0, '08:00', '10:00')
    const a1 = makeAssignment('T001', 'A101', slot)
    const a2 = makeAssignment('T002', 'A101', slot)
    expect(classroomNoOverlap(a1, a2)).toBe(false)
  })

  test('aulas distintas en el mismo horario no generan conflicto', () => {
    const slot = makeSlot(0, '08:00', '10:00')
    const a1 = makeAssignment('T001', 'A101', slot)
    const a2 = makeAssignment('T002', 'A102', slot)
    expect(classroomNoOverlap(a1, a2)).toBe(true)
  })

  test('misma aula en horarios consecutivos no genera conflicto', () => {
    const a1 = makeAssignment('T001', 'A101', makeSlot(1, '08:00', '10:00'))
    const a2 = makeAssignment('T002', 'A101', makeSlot(1, '10:00', '12:00'))
    expect(classroomNoOverlap(a1, a2)).toBe(true)
  })

  test('misma aula en días distintos no genera conflicto', () => {
    const a1 = makeAssignment('T001', 'A101', makeSlot(0, '08:00', '10:00'))
    const a2 = makeAssignment('T002', 'A101', makeSlot(1, '08:00', '10:00'))
    expect(classroomNoOverlap(a1, a2)).toBe(true)
  })
})

// ─── isConsistent ─────────────────────────────────────────────────────────────
describe('isConsistent', () => {
  test('retorna true si no hay vecinos asignados', () => {
    const problem = makeProblem(new Map([['C001', []]]))
    const assignment = makeAssignment('T001', 'A101', makeSlot(0, '08:00', '10:00'))
    const currentAssignments = new Map()
    expect(isConsistent('C001', assignment, currentAssignments, problem)).toBe(true)
  })

  test('detecta conflicto de docente con vecino asignado', () => {
    const slot = makeSlot(1, '08:00', '10:00')
    const assignment = makeAssignment('T001', 'A101', slot)
    const neighborAssignment = makeAssignment('T001', 'A102', slot)

    const currentAssignments = new Map([['C002', neighborAssignment]])
    const problem = makeProblem(
      new Map([['C001', ['C002']]]),
      new Map()
    )

    expect(isConsistent('C001', assignment, currentAssignments, problem)).toBe(false)
  })

  test('detecta conflicto de aula con vecino asignado', () => {
    const slot = makeSlot(2, '10:00', '12:00')
    const assignment = makeAssignment('T001', 'A101', slot)
    const neighborAssignment = makeAssignment('T002', 'A101', slot)

    const currentAssignments = new Map([['C002', neighborAssignment]])
    const problem = makeProblem(
      new Map([['C001', ['C002']]]),
      new Map()
    )

    expect(isConsistent('C001', assignment, currentAssignments, problem)).toBe(false)
  })

  test('retorna true si no hay conflictos con ningún vecino', () => {
    const a1 = makeAssignment('T001', 'A101', makeSlot(0, '08:00', '10:00'))
    const a2 = makeAssignment('T002', 'A102', makeSlot(0, '10:00', '12:00'))

    const currentAssignments = new Map([['C002', a2]])
    const problem = makeProblem(
      new Map([['C001', ['C002']]]),
      new Map()
    )

    expect(isConsistent('C001', a1, currentAssignments, problem)).toBe(true)
  })

  test('ignora vecinos no asignados', () => {
    const assignment = makeAssignment('T001', 'A101', makeSlot(1, '08:00', '10:00'))
    const currentAssignments = new Map() // C002 no asignado
    const problem = makeProblem(
      new Map([['C001', ['C002', 'C003']]]),
      new Map()
    )

    expect(isConsistent('C001', assignment, currentAssignments, problem)).toBe(true)
  })
})
