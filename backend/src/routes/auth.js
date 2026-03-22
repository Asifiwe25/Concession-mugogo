const express = require('express')
const router  = express.Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const { query } = require('../config/database')
const { authenticate } = require('../middleware/auth')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' })

    // Find user by email or phone
    const result = await query(
      'SELECT * FROM users WHERE (email = $1 OR phone = $1) AND is_active = true',
      [email]
    )
    if (result.rows.length === 0) return res.status(401).json({ error: 'Identifiants incorrects' })

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' })

    // Tokens
    const accessToken  = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' })
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    // Log
    await query(
      'INSERT INTO audit_logs (user_id, action, module, ip_address) VALUES ($1, $2, $3, $4)',
      [user.id, 'login', 'auth', req.ip]
    )

    res.json({
      user: {
        id: user.id, fullName: user.full_name, email: user.email,
        phone: user.phone, role: user.role, language: user.language,
        concessionId: user.concession_id,
      },
      accessToken, refreshToken,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, language, farmName } = req.body

    const existing = await query('SELECT id FROM users WHERE email = $1 OR phone = $2', [email, phone])
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email ou téléphone déjà utilisé' })

    const usersCount = await query('SELECT COUNT(*) FROM users')
    const isFirst = parseInt(usersCount.rows[0].count) === 0
    const role = isFirst ? 'super_admin' : 'viewer'

    const hash = await bcrypt.hash(password, 12)
    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, language, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id, full_name, email, role, language`,
      [fullName, email, phone, hash, role, language || 'fr']
    )

    const user = result.rows[0]
    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' })

    res.status(201).json({ user, accessToken })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token requis' })

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    const result = await query('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.userId])
    if (result.rows.length === 0) return res.status(401).json({ error: 'Utilisateur introuvable' })

    const user = result.rows[0]
    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' })
    res.json({ accessToken })
  } catch (err) {
    res.status(401).json({ error: 'Refresh token invalide' })
  }
})

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const u = req.user
  res.json({
    id: u.id, fullName: u.full_name, email: u.email,
    phone: u.phone, role: u.role, language: u.language,
  })
})

module.exports = router
