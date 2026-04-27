const { isConsistent } = require('./constraints')

function selectUnassignedMRV(currentAssignments, problem) {
  const unassigned = problem.variables.filter(v => !currentAssignments.has(v))
  if (unassigned.length === 0) return null
  return unassigned.reduce((best, v) => {
    const remaining = (problem.domains.get(v) ?? []).length
    const degree = (problem.neighbors.get(v) ?? []).filter(n => !currentAssignments.has(n)).length
    const bestRemaining = (problem.domains.get(best) ?? []).length
    const bestDegree = (problem.neighbors.get(best) ?? []).filter(n => !currentAssignments.has(n)).length
    if (remaining < bestRemaining) return v
    if (remaining === bestRemaining && degree > bestDegree) return v
    return best
  })
}

function orderDomainLCV(varId, currentAssignments, problem) {
  const domain = [...(problem.domains.get(varId) ?? [])]
  return domain.sort((a, b) => {
    const countEliminated = (value) => {
      let eliminated = 0
      for (const neighborId of (problem.neighbors.get(varId) ?? [])) {
        if (currentAssignments.has(neighborId)) continue
        for (const neighborVal of (problem.domains.get(neighborId) ?? [])) {
          const temp = new Map(currentAssignments)
          temp.set(varId, value)
          if (!isConsistent(neighborId, neighborVal, temp, problem)) eliminated++
        }
      }
      return eliminated
    }
    return countEliminated(a) - countEliminated(b)
  })
}

module.exports = { selectUnassignedMRV, orderDomainLCV }
