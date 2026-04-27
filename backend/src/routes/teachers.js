const router  = require('express').Router()
const Teacher = require('../models/Teacher')
const TeacherAvailability = require('../models/TeacherAvailability')
const { verifyToken, requireAdmin } = require('../middleware/auth')

function paginate(total, page, size) {
  return { total, page, size, pages: total === 0 ? 1 : Math.ceil(total / size) }
}

// GET /api/v1/teachers
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const size = Math.min(200, Math.max(1, parseInt(req.query.size) || 20))
    const { search, department, is_active } = req.query

    const filter = {}
    if (search) {
      const re = new RegExp(search, 'i')
      filter.$or = [{ first_name: re }, { last_name: re }, { email: re }, { teacher_code: re }]
    }
    if (department)  filter.department = new RegExp(department, 'i')
    if (is_active !== undefined) filter.is_active = is_active === 'true'

    const [items, total] = await Promise.all([
      Teacher.find(filter).skip((page - 1) * size).limit(size).sort({ created_at: -1 }),
      Teacher.countDocuments(filter),
    ])
    res.json({ items, ...paginate(total, page, size) })
  } catch (err) { next(err) }
})

// POST /api/v1/teachers
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const teacher = await Teacher.create(req.body)
    res.status(201).json(teacher)
  } catch (err) { next(err) }
})

// GET /api/v1/teachers/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
    if (!teacher) return res.status(404).json({ detail: 'Docente no encontrado' })
    res.json(teacher)
  } catch (err) { next(err) }
})

// PUT /api/v1/teachers/:id
router.put('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
    if (!teacher) return res.status(404).json({ detail: 'Docente no encontrado' })
    const allowed = ['teacher_code', 'first_name', 'last_name', 'email', 'department', 'max_hours_per_week', 'is_active']
    allowed.forEach(f => { if (req.body[f] !== undefined) teacher[f] = req.body[f] })
    teacher.updated_at = new Date()
    await teacher.save()
    res.json(teacher)
  } catch (err) { next(err) }
})

// DELETE /api/v1/teachers/:id  (soft delete)
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
    if (!teacher) return res.status(404).json({ detail: 'Docente no encontrado' })
    teacher.is_active = false
    teacher.updated_at = new Date()
    await teacher.save()
    res.json(teacher)
  } catch (err) { next(err) }
})

// GET /api/v1/teachers/:id/availability
router.get('/:id/availability', verifyToken, async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
    if (!teacher) return res.status(404).json({ detail: 'Docente no encontrado' })
    const slots = await TeacherAvailability.find({ teacher_id: req.params.id })
    res.json(slots)
  } catch (err) { next(err) }
})

// PUT /api/v1/teachers/:id/availability
router.put('/:id/availability', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
    if (!teacher) return res.status(404).json({ detail: 'Docente no encontrado' })
    await TeacherAvailability.deleteMany({ teacher_id: req.params.id })
    const slots = (req.body.slots ?? []).map(s => ({ teacher_id: req.params.id, ...s }))
    const created = slots.length > 0 ? await TeacherAvailability.insertMany(slots) : []
    res.json(created)
  } catch (err) { next(err) }
})

module.exports = router
