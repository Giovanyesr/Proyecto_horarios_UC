const Enrollment = require('../models/Enrollment')
const Course     = require('../models/Course')

const MIN_CREDITS = 20
const MAX_CREDITS = 22

async function getCreditSummary(studentId, academicPeriod) {
  const enrollments = await Enrollment.find({
    student_id: studentId,
    academic_period: academicPeriod,
    status: 'enrolled',
  }).populate('course_id')

  const courses = enrollments.map(e => e.course_id).filter(Boolean)
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits ?? 0), 0)

  return {
    student_id: studentId.toString(),
    academic_period: academicPeriod,
    total_credits: totalCredits,
    courses,
    within_limit: totalCredits >= MIN_CREDITS && totalCredits <= MAX_CREDITS,
  }
}

async function validatePrerequisites(studentId, courseId) {
  const course = await Course.findById(courseId).populate('prerequisites')
  if (!course) {
    const err = new Error('Course not found'); err.status = 404; throw err
  }
  if (!course.prerequisites || course.prerequisites.length === 0) return

  const completedEnrollments = await Enrollment.find({ student_id: studentId, status: 'completed' })
  const completedIds = new Set(completedEnrollments.map(e => e.course_id.toString()))

  const missing = course.prerequisites.filter(p => !completedIds.has(p._id.toString()))
  if (missing.length > 0) {
    const names = missing.map(p => `${p.course_code} - ${p.name}`).join(', ')
    const err = new Error(`Missing prerequisites: ${names}`)
    err.status = 400
    throw err
  }
}

async function validateCreditLimit(studentId, academicPeriod, newCourseCredits) {
  const enrollments = await Enrollment.find({
    student_id: studentId,
    academic_period: academicPeriod,
    status: 'enrolled',
  }).populate('course_id')

  const currentTotal = enrollments.reduce((sum, e) => sum + (e.course_id?.credits ?? 0), 0)
  const newTotal = currentTotal + newCourseCredits
  if (newTotal > MAX_CREDITS) {
    const err = new Error(`Credit limit exceeded: ${currentTotal} + ${newCourseCredits} = ${newTotal} (max ${MAX_CREDITS})`)
    err.status = 400
    throw err
  }
}

async function enrollStudent(data) {
  const course = await Course.findById(data.course_id)
  if (!course) {
    const err = new Error('Course not found'); err.status = 404; throw err
  }

  const existing = await Enrollment.findOne({
    student_id: data.student_id,
    course_id: data.course_id,
    academic_period: data.academic_period,
  })
  if (existing) {
    const err = new Error('Student already enrolled in this course for this period')
    err.status = 409
    throw err
  }

  await validatePrerequisites(data.student_id, data.course_id)
  await validateCreditLimit(data.student_id, data.academic_period, course.credits)

  const enrollment = await Enrollment.create({
    student_id: data.student_id,
    course_id: data.course_id,
    academic_period: data.academic_period,
    status: data.status ?? 'enrolled',
  })
  return enrollment
}

module.exports = { enrollStudent, getCreditSummary, validatePrerequisites, validateCreditLimit }
