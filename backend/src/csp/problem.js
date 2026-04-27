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
  const enrolledDocs = await Enrollment.distinct('course_id', {
    academic_period: academicPeriod,
    status: 'enrolled',
  })

  if (enrolledDocs.length === 0) {
    return { variables: [], domains: new Map(), neighbors: new Map(), courseEnrollmentCount: new Map(), teacherSharedStudents: new Map() }
  }

  const [courses, teachers, classrooms] = await Promise.all([
    Course.find({ _id: { $in: enrolledDocs }, is_active: true }),
    Teacher.find({ is_active: true }),
    Classroom.find({ is_active: true }),
  ])

  const teacherAvailabilities = await TeacherAvailability.find({
    teacher_id: { $in: teachers.map(t => t._id) },
  })

  const availByTeacher = new Map()
  for (const avail of teacherAvailabilities) {
    const tid = avail.teacher_id.toString()
    if (!availByTeacher.has(tid)) availByTeacher.set(tid, [])
    availByTeacher.get(tid).push(avail)
  }

  const allSlots = generateSlots({ durationHours: slotDurationHours })

  const courseEnrollmentCount = new Map()
  const courseStudents = new Map()

  for (const course of courses) {
    const cid = course._id.toString()
    const enrollments = await Enrollment.find({
      course_id: course._id,
      academic_period: academicPeriod,
      status: 'enrolled',
    })
    courseEnrollmentCount.set(cid, enrollments.length)
    courseStudents.set(cid, new Set(enrollments.map(e => e.student_id.toString())))
  }

  const variables = []
  const domains = new Map()

  for (const course of courses) {
    const cid = course._id.toString()
    variables.push(cid)
    const numEnrolled = courseEnrollmentCount.get(cid) ?? 0

    const validClassrooms = classrooms.filter(c =>
      c.room_type === course.required_room_type && c.capacity >= numEnrolled
    )

    const assignments = []
    const seen = new Set()

    for (const teacher of teachers) {
      if (teacher.department !== course.department) continue
      const tid = teacher._id.toString()
      const avail = availByTeacher.get(tid) ?? []
      const teacherSlots = getTeacherAvailableSlots(avail, allSlots)

      for (const slot of teacherSlots) {
        const key = `${tid}|${slot.day_of_week}|${slot.start_time}`
        if (seen.has(key)) continue
        const classroom = validClassrooms[0]
        if (!classroom) continue
        seen.add(key)
        assignments.push({
          teacher_id: tid,
          classroom_id: classroom._id.toString(),
          slot,
        })
      }
    }
    domains.set(cid, assignments)
  }

  const neighbors = new Map()
  const teacherSharedStudents = new Map()
  for (const cid of variables) neighbors.set(cid, [])

  for (let i = 0; i < variables.length; i++) {
    for (let j = i + 1; j < variables.length; j++) {
      const cid1 = variables[i]
      const cid2 = variables[j]
      const s1 = courseStudents.get(cid1) ?? new Set()
      const s2 = courseStudents.get(cid2) ?? new Set()
      const shared = new Set([...s1].filter(s => s2.has(s)))
      neighbors.get(cid1).push(cid2)
      neighbors.get(cid2).push(cid1)
      if (shared.size > 0) {
        teacherSharedStudents.set(`${cid1},${cid2}`, shared)
        teacherSharedStudents.set(`${cid2},${cid1}`, shared)
      }
    }
  }

  return { variables, domains, neighbors, courseEnrollmentCount, teacherSharedStudents }
}

module.exports = { buildProblem }
