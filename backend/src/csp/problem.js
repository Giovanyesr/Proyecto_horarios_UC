const Course              = require('../models/Course')
const Teacher             = require('../models/Teacher')
const Classroom           = require('../models/Classroom')
const Enrollment          = require('../models/Enrollment')
const TeacherAvailability = require('../models/TeacherAvailability')
const { generateSlots }   = require('./timeSlots')

function getTeacherAvailableSlots(availability, allSlots) {
  if (!availability || availability.length === 0) return allSlots
  return allSlots.filter(slot =>
    availability.some(avail =>
      avail.day_of_week === slot.day_of_week &&
      avail.start_time <= slot.start_time &&
      avail.end_time >= slot.end_time
    )
  )
}

async function buildProblem(academicPeriod, slotDurationHours = 2) {
  const enrolledCourseIds = await Enrollment.distinct('course_id', {
    academic_period: academicPeriod,
    status: 'enrolled',
  })

  if (enrolledCourseIds.length === 0) {
    return { variables: [], domains: new Map(), neighbors: new Map(), courseEnrollmentCount: new Map(), teacherSharedStudents: new Map() }
  }

  // .lean() returns plain objects: ~5x faster than full Documents and the
  // CSP solver doesn't need Mongoose helpers.
  const [courses, teachers, classrooms, allEnrollments] = await Promise.all([
    Course.find({ _id: { $in: enrolledCourseIds }, is_active: true }).lean(),
    Teacher.find({ is_active: true }).lean(),
    Classroom.find({ is_active: true }).lean(),
    // Single batched query replaces the previous N+1 loop (one query per course).
    Enrollment.find({
      course_id: { $in: enrolledCourseIds },
      academic_period: academicPeriod,
      status: 'enrolled',
    }).select('student_id course_id').lean(),
  ])

  const teacherIds = teachers.map(t => t._id)
  const teacherAvailabilities = await TeacherAvailability.find({
    teacher_id: { $in: teacherIds },
  }).lean()

  const availByTeacher = new Map()
  for (const avail of teacherAvailabilities) {
    const tid = avail.teacher_id.toString()
    if (!availByTeacher.has(tid)) availByTeacher.set(tid, [])
    availByTeacher.get(tid).push(avail)
  }

  // Group enrollments by course in a single pass — replaces N+1.
  const courseEnrollmentCount = new Map()
  const courseStudents = new Map()
  for (const enr of allEnrollments) {
    const cid = enr.course_id.toString()
    courseEnrollmentCount.set(cid, (courseEnrollmentCount.get(cid) ?? 0) + 1)
    if (!courseStudents.has(cid)) courseStudents.set(cid, new Set())
    courseStudents.get(cid).add(enr.student_id.toString())
  }

  // Group teachers by department for O(1) candidate lookup.
  const teachersByDept = new Map()
  for (const t of teachers) {
    if (!teachersByDept.has(t.department)) teachersByDept.set(t.department, [])
    teachersByDept.get(t.department).push(t)
  }

  // Group classrooms by required_room_type for O(1) candidate lookup.
  const classroomsByType = new Map()
  for (const c of classrooms) {
    if (!classroomsByType.has(c.room_type)) classroomsByType.set(c.room_type, [])
    classroomsByType.get(c.room_type).push(c)
  }

  const allSlots = generateSlots({ durationHours: slotDurationHours })

  const variables = []
  const domains = new Map()
  // Per-course indices used later for smart neighbor inference.
  const courseTeachers = new Map()   // cid -> Set<teacher_id>
  const courseClassrooms = new Map() // cid -> Set<classroom_id>

  for (const course of courses) {
    const cid = course._id.toString()
    variables.push(cid)
    const numEnrolled = courseEnrollmentCount.get(cid) ?? 0

    const candidateTeachers = teachersByDept.get(course.department) ?? []
    const candidateRooms = (classroomsByType.get(course.required_room_type) ?? [])
      .filter(c => c.capacity >= numEnrolled)

    const teacherSet = new Set()
    const classroomSet = new Set()
    const assignments = []

    for (const teacher of candidateTeachers) {
      const tid = teacher._id.toString()
      const avail = availByTeacher.get(tid) ?? []
      const teacherSlots = getTeacherAvailableSlots(avail, allSlots)
      if (teacherSlots.length === 0) continue
      for (const slot of teacherSlots) {
        for (const classroom of candidateRooms) {
          const rid = classroom._id.toString()
          assignments.push({ teacher_id: tid, classroom_id: rid, slot })
          teacherSet.add(tid)
          classroomSet.add(rid)
        }
      }
    }
    domains.set(cid, assignments)
    courseTeachers.set(cid, teacherSet)
    courseClassrooms.set(cid, classroomSet)
  }

  // Smart neighbor inference: two courses are only neighbors if they could
  // actually conflict (share a candidate teacher, candidate classroom, or
  // student). For diverse curricula this dramatically shrinks the constraint
  // graph vs. the previous O(V²) "complete graph" approach.
  const neighbors = new Map()
  const teacherSharedStudents = new Map()
  for (const cid of variables) neighbors.set(cid, [])

  for (let i = 0; i < variables.length; i++) {
    for (let j = i + 1; j < variables.length; j++) {
      const cid1 = variables[i]
      const cid2 = variables[j]
      const t1 = courseTeachers.get(cid1)
      const t2 = courseTeachers.get(cid2)
      const r1 = courseClassrooms.get(cid1)
      const r2 = courseClassrooms.get(cid2)
      const s1 = courseStudents.get(cid1) ?? new Set()
      const s2 = courseStudents.get(cid2) ?? new Set()

      const shared = new Set()
      const [smallS, largeS] = s1.size <= s2.size ? [s1, s2] : [s2, s1]
      for (const s of smallS) if (largeS.has(s)) shared.add(s)

      let sharesTeacher = false
      const [smallT, largeT] = t1.size <= t2.size ? [t1, t2] : [t2, t1]
      for (const t of smallT) { if (largeT.has(t)) { sharesTeacher = true; break } }

      let sharesRoom = false
      if (!sharesTeacher) {
        const [smallR, largeR] = r1.size <= r2.size ? [r1, r2] : [r2, r1]
        for (const r of smallR) { if (largeR.has(r)) { sharesRoom = true; break } }
      }

      if (sharesTeacher || sharesRoom || shared.size > 0) {
        neighbors.get(cid1).push(cid2)
        neighbors.get(cid2).push(cid1)
        if (shared.size > 0) {
          teacherSharedStudents.set(`${cid1},${cid2}`, shared)
          teacherSharedStudents.set(`${cid2},${cid1}`, shared)
        }
      }
    }
  }

  return { variables, domains, neighbors, courseEnrollmentCount, teacherSharedStudents }
}

module.exports = { buildProblem }
