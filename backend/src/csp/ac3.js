const { isConsistent } = require('./constraints')

function revise(xi, xj, problem, currentAssignments) {
  let revised = false
  const toRemove = []
  for (const x of problem.domains.get(xi)) {
    const hasSupport = (problem.domains.get(xj) ?? []).some(y => {
      const temp = new Map(currentAssignments)
      temp.set(xj, y)
      return isConsistent(xi, x, temp, problem)
    })
    if (!hasSupport) {
      toRemove.push(x)
      revised = true
    }
  }
  const domain = problem.domains.get(xi)
  for (const val of toRemove) {
    const idx = domain.indexOf(val)
    if (idx !== -1) domain.splice(idx, 1)
  }
  return revised
}

function ac3(problem) {
  const queue = []
  for (const xi of problem.variables) {
    for (const xj of (problem.neighbors.get(xi) ?? [])) {
      queue.push([xi, xj])
    }
  }
  const currentAssignments = new Map()
  while (queue.length > 0) {
    const [xi, xj] = queue.shift()
    if (revise(xi, xj, problem, currentAssignments)) {
      if ((problem.domains.get(xi) ?? []).length === 0) return false
      for (const xk of (problem.neighbors.get(xi) ?? [])) {
        if (xk !== xj) queue.push([xk, xi])
      }
    }
  }
  return true
}

module.exports = { ac3 }
