require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const connectDB = require('./src/config/db')
const errorHandler = require('./src/middleware/errorHandler')

const app = express()

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB()

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}))

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))

// ── Rate limiting (global) ────────────────────────────────────────────────────
app.use('/api/v1/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { detail: 'Demasiados intentos, espera 15 minutos' },
}))

app.use('/api/v1', rateLimit({
  windowMs: 60 * 1000,
  max: 200,
}))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',       require('./src/routes/auth'))
app.use('/api/v1/students',   require('./src/routes/students'))
app.use('/api/v1/teachers',   require('./src/routes/teachers'))
app.use('/api/v1/courses',    require('./src/routes/courses'))
app.use('/api/v1/classrooms', require('./src/routes/classrooms'))
app.use('/api/v1/enrollments',require('./src/routes/enrollments'))
app.use('/api/v1/schedules',  require('./src/routes/schedules'))

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ detail: 'Not found' }))

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`)
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`)
})
