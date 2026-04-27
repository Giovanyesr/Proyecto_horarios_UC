const jwt = require('jsonwebtoken')
const User = require('../models/User')

const verifyToken = async (req, res, next) => {
  try {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'Token requerido' })
    }
    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.sub).select('-password_hash')
    if (!user || !user.is_active) {
      return res.status(401).json({ detail: 'Usuario no encontrado o inactivo' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ detail: 'Token inválido o expirado' })
  }
}

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ detail: 'Se requiere rol de administrador' })
  }
  next()
}

module.exports = { verifyToken, requireAdmin }
