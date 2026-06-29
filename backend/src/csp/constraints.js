const { slotOverlaps } = require('./timeSlots')

function teacherNoOverlap(a1, a2) {
  if (a1.teacher_id !== a2.teacher_id) return true
  return !slotOverlaps(a1.slot, a2.slot)
}

function classroomNoOverlap(a1, a2) {
  if (a1.classroom_id !== a2.classroom_id) return true
  return !slotOverlaps(a1.slot, a2.slot)
}

function studentsNoOverlap(a1, a2, sharedStudents) {
  if (!sharedStudents || sharedStudents.size === 0) return true
  return !slotOverlaps(a1.slot, a2.slot)
}

// Pairwise consistency check between two assignments. O(1).
// Used by AC3 revise, forward checking, and LCV — avoids the O(N) neighbor
// loop in isConsistent when only one specific pair needs checking.
function consistentPair(a1, a2, sharedStudents) {
  if (a1.teacher_id === a2.teacher_id && slotOverlaps(a1.slot, a2.slot)) return false
  if (a1.classroom_id === a2.classroom_id && slotOverlaps(a1.slot, a2.slot)) return false
  if (sharedStudents && sharedStudents.size > 0 && slotOverlaps(a1.slot, a2.slot)) return false
  return true
}

function isConsistent(courseId, assignment, currentAssignments, problem) {
  for (const neighborId of (problem.neighbors.get(courseId) ?? [])) {
    const neighborAssignment = currentAssignments.get(neighborId)
    if (!neighborAssignment) continue
    const shared = problem.teacherSharedStudents.get(`${courseId},${neighborId}`)
    if (!consistentPair(assignment, neighborAssignment, shared)) return false
  }
  return true
}

module.exports = { isConsistent, consistentPair, teacherNoOverlap, classroomNoOverlap }
