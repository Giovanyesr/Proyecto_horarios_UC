const router   = require('express').Router()
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const User     = require('../models/User')
const AllowedEmail = require('../models/AllowedEmail')
const LoginAttempt = require('../models/LoginAttempt')
const { verifyToken, requireAdmin } = require('../middleware/auth')
const { getClientIp, checkLockout, recordAttempt, clearFailedAttempts, purgeOldAttempts } = require('../utils/security')

function makeToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' })
}

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password, role } = req.body
    if (!username || !password) return res.status(400).json({ detail: 'username y password son requeridos' })
    const ip = getClientIp(req)

    try { await purgeOldAttempts(24) } catch (_) {}
    await checkLockout(username, ip)

    const realUser = await User.findOne({ username: username.trim() })
    const validPassword = realUser ? await bcrypt.compare(password, realUser.password_hash) : false

    if (!realUser || !validPassword) {
      await recordAttempt(username, ip, false)
      const windowStart = new Date(Date.now() - 15 * 60 * 1000)
      const failures = await LoginAttempt.countDocuments({
        username: username.toLowerCase().trim(),
        success: false,
        attempted_at: { $gte: windowStart },
      })
      const remaining = Math.max(0, 5 - failures)
      let msg = 'Usuario o contraseña incorrectos.'
      if (failures >= 3) msg += ` ${remaining} intento(s) restante(s) antes del bloqueo.`
      return res.status(401).json({ detail: msg })
    }

    if (role && realUser.role !== role) {
      await recordAttempt(username, ip, false)
      return res.status(403).json({ detail: 'Rol incorrecto para este usuario.' })
    }

    if (!realUser.is_active) {
      return res.status(403).json({ detail: 'Cuenta inactiva. Contacta a administración.' })
    }

    await clearFailedAttempts(username)
    await recordAttempt(username, ip, true)

    const token = makeToken({ sub: realUser._id.toString(), role: realUser.role })
    return res.json({
      access_token: token,
      role: realUser.role,
      user_id: realUser._id.toString(),
      username: realUser.username,
      student_id: realUser.student_id ? realUser.student_id.toString() : null,
    })
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).set('Retry-After', String(err.retryAfter ?? 900))
        .json({ detail: err.message })
    }
    next(err)
  }
})

// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
  try {
    let { email, username, password } = req.body
    const ip = getClientIp(req)
    if (!email || !username || !password) return res.status(400).json({ detail: 'email, username y password son requeridos' })

    email    = email.toLowerCase().trim()
    username = username.trim()

    if (username.length < 4) return res.status(400).json({ detail: 'El nombre de usuario debe tener al menos 4 caracteres.' })
    if (password.length < 6) return res.status(400).json({ detail: 'La contraseña debe tener al menos 6 caracteres.' })
    if (username.includes(' ')) return res.status(400).json({ detail: 'El nombre de usuario no puede contener espacios.' })

    const allowed = await AllowedEmail.findOne({ email })
    if (!allowed) {
      await recordAttempt(username, ip, false)
      return res.status(400).json({ detail: 'Correo no autorizado. Contacta a administración.' })
    }
    if (allowed.is_used) return res.status(400).json({ detail: 'Este correo ya fue utilizado para registrarse.' })
    if (await User.findOne({ username })) return res.status(400).json({ detail: 'El nombre de usuario ya está en uso.' })

    const password_hash = await bcrypt.hash(password, 12)
    const user = await User.create({
      username,
      email,
      password_hash,
      role: 'student',
      student_id: allowed.student_id ?? null,
    })

    allowed.is_used = true
    await allowed.save()
    await recordAttempt(username, ip, true)

    const token = makeToken({ sub: user._id.toString(), role: user.role })
    return res.status(201).json({
      access_token: token,
      role: user.role,
      user_id: user._id.toString(),
      username: user.username,
      student_id: user.student_id ? user.student_id.toString() : null,
    })
  } catch (err) { next(err) }
})

// GET /api/v1/auth/me
router.get('/me', verifyToken, (req, res) => res.json(req.user))

// GET /api/v1/auth/users
router.get('/users', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find().sort({ created_at: -1 })
    res.json(users)
  } catch (err) { next(err) }
})

// POST /api/v1/auth/users
router.post('/users', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { username, email, password, role, student_id } = req.body
    if (await User.findOne({ username })) return res.status(400).json({ detail: 'El nombre de usuario ya existe' })
    const password_hash = await bcrypt.hash(password, 12)
    const user = await User.create({ username, email, password_hash, role, student_id: student_id ?? null })
    res.status(201).json(user)
  } catch (err) { next(err) }
})

// DELETE /api/v1/auth/users/:user_id
router.delete('/users/:user_id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.user_id)
    if (!user) return res.status(404).json({ detail: 'Usuario no encontrado' })
    if (user._id.toString() === req.user._id.toString()) return res.status(400).json({ detail: 'No puedes eliminarte a ti mismo' })
    await user.deleteOne()
    res.status(204).end()
  } catch (err) { next(err) }
})

// GET /api/v1/auth/lockout-status/:username
router.get('/lockout-status/:username', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { username } = req.params
    const windowStart = new Date(Date.now() - 15 * 60 * 1000)
    const failures = await LoginAttempt.countDocuments({
      username: username.toLowerCase().trim(),
      success: false,
      attempted_at: { $gte: windowStart },
    })
    const isLocked = failures >= 5
    let lockedUntil = null
    if (isLocked) {
      const latest = await LoginAttempt.findOne({
        username: username.toLowerCase().trim(),
        success: false,
      }).sort({ attempted_at: -1 })
      if (latest) lockedUntil = new Date(latest.attempted_at.getTime() + 15 * 60 * 1000)
    }
    res.json({ username, recent_failures: failures, is_locked: isLocked, locked_until: lockedUntil })
  } catch (err) { next(err) }
})

// DELETE /api/v1/auth/lockout/:username
router.delete('/lockout/:username', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    await LoginAttempt.deleteMany({ username: req.params.username.toLowerCase().trim(), success: false })
    res.status(204).end()
  } catch (err) { next(err) }
})

// GET /api/v1/auth/allowed-emails
router.get('/allowed-emails', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const emails = await AllowedEmail.find().sort({ created_at: -1 })
    res.json(emails)
  } catch (err) { next(err) }
})

// POST /api/v1/auth/allowed-emails
router.post('/allowed-emails', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { email, student_id, notes } = req.body
    const normalizedEmail = email?.toLowerCase().trim()
    if (await AllowedEmail.findOne({ email: normalizedEmail })) {
      return res.status(400).json({ detail: 'Este correo ya está en la lista de autorizados' })
    }
    const entry = await AllowedEmail.create({
      email: normalizedEmail,
      student_id: student_id ?? null,
      added_by_id: req.user._id,
      notes: notes ?? null,
    })
    res.status(201).json(entry)
  } catch (err) { next(err) }
})

// DELETE /api/v1/auth/allowed-emails/:entry_id
router.delete('/allowed-emails/:entry_id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const entry = await AllowedEmail.findById(req.params.entry_id)
    if (!entry) return res.status(404).json({ detail: 'Correo no encontrado' })
    await entry.deleteOne()
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router
