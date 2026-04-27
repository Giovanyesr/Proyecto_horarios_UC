const { isConsistent }          = require('./constraints')
const { selectUnassignedMRV, orderDomainLCV } = require('./heuristics')
const { ac3 }                   = require('./ac3')

function backtrack(assignment, problem, stats, useMrv, useLcv, useForwardChecking) {
  if (assignment.size === problem.variables.length) return assignment
  if (stats.timedOut()) return null

  let varId
  if (useMrv) {
    varId = selectUnassignedMRV(assignment, problem)
  } else {
    varId = problem.variables.find(v => !assignment.has(v)) ?? null
  }
  if (varId === null) return assignment

  const domainValues = useLcv
    ? orderDomainLCV(varId, assignment, problem)
    : [...(problem.domains.get(varId) ?? [])]

  for (const value of domainValues) {
    stats.nodesExplored++
    if (isConsistent(varId, value, assignment, problem)) {
      assignment.set(varId, value)

      const pruned = new Map()
      let feasible = true

      if (useForwardChecking) {
        for (const neighborId of (problem.neighbors.get(varId) ?? [])) {
          if (assignment.has(neighborId)) continue
          pruned.set(neighborId, [])
          const neighborDomain = problem.domains.get(neighborId)
          for (let i = neighborDomain.length - 1; i >= 0; i--) {
            const neighborVal = neighborDomain[i]
            if (!isConsistent(neighborId, neighborVal, assignment, problem)) {
              neighborDomain.splice(i, 1)
              pruned.get(neighborId).push(neighborVal)
            }
          }
          if (neighborDomain.length === 0) {
            feasible = false
            break
          }
        }
      }

      if (feasible) {
        const result = backtrack(assignment, problem, stats, useMrv, useLcv, useForwardChecking)
        if (result !== null) return result
      }

      for (const [neighborId, removedVals] of pruned) {
        problem.domains.get(neighborId).push(...removedVals)
      }
      assignment.delete(varId)
    }
  }
  return null
}

function solve(problem, { useMrv = true, useLcv = true, useAc3 = true, useForwardChecking = true, timeoutSeconds = 60 } = {}) {
  const startTime = Date.now()
  const stats = {
    nodesExplored: 0,
    timedOut: () => (Date.now() - startTime) / 1000 > timeoutSeconds,
  }

  if (problem.variables.length === 0) {
    return { status: 'completed', assignments: new Map(), stats }
  }

  if (useAc3) {
    if (!ac3(problem)) {
      return { status: 'infeasible', assignments: new Map(), stats }
    }
  }

  const assignment = new Map()
  const result = backtrack(assignment, problem, stats, useMrv, useLcv, useForwardChecking)

  if (stats.timedOut() && result === null) {
    return { status: 'timeout', assignments: assignment, stats }
  }
  if (result === null) {
    return { status: 'infeasible', assignments: new Map(), stats }
  }
  return { status: 'completed', assignments: result, stats }
}

module.exports = { solve }
