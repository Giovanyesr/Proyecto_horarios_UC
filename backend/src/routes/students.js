const router  = require('express').Router()
const Student = require('../models/Student')
const Enrollment = require('../models/Enrollment')
const StudentAvailability = require('../models/StudentAvailability')
const { verifyToken, requireAdmin } = require('../middleware/auth')

function paginate(total, page, size) {
  return { total, page, size, pages: total === 0 ? 1 : Math.ceil(total / size) }
}

// GET /api/v1/students
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page)  || 1)
    const size      = Math.min(200, Math.max(1, parseInt(req.query.size) || 20))
    const { search, is_active } = req.query

    const filter = {}
    if (search) {
      const re = new RegExp(search, 'i')
      filter.$or = [{ first_name: re }, { last_name: re }, { email: re }, { student_code: re }]
    }
    if (is_active !== undefined) filter.is_active = is_active === 'true'

    const [items, total] = await Promise.all([
      Student.findOne ? Student.find(filter).skip((page - 1) * size).limit(size).sort({ created_at: -1 }) : [],
      Student.countDocuments(filter),
    ])
    res.json({ items, ...paginate(total, page, size) })
  } catch (err) { next(err) }
})

// POST /api/v1/students
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const student = await Student.create(req.body)
    res.status(201).json(student)
  } catch (err) { next(err) }
})

// GET /api/v1/students/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ detail: 'Estudiante no encontrado' })
    res.json(student)
  } catch (err) { next(err) }
})

// PUT /api/v1/students/:id
router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ detail: 'Estudiante no encontrado' })
    const allowed = ['student_code', 'first_name', 'last_name', 'email', 'semester', 'is_active']
    allowed.forEach(f => { if (req.body[f] !== undefined) student[f] = req.body[f] })
    student.updated_at = new Date()
    await student.save()
    res.json(student)
  } catch (err) { next(err) }
})

// DELETE /api/v1/students/:id  (soft delete)
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ detail: 'Estudiante no encontrado' })
    student.is_active = false
    student.updated_at = new Date()
    await student.save()
    res.json(student)
  } catch (err) { next(err) }
})

// PATCH /api/v1/students/:id/academic
router.patch('/:id/academic', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ detail: 'Estudiante no encontrado' })
    const { max_credits, academic_status, mandatory_course_id } = req.body
    if (max_credits !== undefined)       student.max_credits = max_credits
    if (academic_status !== undefined)   student.academic_status = academic_status
    if (mandatory_course_id !== undefined) student.mandatory_course_id = mandatory_course_id || null
    student.updated_at = new Date()
    await student.save()
    res.json(student)
  } catch (err) { next(err) }
})

// GET /api/v1/students/:id/enrollments
router.get('/:id/enrollments', verifyToken, async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ detail: 'Estudiante no encontrado' })
    const enrollments = await Enrollment.find({ student_id: req.params.id })
      .populate('course_id').limit(200)
    res.json(enrollments)
  } catch (err) { next(err) }
})

// GET /api/v1/students/:id/availability
router.get('/:id/availability', verifyToken, async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ detail: 'Estudiante no encontrado' })
    const slots = await StudentAvailability.find({ student_id: req.params.id })
    res.json(slots)
  } catch (err) { next(err) }
})

// PUT /api/v1/students/:id/availability
router.put('/:id/availability', verifyToken, async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ detail: 'Estudiante no encontrado' })
    await StudentAvailability.deleteMany({ student_id: req.params.id })
    const slots = (req.body.slots ?? []).map(s => ({ student_id: req.params.id, ...s }))
    const created = slots.length > 0 ? await StudentAvailability.insertMany(slots) : []
    res.json(created)
  } catch (err) { next(err) }
})

module.exports = router
