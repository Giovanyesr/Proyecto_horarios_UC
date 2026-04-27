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

function isConsistent(courseId, assignment, currentAssignments, problem) {
  for (const neighborId of (problem.neighbors.get(courseId) ?? [])) {
    const neighborAssignment = currentAssignments.get(neighborId)
    if (!neighborAssignment) continue
    if (!teacherNoOverlap(assignment, neighborAssignment)) return false
    if (!classroomNoOverlap(assignment, neighborAssignment)) return false
    const key = `${courseId},${neighborId}`
    const shared = problem.teacherSharedStudents.get(key)
    if (!studentsNoOverlap(assignment, neighborAssignment, shared)) return false
  }
  return true
}

module.exports = { isConsistent, teacherNoOverlap, classroomNoOverlap }
