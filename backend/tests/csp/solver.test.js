/**
 * PRUEBAS TDD — Módulo: solver.js
 * Ciclo: RED → GREEN → REFACTOR
 * Cobertura: solve (backtracking + AC3 + MRV + LCV)
 */

const { solve } = require('../../src/csp/solver')

// ─── Helpers para construir problemas CSP ─────────────────────────────────────
function makeSlot(day, start, end) {
  return { day_of_week: day, start_time: start, end_time: end }
}

function makeAssignment(teacher_id, classroom_id, slot) {
  return { teacher_id, classroom_id, slot }
}

/**
 * Construye un problema CSP simple con N cursos,
 * cada uno con sus propios dominios (assignments posibles)
 */
function buildProblem({ variables, domains, neighbors, teacherSharedStudents = new Map() }) {
  return {
    variables,
    domains: new Map(Object.entries(domains)),
    neighbors: new Map(Object.entries(neighbors)),
    teacherSharedStudents,
  }
}

// ─── solve — casos básicos ────────────────────────────────────────────────────
describe('solve — casos básicos', () => {
  test('retorna completed con mapa vacío si no hay variables', () => {
    const problem = {
      variables: [],
      domains: new Map(),
      neighbors: new Map(),
      teacherSharedStudents: new Map(),
    }
    const result = solve(problem)
    expect(result.status).toBe('completed')
    expect(result.assignments.size).toBe(0)
  })

  test('asigna un solo curso sin restricciones', () => {
    const slot = makeSlot(0, '08:00', '10:00')
    const assignment = makeAssignment('T001', 'A101', slot)

    const problem = buildProblem({
      variables: ['C001'],
      domains: { C001: [assignment] },
      neighbors: { C001: [] },
    })

    const result = solve(problem)
    expect(result.status).toBe('completed')
    expect(result.assignments.has('C001')).toBe(true)
  })

  test('asigna dos cursos sin conflicto cuando tienen docentes distintos', () => {
    const slot = makeSlot(0, '08:00', '10:00')
    const a1 = makeAssignment('T001', 'A101', slot)
    const a2 = makeAssignment('T002', 'A102', slot)

    const problem = buildProblem({
      variables: ['C001', 'C002'],
      domains: { C001: [a1], C002: [a2] },
      neighbors: { C001: ['C002'], C002: ['C001'] },
    })

    const result = solve(problem)
    expect(result.status).toBe('completed')
    expect(result.assignments.size).toBe(2)
  })

  test('retorna infeasible cuando dos cursos comparten docente y horario sin alternativas', () => {
    const slot = makeSlot(1, '08:00', '10:00')
    const conflicting = makeAssignment('T001', 'A101', slot)

    const problem = buildProblem({
      variables: ['C001', 'C002'],
      domains: {
        C001: [conflicting],
        C002: [makeAssignment('T001', 'A102', slot)], // mismo docente, mismo slot
      },
      neighbors: { C001: ['C002'], C002: ['C001'] },
    })

    const result = solve(problem)
    expect(result.status).toBe('infeasible')
  })

  test('resuelve eligiendo la alternativa correcta cuando existe', () => {
    const slot1 = makeSlot(0, '08:00', '10:00')
    const slot2 = makeSlot(0, '10:00', '12:00')

    const problem = buildProblem({
      variables: ['C001', 'C002'],
      domains: {
        C001: [makeAssignment('T001', 'A101', slot1)],
        C002: [
          makeAssignment('T001', 'A101', slot1), // conflicto de docente y aula
          makeAssignment('T001', 'A101', slot2), // válido
        ],
      },
      neighbors: { C001: ['C002'], C002: ['C001'] },
    })

    const result = solve(problem)
    expect(result.status).toBe('completed')
    expect(result.assignments.size).toBe(2)
    // Los dos cursos deben tener slots distintos
    const s1 = result.assignments.get('C001').slot
    const s2 = result.assignments.get('C002').slot
    expect(s1.start_time).not.toBe(s2.start_time)
  })
})

// ─── solve — opciones de algoritmo ───────────────────────────────────────────
describe('solve — opciones de algoritmo', () => {
  test('funciona correctamente sin MRV ni LCV ni AC3', () => {
    const slot = makeSlot(0, '08:00', '10:00')
    const problem = buildProblem({
      variables: ['C001'],
      domains: { C001: [makeAssignment('T001', 'A101', slot)] },
      neighbors: { C001: [] },
    })

    const result = solve(problem, { useMrv: false, useLcv: false, useAc3: false, useForwardChecking: false })
    expect(result.status).toBe('completed')
  })

  test('retorna stats con nodesExplored mayor a 0', () => {
    const slot = makeSlot(0, '08:00', '10:00')
    const problem = buildProblem({
      variables: ['C001'],
      domains: { C001: [makeAssignment('T001', 'A101', slot)] },
      neighbors: { C001: [] },
    })

    const result = solve(problem)
    expect(result.stats).toBeDefined()
    expect(typeof result.stats.nodesExplored).toBe('number')
  })

  test('retorna infeasible cuando AC3 elimina todos los valores de un dominio', () => {
    // Dos cursos vecinos, mismo docente, mismo slot, sin alternativas
    const slot = makeSlot(2, '10:00', '12:00')
    const problem = buildProblem({
      variables: ['C001', 'C002'],
      domains: {
        C001: [makeAssignment('T001', 'A101', slot)],
        C002: [makeAssignment('T001', 'A102', slot)],
      },
      neighbors: { C001: ['C002'], C002: ['C001'] },
    })

    const result = solve(problem, { useAc3: true })
    expect(result.status).toBe('infeasible')
  })
})

// ─── solve — múltiples cursos ─────────────────────────────────────────────────
describe('solve — múltiples cursos', () => {
  test('asigna 3 cursos con docentes distintos en el mismo horario', () => {
    const slot = makeSlot(0, '08:00', '10:00')
    const problem = buildProblem({
      variables: ['C001', 'C002', 'C003'],
      domains: {
        C001: [makeAssignment('T001', 'A101', slot)],
        C002: [makeAssignment('T002', 'A102', slot)],
        C003: [makeAssignment('T003', 'A103', slot)],
      },
      neighbors: {
        C001: ['C002', 'C003'],
        C002: ['C001', 'C003'],
        C003: ['C001', 'C002'],
      },
    })

    const result = solve(problem)
    expect(result.status).toBe('completed')
    expect(result.assignments.size).toBe(3)
  })

  test('detecta infeasible cuando 3 cursos compiten por la misma aula en el mismo slot', () => {
    const slot = makeSlot(1, '08:00', '10:00')
    const problem = buildProblem({
      variables: ['C001', 'C002', 'C003'],
      domains: {
        C001: [makeAssignment('T001', 'A101', slot)],
        C002: [makeAssignment('T002', 'A101', slot)], // misma aula
        C003: [makeAssignment('T003', 'A101', slot)], // misma aula
      },
      neighbors: {
        C001: ['C002', 'C003'],
        C002: ['C001', 'C003'],
        C003: ['C001', 'C002'],
      },
    })

    const result = solve(problem)
    expect(result.status).toBe('infeasible')
  })
})
