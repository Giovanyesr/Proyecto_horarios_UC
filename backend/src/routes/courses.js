const router = require('express').Router()
const Course = require('../models/Course')
const { addPrerequisite, removePrerequisite } = require('../services/courseService')
const { verifyToken, requireAdmin } = require('../middleware/auth')

function paginate(total, page, size) {
  return { total, page, size, pages: total === 0 ? 1 : Math.ceil(total / size) }
}

// GET /api/v1/courses
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const size = Math.min(100, Math.max(1, parseInt(req.query.size) || 20))
    const { search, department, semester_level, is_active } = req.query

    const filter = {}
    if (search) {
      const re = new RegExp(search, 'i')
      filter.$or = [{ name: re }, { course_code: re }, { department: re }]
    }
    if (department)     filter.department = new RegExp(department, 'i')
    if (semester_level) filter.semester_level = parseInt(semester_level)
    if (is_active !== undefined) filter.is_active = is_active === 'true'

    const [items, total] = await Promise.all([
      Course.find(filter).populate('prerequisites').skip((page - 1) * size).limit(size).sort({ course_code: 1 }),
      Course.countDocuments(filter),
    ])
    res.json({ items, ...paginate(total, page, size) })
  } catch (err) { next(err) }
})

// POST /api/v1/courses
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const course = await Course.create(req.body)
    res.status(201).json(course)
  } catch (err) { next(err) }
})

// GET /api/v1/courses/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('prerequisites')
    if (!course) return res.status(404).json({ detail: 'Course not found' })
    res.json(course)
  } catch (err) { next(err) }
})

// PUT /api/v1/courses/:id
router.put('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ detail: 'Course not found' })
    const allowed = ['course_code', 'name', 'credits', 'hours_per_week', 'semester_level', 'required_room_type', 'min_students', 'max_students', 'department', 'is_active']
    allowed.forEach(f => { if (req.body[f] !== undefined) course[f] = req.body[f] })
    await course.save()
    res.json(await Course.findById(course._id).populate('prerequisites'))
  } catch (err) { next(err) }
})

// DELETE /api/v1/courses/:id  (soft delete)
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ detail: 'Course not found' })
    course.is_active = false
    await course.save()
    res.json(course)
  } catch (err) { next(err) }
})

// GET /api/v1/courses/:id/prerequisites
router.get('/:id/prerequisites', verifyToken, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('prerequisites')
    if (!course) return res.status(404).json({ detail: 'Course not found' })
    res.json(course.prerequisites)
  } catch (err) { next(err) }
})

// POST /api/v1/courses/:id/prerequisites
router.post('/:id/prerequisites', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { prerequisite_id } = req.body
    const course = await addPrerequisite(req.params.id, prerequisite_id)
    res.status(201).json(course)
  } catch (err) { next(err) }
})

// DELETE /api/v1/courses/:id/prerequisites/:prereq_id
router.delete('/:id/prerequisites/:prereq_id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const course = await removePrerequisite(req.params.id, req.params.prereq_id)
    res.json(course)
  } catch (err) { next(err) }
})

module.exports = router
