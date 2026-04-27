const router    = require('express').Router()
const Classroom = require('../models/Classroom')
const { verifyToken, requireAdmin } = require('../middleware/auth')

function paginate(total, page, size) {
  return { total, page, size, pages: total === 0 ? 1 : Math.ceil(total / size) }
}

// GET /api/v1/classrooms
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const size = Math.min(100, Math.max(1, parseInt(req.query.size) || 20))
    const { room_type, min_capacity, is_active } = req.query

    const filter = {}
    if (room_type)    filter.room_type = room_type
    if (min_capacity) filter.capacity  = { $gte: parseInt(min_capacity) }
    if (is_active !== undefined) filter.is_active = is_active === 'true'

    const [items, total] = await Promise.all([
      Classroom.find(filter).skip((page - 1) * size).limit(size).sort({ room_code: 1 }),
      Classroom.countDocuments(filter),
    ])
    res.json({ items, ...paginate(total, page, size) })
  } catch (err) { next(err) }
})

// POST /api/v1/classrooms
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const classroom = await Classroom.create(req.body)
    res.status(201).json(classroom)
  } catch (err) { next(err) }
})

// GET /api/v1/classrooms/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
    if (!classroom) return res.status(404).json({ detail: 'Classroom not found' })
    res.json(classroom)
  } catch (err) { next(err) }
})

// PUT /api/v1/classrooms/:id
router.put('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
    if (!classroom) return res.status(404).json({ detail: 'Classroom not found' })
    const allowed = ['room_code', 'building', 'capacity', 'room_type', 'has_projector', 'has_computers', 'is_active']
    allowed.forEach(f => { if (req.body[f] !== undefined) classroom[f] = req.body[f] })
    await classroom.save()
    res.json(classroom)
  } catch (err) { next(err) }
})

// DELETE /api/v1/classrooms/:id  (soft delete)
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
    if (!classroom) return res.status(404).json({ detail: 'Classroom not found' })
    classroom.is_active = false
    await classroom.save()
    res.json(classroom)
  } catch (err) { next(err) }
})

module.exports = router
