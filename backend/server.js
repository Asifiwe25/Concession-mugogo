require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')
const morgan  = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')

const app = express()

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts' })
app.use('/api/', limiter)
app.use('/api/auth/login', authLimiter)

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./src/routes/auth'))
app.use('/api/users',       require('./src/routes/users'))
app.use('/api/employees',   require('./src/routes/employees'))
app.use('/api/animals',     require('./src/routes/animals'))
app.use('/api/crops',       require('./src/routes/crops'))
app.use('/api/harvests',    require('./src/routes/harvests'))
app.use('/api/stock',       require('./src/routes/stock'))
app.use('/api/machines',    require('./src/routes/machines'))
app.use('/api/tasks',       require('./src/routes/tasks'))
app.use('/api/finance',     require('./src/routes/finance'))
app.use('/api/alerts',      require('./src/routes/alerts'))
app.use('/api/zones',       require('./src/routes/zones'))
app.use('/api/concessions', require('./src/routes/concessions'))
app.use('/api/audit',       require('./src/routes/audit'))
app.use('/api/reports',     require('./src/routes/reports'))
app.use('/api/dashboard',   require('./src/routes/dashboard'))

// Health check
app.get('/api/health', (req, res) => res.json({
  status: 'OK',
  system: 'Concession Mugogo ERP',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}))

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n🌿 Concession Mugogo ERP — Backend running`)
  console.log(`   ✅ http://localhost:${PORT}`)
  console.log(`   📊 API: http://localhost:${PORT}/api/health\n`)
})

module.exports = app
