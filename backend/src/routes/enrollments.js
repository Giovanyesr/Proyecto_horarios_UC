const router     = require('express').Router()
const Enrollment = require('../models/Enrollment')
const { enrollStudent, getCreditSummary } = require('../services/enrollmentService')
const { verifyToken, requireAdmin } = require('../middleware/auth')

function paginate(total, page, size) {
  return { total, page, size, pages: total === 0 ? 1 : Math.ceil(total / size) }
}

// GET /api/v1/enrollments
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const size = Math.min(100, Math.max(1, parseInt(req.query.size) || 20))
    const { student_id, course_id, academic_period, status } = req.query

    const filter = {}
    if (student_id)      filter.student_id      = student_id
    if (course_id)       filter.course_id        = course_id
    if (academic_period) filter.academic_period  = academic_period
    if (status)          filter.status           = status

    const [items, total] = await Promise.all([
      Enrollment.find(filter).populate('course_id').populate('student_id')
        .skip((page - 1) * size).limit(size).sort({ enrolled_at: -1 }),
      Enrollment.countDocuments(filter),
    ])
    res.json({ items, ...paginate(total, page, size) })
  } catch (err) { next(err) }
})

// GET /api/v1/enrollments/credits-summary  (must be before /:id)
router.get('/credits-summary', verifyToken, async (req, res, next) => {
  try {
    const { student_id, academic_period } = req.query
    if (!student_id || !academic_period) return res.status(400).json({ detail: 'student_id y academic_period son requeridos' })
    const summary = await getCreditSummary(student_id, academic_period)
    res.json(summary)
  } catch (err) { next(err) }
})

// POST /api/v1/enrollments
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const enrollment = await enrollStudent(req.body)
    res.status(201).json(enrollment)
  } catch (err) { next(err) }
})

// GET /api/v1/enrollments/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate('course_id').populate('student_id')
    if (!enrollment) return res.status(404).json({ detail: 'Enrollment not found' })
    res.json(enrollment)
  } catch (err) { next(err) }
})

// PATCH /api/v1/enrollments/:id/status
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body
    const valid = new Set(['enrolled', 'completed', 'dropped', 'failed'])
    if (!valid.has(status)) return res.status(400).json({ detail: `Invalid status. Valid: ${[...valid].join(', ')}` })
    const enrollment = await Enrollment.findById(req.params.id)
    if (!enrollment) return res.status(404).json({ detail: 'Enrollment not found' })
    enrollment.status = status
    await enrollment.save()
    res.json(enrollment)
  } catch (err) { next(err) }
})

// DELETE /api/v1/enrollments/:id
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
    if (!enrollment) return res.status(404).json({ detail: 'Enrollment not found' })
    await enrollment.deleteOne()
    res.json({ message: 'Enrollment deleted' })
  } catch (err) { next(err) }
})

module.exports = router
