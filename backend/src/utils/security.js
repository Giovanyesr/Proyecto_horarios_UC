const LoginAttempt = require('../models/LoginAttempt')

const MAX_ATTEMPTS   = 5
const LOCKOUT_MS     = 15 * 60 * 1000
const WINDOW_MS      = 15 * 60 * 1000

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.ip || req.socket?.remoteAddress || 'unknown'
}

async function checkLockout(username, ipAddress) {
  const windowStart = new Date(Date.now() - WINDOW_MS)
  const normalizedUsername = username.toLowerCase().trim()

  const [usernameFails, ipFails] = await Promise.all([
    LoginAttempt.countDocuments({
      username: normalizedUsername,
      success: false,
      attempted_at: { $gte: windowStart },
    }),
    LoginAttempt.countDocuments({
      ip_address: ipAddress,
      success: false,
      attempted_at: { $gte: windowStart },
    }),
  ])

  if (usernameFails >= MAX_ATTEMPTS || ipFails >= MAX_ATTEMPTS * 2) {
    const latest = await LoginAttempt.findOne({
      username: normalizedUsername,
      success: false,
    }).sort({ attempted_at: -1 })

    const lockedUntil = latest
      ? new Date(latest.attempted_at.getTime() + LOCKOUT_MS)
      : new Date(Date.now() + LOCKOUT_MS)

    const remainingMs = Math.max(0, lockedUntil - Date.now())
    const remainingMin = Math.ceil(remainingMs / 60000)

    const err = new Error(
      `Demasiados intentos fallidos. Cuenta bloqueada por ${remainingMin} minuto(s). Inténtalo más tarde.`
    )
    err.status = 429
    err.retryAfter = Math.ceil(remainingMs / 1000)
    throw err
  }
}

async function recordAttempt(username, ipAddress, success) {
  await LoginAttempt.create({
    username: username.toLowerCase().trim(),
    ip_address: ipAddress,
    success,
    attempted_at: new Date(),
  })
}

async function clearFailedAttempts(username) {
  await LoginAttempt.deleteMany({
    username: username.toLowerCase().trim(),
    success: false,
  })
}

async function purgeOldAttempts(olderThanHours = 24) {
  const cutoff = new Date(Date.now() - olderThanHours * 3600 * 1000)
  const result = await LoginAttempt.deleteMany({ attempted_at: { $lt: cutoff } })
  return result.deletedCount
}

module.exports = { getClientIp, checkLockout, recordAttempt, clearFailedAttempts, purgeOldAttempts }
