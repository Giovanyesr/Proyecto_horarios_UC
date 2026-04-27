const ScheduleRun     = require('../models/ScheduleRun')
const ScheduledSection = require('../models/ScheduledSection')
const Enrollment       = require('../models/Enrollment')
const { buildProblem } = require('../csp/problem')
const { solve }        = require('../csp/solver')

async function generateSchedule(academicPeriod, config = {}) {
  const {
    slot_duration_hours = 2,
    use_mrv = true,
    use_lcv = true,
    use_ac3 = true,
    use_forward_checking = true,
    timeout_seconds = 60,
  } = config

  const run = await ScheduleRun.create({
    academic_period: academicPeriod,
    status: 'running',
    solver_config: JSON.stringify(config),
  })

  const startMs = Date.now()
  try {
    const problem = await buildProblem(academicPeriod, slot_duration_hours)

    const result = solve(problem, {
      useMrv: use_mrv,
      useLcv: use_lcv,
      useAc3: use_ac3,
      useForwardChecking: use_forward_checking,
      timeoutSeconds: timeout_seconds,
    })

    run.duration_ms    = Date.now() - startMs
    run.nodes_explored = result.stats.nodesExplored

    if (result.status === 'completed') {
      run.status = 'completed'
      let sectionNumber = 1
      const sections = []
      for (const [courseId, assignment] of result.assignments) {
        sections.push({
          run_id:         run._id,
          course_id:      courseId,
          teacher_id:     assignment.teacher_id,
          classroom_id:   assignment.classroom_id,
          day_of_week:    assignment.slot.day_of_week,
          start_time:     assignment.slot.start_time,
          end_time:       assignment.slot.end_time,
          section_number: sectionNumber++,
        })
      }
      await ScheduledSection.insertMany(sections)
    } else {
      run.status = result.status
    }
  } catch (e) {
    run.status        = 'failed'
    run.error_message = e.message
    run.duration_ms   = Date.now() - startMs
  }

  await run.save()
  return run
}

async function getRun(runId) {
  return ScheduleRun.findById(runId)
}

async function getRuns({ academicPeriod, status } = {}) {
  const filter = {}
  if (academicPeriod) filter.academic_period = academicPeriod
  if (status)         filter.status = status
  return ScheduleRun.find(filter).sort({ created_at: -1 })
}

async function getSections(runId, { courseId, teacherId, classroomId } = {}) {
  const filter = { run_id: runId }
  if (courseId)    filter.course_id    = courseId
  if (teacherId)   filter.teacher_id   = teacherId
  if (classroomId) filter.classroom_id = classroomId
  return ScheduledSection.find(filter)
    .populate('course_id')
    .populate('teacher_id')
    .populate('classroom_id')
}

async function getStudentSchedule(runId, studentId) {
  const run = await getRun(runId)
  if (!run) return []

  const enrollments = await Enrollment.find({
    student_id: studentId,
    academic_period: run.academic_period,
    status: 'enrolled',
  })
  const courseIds = enrollments.map(e => e.course_id)
  if (courseIds.length === 0) return []

  return ScheduledSection.find({ run_id: runId, course_id: { $in: courseIds } })
    .populate('course_id')
    .populate('teacher_id')
    .populate('classroom_id')
}

module.exports = { generateSchedule, getRun, getRuns, getSections, getStudentSchedule }
