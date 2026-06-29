const { consistentPair } = require('./constraints')

function selectUnassignedMRV(currentAssignments, problem) {
  let best = null
  let bestRemaining = Infinity
  let bestDegree = -1
  for (const v of problem.variables) {
    if (currentAssignments.has(v)) continue
    const remaining = (problem.domains.get(v) ?? []).length
    if (remaining > bestRemaining) continue
    let degree = 0
    for (const n of (problem.neighbors.get(v) ?? [])) {
      if (!currentAssignments.has(n)) degree++
    }
    if (remaining < bestRemaining || degree > bestDegree) {
      best = v
      bestRemaining = remaining
      bestDegree = degree
    }
  }
  return best
}

function orderDomainLCV(varId, currentAssignments, problem) {
  const domain = [...(problem.domains.get(varId) ?? [])]
  if (domain.length <= 1) return domain
  const neighbors = []
  for (const n of (problem.neighbors.get(varId) ?? [])) {
    if (!currentAssignments.has(n)) neighbors.push(n)
  }
  if (neighbors.length === 0) return domain

  // Pre-resolve neighbor domains and shared-student sets once.
  const neighborData = neighbors.map(nid => ({
    domain: problem.domains.get(nid) ?? [],
    shared: problem.teacherSharedStudents.get(`${varId},${nid}`),
  }))

  const eliminated = new Map()
  for (const v of domain) {
    let count = 0
    for (const { domain: ndom, shared } of neighborData) {
      for (const nv of ndom) {
        if (!consistentPair(v, nv, shared)) count++
      }
    }
    eliminated.set(v, count)
  }
  return domain.sort((a, b) => eliminated.get(a) - eliminated.get(b))
}

module.exports = { selectUnassignedMRV, orderDomainLCV }
