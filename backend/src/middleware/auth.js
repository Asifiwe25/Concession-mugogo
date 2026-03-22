const jwt = require('jsonwebtoken')
const { query } = require('../config/database')

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const result = await query('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.userId])
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Utilisateur introuvable ou inactif' })
    }

    req.user = result.rows[0]
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Token invalide' })
  }
}

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé — permissions insuffisantes' })
  }
  next()
}

const logAction = (action, module) => async (req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = async (data) => {
    if (res.statusCode < 400 && req.user) {
      try {
        await query(
          `INSERT INTO audit_logs (user_id, action, module, details, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            req.user.id, action, module,
            JSON.stringify({ method: req.method, path: req.path, body: req.body }),
            req.ip || req.connection.remoteAddress,
            req.get('User-Agent'),
          ]
        )
      } catch (e) { console.error('Audit log error:', e.message) }
    }
    return originalJson(data)
  }
  next()
}

module.exports = { authenticate, authorize, logAction }
