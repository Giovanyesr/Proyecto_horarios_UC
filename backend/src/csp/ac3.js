const { consistentPair } = require('./constraints')

function revise(xi, xj, problem) {
  const di = problem.domains.get(xi) ?? []
  const dj = problem.domains.get(xj) ?? []
  if (dj.length === 0) return false
  const shared = problem.teacherSharedStudents.get(`${xi},${xj}`)

  const filtered = []
  let revised = false
  for (const x of di) {
    let supported = false
    for (const y of dj) {
      if (consistentPair(x, y, shared)) { supported = true; break }
    }
    if (supported) filtered.push(x)
    else revised = true
  }
  if (revised) problem.domains.set(xi, filtered)
  return revised
}

function ac3(problem) {
  const queue = []
  for (const xi of problem.variables) {
    for (const xj of (problem.neighbors.get(xi) ?? [])) {
      queue.push([xi, xj])
    }
  }
  // Pointer-based dequeue: avoids O(n) Array.shift on each iteration.
  let head = 0
  while (head < queue.length) {
    const [xi, xj] = queue[head++]
    if (revise(xi, xj, problem)) {
      if ((problem.domains.get(xi) ?? []).length === 0) return false
      for (const xk of (problem.neighbors.get(xi) ?? [])) {
        if (xk !== xj) queue.push([xk, xi])
      }
    }
  }
  return true
}

module.exports = { ac3 }
