const router = require('express').Router()
const svc    = require('../services/scheduleService')
const { verifyToken, requireAdmin } = require('../middleware/auth')

// POST /api/v1/schedules/generate
router.post('/generate', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { academic_period, config = {} } = req.body
    if (!academic_period) return res.status(400).json({ detail: 'academic_period es requerido' })
    const run = await svc.generateSchedule(academic_period, config)
    res.status(201).json(run)
  } catch (err) { next(err) }
})

// GET /api/v1/schedules/runs
router.get('/runs', verifyToken, async (req, res, next) => {
  try {
    const { academic_period, status } = req.query
    const runs = await svc.getRuns({ academicPeriod: academic_period, status })
    res.json(runs)
  } catch (err) { next(err) }
})

// GET /api/v1/schedules/runs/:run_id
router.get('/runs/:run_id', verifyToken, async (req, res, next) => {
  try {
    const run = await svc.getRun(req.params.run_id)
    if (!run) return res.status(404).json({ detail: 'Schedule run not found' })
    res.json(run)
  } catch (err) { next(err) }
})

// GET /api/v1/schedules/runs/:run_id/sections
router.get('/runs/:run_id/sections', verifyToken, async (req, res, next) => {
  try {
    const run = await svc.getRun(req.params.run_id)
    if (!run) return res.status(404).json({ detail: 'Schedule run not found' })
    const { course_id, teacher_id, classroom_id } = req.query
    const sections = await svc.getSections(req.params.run_id, { courseId: course_id, teacherId: teacher_id, classroomId: classroom_id })
    res.json(sections)
  } catch (err) { next(err) }
})

// GET /api/v1/schedules/runs/:run_id/student/:student_id
router.get('/runs/:run_id/student/:student_id', verifyToken, async (req, res, next) => {
  try {
    const run = await svc.getRun(req.params.run_id)
    if (!run) return res.status(404).json({ detail: 'Run not found' })
    const sections = await svc.getStudentSchedule(req.params.run_id, req.params.student_id)
    res.json(sections)
  } catch (err) { next(err) }
})

// DELETE /api/v1/schedules/runs/:run_id
router.delete('/runs/:run_id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const run = await svc.getRun(req.params.run_id)
    if (!run) return res.status(404).json({ detail: 'Run not found' })
    await run.deleteOne()
    res.json({ message: 'Run deleted' })
  } catch (err) { next(err) }
})

module.exports = router
