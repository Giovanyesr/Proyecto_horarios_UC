/**
 * PRUEBAS TDD — Módulo: heuristics.js
 * Ciclo: RED → GREEN → REFACTOR
 * Cobertura: selectUnassignedMRV, orderDomainLCV
 */

const { selectUnassignedMRV, orderDomainLCV } = require('../../src/csp/heuristics')

function makeSlot(day, start, end) {
  return { day_of_week: day, start_time: start, end_time: end }
}

function makeAssignment(teacher_id, classroom_id, slot) {
  return { teacher_id, classroom_id, slot }
}

// ─── selectUnassignedMRV ──────────────────────────────────────────────────────
describe('selectUnassignedMRV', () => {
  test('retorna null si todas las variables están asignadas', () => {
    const currentAssignments = new Map([['C001', {}], ['C002', {}]])
    const problem = {
      variables: ['C001', 'C002'],
      domains: new Map([['C001', [{}]], ['C002', [{}]]]),
      neighbors: new Map([['C001', []], ['C002', []]]),
    }
    expect(selectUnassignedMRV(currentAssignments, problem)).toBeNull()
  })

  test('selecciona la variable con menor dominio (MRV)', () => {
    const currentAssignments = new Map()
    const problem = {
      variables: ['C001', 'C002', 'C003'],
      domains: new Map([
        ['C001', [{}, {}, {}]],   // 3 valores
        ['C002', [{}]],            // 1 valor  ← MRV
        ['C003', [{}, {}]],        // 2 valores
      ]),
      neighbors: new Map([
        ['C001', []],
        ['C002', []],
        ['C003', []],
      ]),
    }
    expect(selectUnassignedMRV(currentAssignments, problem)).toBe('C002')
  })

  test('ante empate en dominio, elige la variable con más vecinos sin asignar (degree heuristic)', () => {
    const currentAssignments = new Map()
    const problem = {
      variables: ['C001', 'C002'],
      domains: new Map([
        ['C001', [{}]],  // mismo tamaño
        ['C002', [{}]],  // mismo tamaño
      ]),
      neighbors: new Map([
        ['C001', ['C002', 'C003', 'C004']], // 3 vecinos
        ['C002', ['C001']],                  // 1 vecino
      ]),
    }
    // C001 tiene más vecinos sin asignar → debe ser seleccionado
    expect(selectUnassignedMRV(currentAssignments, problem)).toBe('C001')
  })

  test('ignora variables ya asignadas al calcular el grado', () => {
    const currentAssignments = new Map([['C003', {}]])
    const problem = {
      variables: ['C001', 'C002', 'C003'],
      domains: new Map([
        ['C001', [{}]],
        ['C002', [{}]],
        ['C003', [{}]],
      ]),
      neighbors: new Map([
        ['C001', ['C003']],         // vecino ya asignado → grado efectivo 0
        ['C002', ['C001', 'C003']], // un vecino sin asignar → grado efectivo 1
        ['C003', []],
      ]),
    }
    // Ambos tienen dominio [{}], pero C002 tiene más vecinos sin asignar
    expect(selectUnassignedMRV(currentAssignments, problem)).toBe('C002')
  })

  test('retorna la única variable sin asignar', () => {
    const currentAssignments = new Map([['C001', {}]])
    const problem = {
      variables: ['C001', 'C002'],
      domains: new Map([['C001', [{}]], ['C002', [{}, {}]]]),
      neighbors: new Map([['C001', []], ['C002', []]]),
    }
    expect(selectUnassignedMRV(currentAssignments, problem)).toBe('C002')
  })
})

// ─── orderDomainLCV ───────────────────────────────────────────────────────────
describe('orderDomainLCV', () => {
  test('retorna lista vacía si el dominio está vacío', () => {
    const problem = {
      variables: ['C001'],
      domains: new Map([['C001', []]]),
      neighbors: new Map([['C001', []]]),
      teacherSharedStudents: new Map(),
    }
    const result = orderDomainLCV('C001', new Map(), problem)
    expect(result).toEqual([])
  })

  test('retorna el único valor si el dominio tiene un solo elemento', () => {
    const slot = makeSlot(0, '08:00', '10:00')
    const assignment = makeAssignment('T001', 'A101', slot)
    const problem = {
      variables: ['C001'],
      domains: new Map([['C001', [assignment]]]),
      neighbors: new Map([['C001', []]]),
      teacherSharedStudents: new Map(),
    }
    const result = orderDomainLCV('C001', new Map(), problem)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(assignment)
  })

  test('ordena valores del dominio (el menos restrictivo primero)', () => {
    const slot1 = makeSlot(0, '08:00', '10:00')
    const slot2 = makeSlot(0, '10:00', '12:00')

    // C001 puede tener slot1 o slot2
    // C002 (vecino) solo puede tener slot1
    // → asignar slot1 a C001 elimina slot1 de C002 (más restrictivo)
    // → asignar slot2 a C001 no elimina nada de C002 (menos restrictivo)
    const a1 = makeAssignment('T001', 'A101', slot1)
    const a2 = makeAssignment('T001', 'A101', slot2)
    const neighborA = makeAssignment('T001', 'A102', slot1) // mismo docente, slot1

    const problem = {
      variables: ['C001', 'C002'],
      domains: new Map([
        ['C001', [a1, a2]],
        ['C002', [neighborA]],
      ]),
      neighbors: new Map([
        ['C001', ['C002']],
        ['C002', ['C001']],
      ]),
      teacherSharedStudents: new Map(),
    }

    const result = orderDomainLCV('C001', new Map(), problem)
    // a2 (slot2) elimina 0 valores de C002 → debe ir primero
    expect(result[0]).toEqual(a2)
    expect(result[1]).toEqual(a1)
  })

  test('no considera vecinos ya asignados al calcular LCV', () => {
    const slot = makeSlot(1, '08:00', '10:00')
    const assignment = makeAssignment('T001', 'A101', slot)
    const neighborAssignment = makeAssignment('T002', 'A102', slot)

    const currentAssignments = new Map([['C002', neighborAssignment]])
    const problem = {
      variables: ['C001', 'C002'],
      domains: new Map([
        ['C001', [assignment]],
        ['C002', [neighborAssignment]],
      ]),
      neighbors: new Map([
        ['C001', ['C002']],
        ['C002', ['C001']],
      ]),
      teacherSharedStudents: new Map(),
    }

    // C002 está asignado, así que LCV no debe contarlo
    const result = orderDomainLCV('C001', currentAssignments, problem)
    expect(result).toHaveLength(1)
  })
})
