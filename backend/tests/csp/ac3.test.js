/**
 * PRUEBAS TDD — Módulo: ac3.js
 * Ciclo: RED → GREEN → REFACTOR
 * Cobertura: ac3(), revise() (via ac3)
 * Trazabilidad: Spec.md CU-06, constitution.md RC-01 a RC-07
 */

const { ac3 } = require('../../src/csp/ac3')

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeSlot(day, start, end) {
  return { day_of_week: day, start_time: start, end_time: end }
}

function makeAssignment(teacher_id, classroom_id, slot) {
  return { teacher_id, classroom_id, slot }
}

/**
 * Construye un problema CSP mínimo para tests de AC-3.
 * @param {string[]} variables - IDs de cursos
 * @param {Map} domains       - dominios por variable
 * @param {Map} neighbors     - vecinos por variable
 * @param {Map} sharedStudents - alumnos compartidos entre pares
 */
function makeProblem(variables, domains, neighbors, sharedStudents = new Map()) {
  return { variables, domains, neighbors, teacherSharedStudents: sharedStudents }
}

// ─── ac3: problema sin variables ──────────────────────────────────────────────
describe('ac3 — problema vacío', () => {
  test('retorna true si no hay variables', () => {
    const problem = makeProblem([], new Map(), new Map())
    expect(ac3(problem)).toBe(true)
  })

  test('retorna true si hay variables pero sin vecinos', () => {
    const slot = makeSlot(1, '08:00', '10:00')
    const a = makeAssignment('T001', 'A101', slot)
    const domains = new Map([['C1', [a]]])
    const neighbors = new Map([['C1', []]])
    const problem = makeProblem(['C1'], domains, neighbors)
    expect(ac3(problem)).toBe(true)
  })
})

// ─── ac3: dominio vacío → infeasible ─────────────────────────────────────────
describe('ac3 — infeasibility detection (RC-01 a RC-07)', () => {
  test('retorna false cuando AC-3 vacía el dominio de una variable (RC-01)', () => {
    // C1 y C2 comparten docente T001 en el mismo slot → RC-01 viola ambos
    const slot = makeSlot(1, '08:00', '10:00')
    const a1 = makeAssignment('T001', 'A101', slot)
    const a2 = makeAssignment('T001', 'A102', slot)

    const domains = new Map([
      ['C1', [a1]],
      ['C2', [a2]],
    ])
    const neighbors = new Map([
      ['C1', ['C2']],
      ['C2', ['C1']],
    ])
    // Sin alumnos compartidos pero mismo docente = RC-01
    const problem = makeProblem(['C1', 'C2'], domains, neighbors)
    expect(ac3(problem)).toBe(false)
  })

  test('retorna false cuando dominio queda vacío por RC-02 (aula duplicada)', () => {
    const slot = makeSlot(2, '10:00', '12:00')
    const a1 = makeAssignment('T001', 'A101', slot)
    const a2 = makeAssignment('T002', 'A101', slot) // misma aula → RC-02

    const domains = new Map([
      ['C1', [a1]],
      ['C2', [a2]],
    ])
    const neighbors = new Map([
      ['C1', ['C2']],
      ['C2', ['C1']],
    ])
    const problem = makeProblem(['C1', 'C2'], domains, neighbors)
    expect(ac3(problem)).toBe(false)
  })

  test('retorna false con RC-03 cuando alumnos comparten horario', () => {
    const slot = makeSlot(3, '14:00', '16:00')
    const a1 = makeAssignment('T001', 'A101', slot)
    const a2 = makeAssignment('T002', 'A102', slot)

    const domains = new Map([
      ['C1', [a1]],
      ['C2', [a2]],
    ])
    const neighbors = new Map([
      ['C1', ['C2']],
      ['C2', ['C1']],
    ])
    // Alumno ALU-01 matriculado en ambos cursos → RC-03
    const sharedStudents = new Map([
      ['C1,C2', new Set(['ALU-01'])],
      ['C2,C1', new Set(['ALU-01'])],
    ])
    const problem = makeProblem(['C1', 'C2'], domains, neighbors, sharedStudents)
    expect(ac3(problem)).toBe(false)
  })
})

// ─── ac3: problema factible ───────────────────────────────────────────────────
describe('ac3 — problema factible', () => {
  test('retorna true cuando los cursos tienen slots distintos', () => {
    const slot1 = makeSlot(1, '08:00', '10:00')
    const slot2 = makeSlot(1, '10:00', '12:00')
    const a1 = makeAssignment('T001', 'A101', slot1)
    const a2 = makeAssignment('T001', 'A101', slot2)

    const domains = new Map([
      ['C1', [a1]],
      ['C2', [a2]],
    ])
    const neighbors = new Map([
      ['C1', ['C2']],
      ['C2', ['C1']],
    ])
    const problem = makeProblem(['C1', 'C2'], domains, neighbors)
    expect(ac3(problem)).toBe(true)
  })

  test('retorna true cuando los cursos tienen docentes distintos en el mismo slot', () => {
    const slot = makeSlot(1, '08:00', '10:00')
    const a1 = makeAssignment('T001', 'A101', slot)
    const a2 = makeAssignment('T002', 'A102', slot)

    const domains = new Map([
      ['C1', [a1]],
      ['C2', [a2]],
    ])
    const neighbors = new Map([
      ['C1', ['C2']],
      ['C2', ['C1']],
    ])
    // Sin alumnos compartidos
    const problem = makeProblem(['C1', 'C2'], domains, neighbors)
    expect(ac3(problem)).toBe(true)
  })

  test('retorna true en problema de 3 variables sin conflictos', () => {
    const slots = [
      makeSlot(1, '08:00', '10:00'),
      makeSlot(1, '10:00', '12:00'),
      makeSlot(2, '08:00', '10:00'),
    ]
    const domains = new Map([
      ['C1', [makeAssignment('T001', 'A101', slots[0])]],
      ['C2', [makeAssignment('T002', 'A102', slots[1])]],
      ['C3', [makeAssignment('T003', 'A103', slots[2])]],
    ])
    const neighbors = new Map([
      ['C1', ['C2', 'C3']],
      ['C2', ['C1', 'C3']],
      ['C3', ['C1', 'C2']],
    ])
    const problem = makeProblem(['C1', 'C2', 'C3'], domains, neighbors)
    expect(ac3(problem)).toBe(true)
  })
})

// ─── ac3: reducción de dominio ────────────────────────────────────────────────
describe('ac3 — reducción de dominio', () => {
  test('elimina valores inconsistentes del dominio de C1 dejando valores válidos', () => {
    const slot1 = makeSlot(1, '08:00', '10:00') // conflicto con C2
    const slot2 = makeSlot(2, '08:00', '10:00') // sin conflicto
    const a1_conflict = makeAssignment('T001', 'A101', slot1)
    const a1_ok       = makeAssignment('T001', 'A101', slot2)
    const a2          = makeAssignment('T001', 'A102', slot1) // mismo docente+slot que a1_conflict

    const domains = new Map([
      ['C1', [a1_conflict, a1_ok]],
      ['C2', [a2]],
    ])
    const neighbors = new Map([
      ['C1', ['C2']],
      ['C2', ['C1']],
    ])
    const problem = makeProblem(['C1', 'C2'], domains, neighbors)
    const result = ac3(problem)

    // AC-3 debe eliminar a1_conflict del dominio de C1
    // C1 queda con [a1_ok] → problema factible
    expect(result).toBe(true)
    expect(problem.domains.get('C1')).toHaveLength(1)
    expect(problem.domains.get('C1')[0]).toEqual(a1_ok)
  })

  test('dominio de C2 no se modifica si todos sus valores son consistentes', () => {
    const slot1 = makeSlot(1, '08:00', '10:00')
    const slot2 = makeSlot(2, '08:00', '10:00')
    const a1 = makeAssignment('T001', 'A101', slot1)
    const a2 = makeAssignment('T002', 'A102', slot2)

    const domains = new Map([
      ['C1', [a1]],
      ['C2', [a2]],
    ])
    const neighbors = new Map([
      ['C1', ['C2']],
      ['C2', ['C1']],
    ])
    const problem = makeProblem(['C1', 'C2'], domains, neighbors)
    ac3(problem)

    expect(problem.domains.get('C2')).toHaveLength(1)
  })
})

// ─── ac3: propagación en cadena ───────────────────────────────────────────────
describe('ac3 — propagación en cadena', () => {
  test('propaga restricciones transitivamente entre 3 variables', () => {
    // C1 → C2 → C3 en cadena con mismo docente T001 en slot1
    const slot1 = makeSlot(1, '08:00', '10:00')
    const slot2 = makeSlot(1, '10:00', '12:00')

    // C3 solo tiene slot1 disponible
    // C2 tiene slot1 y slot2 — AC-3 debe eliminar slot1 de C2 porque C3 lo ocupa
    // Después, C1 también tiene slot1 — AC-3 debe eliminarlo
    const a_c1_s1 = makeAssignment('T001', 'A101', slot1)
    const a_c1_s2 = makeAssignment('T001', 'A101', slot2)
    const a_c2_s1 = makeAssignment('T002', 'A102', slot1)
    const a_c2_s2 = makeAssignment('T002', 'A102', slot2)
    const a_c3_s1 = makeAssignment('T002', 'A102', slot1) // C3 solo tiene slot1, misma aula que C2

    const domains = new Map([
      ['C1', [a_c1_s1, a_c1_s2]],
      ['C2', [a_c2_s1, a_c2_s2]],
      ['C3', [a_c3_s1]],
    ])
    const neighbors = new Map([
      ['C1', ['C2']],
      ['C2', ['C1', 'C3']],
      ['C3', ['C2']],
    ])
    const problem = makeProblem(['C1', 'C2', 'C3'], domains, neighbors)
    const result = ac3(problem)

    // AC-3 elimina a_c2_s1 del dominio de C2 (mismo aula+slot que C3)
    // C2 queda con [a_c2_s2] → problema factible
    expect(result).toBe(true)
    expect(problem.domains.get('C2')).toHaveLength(1)
    expect(problem.domains.get('C2')[0]).toEqual(a_c2_s2)
  })
})
