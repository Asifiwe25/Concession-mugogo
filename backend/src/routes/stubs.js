// Stub routes — each module follows same CRUD pattern as animals.js
const express = require('express')
const { query } = require('../config/database')
const { authenticate } = require('../middleware/auth')

// ── Users ─────────────────────────────────────────────────────────────────
const usersRouter = express.Router()
usersRouter.get('/', authenticate, async (req, res) => {
  try {
    const r = await query('SELECT id, full_name, email, phone, role, language, is_active, created_at FROM users ORDER BY full_name')
    res.json(r.rows)
  } catch(e) { res.status(500).json({error:e.message}) }
})
usersRouter.put('/:id/language', authenticate, async (req, res) => {
  const r = await query('UPDATE users SET language=$1 WHERE id=$2 RETURNING *', [req.body.language, req.params.id])
  res.json(r.rows[0])
})

// ── Employees ────────────────────────────────────────────────────────────
const empRouter = express.Router()
empRouter.get('/', authenticate, async (req, res) => {
  try {
    const r = await query('SELECT * FROM employees ORDER BY full_name')
    res.json({ data: r.rows, total: r.rowCount })
  } catch(e) { res.status(500).json({error:e.message}) }
})
empRouter.post('/', authenticate, async (req, res) => {
  try {
    const { first_name, last_name, phone, email, role, contract_type, salary, zone_id, hire_date } = req.body
    const r = await query(
      `INSERT INTO employees (first_name, last_name, phone, email, role, contract_type, salary, zone_id, hire_date, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active',$10) RETURNING *`,
      [first_name, last_name, phone, email, role, contract_type, salary, zone_id, hire_date, req.user?.id || null]
    )
    res.status(201).json(r.rows[0])
  } catch(e) { res.status(500).json({error:e.message}) }
})
empRouter.get('/:id', authenticate, async (req, res) => {
  const r = await query('SELECT * FROM employees WHERE id=$1', [req.params.id])
  if (!r.rows.length) return res.status(404).json({error:'Employé introuvable'})
  res.json(r.rows[0])
})
empRouter.put('/:id', authenticate, async (req, res) => {
  const { status, zone_id, salary } = req.body
  const r = await query('UPDATE employees SET status=$1, zone_id=$2, salary=$3, updated_at=NOW() WHERE id=$4 RETURNING *',
    [status, zone_id, salary, req.params.id])
  res.json(r.rows[0])
})

// ── Crops ─────────────────────────────────────────────────────────────────
const cropsRouter = express.Router()
cropsRouter.get('/', authenticate, async (req,res) => {
  const r = await query('SELECT * FROM crops ORDER BY planting_date DESC')
  res.json({ data: r.rows, total: r.rowCount })
})
cropsRouter.post('/', authenticate, async (req,res) => {
  const { crop_type, variety, zone_id, area_ha, planting_date, expected_harvest_date, responsible_id } = req.body
  const r = await query(
    `INSERT INTO crops (crop_type, variety, zone_id, area_ha, planting_date, expected_harvest_date, status, responsible_id, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,'growing',$7,$8) RETURNING *`,
    [crop_type, variety, zone_id, area_ha, planting_date, expected_harvest_date, responsible_id, req.user?.id]
  )
  res.status(201).json(r.rows[0])
})

// ── Harvests ──────────────────────────────────────────────────────────────
const harvestsRouter = express.Router()
harvestsRouter.get('/', authenticate, async (req,res) => {
  const r = await query('SELECT * FROM harvests ORDER BY harvest_date DESC')
  res.json({ data: r.rows, total: r.rowCount })
})
harvestsRouter.post('/', authenticate, async (req,res) => {
  const { crop_id, harvest_date, gross_quantity, net_quantity, quality_grade, destination, notes } = req.body
  const r = await query(
    `INSERT INTO harvests (crop_id, harvest_date, gross_quantity, net_quantity, quality_grade, destination, notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [crop_id, harvest_date, gross_quantity, net_quantity, quality_grade, destination, notes, req.user?.id]
  )
  res.status(201).json(r.rows[0])
})

// ── Stock ─────────────────────────────────────────────────────────────────
const stockRouter = express.Router()
stockRouter.get('/', authenticate, async (req,res) => {
  const r = await query('SELECT * FROM stock_items ORDER BY category, name')
  res.json({ data: r.rows, total: r.rowCount })
})
stockRouter.post('/', authenticate, async (req,res) => {
  const { name, category, quantity, unit, threshold, unit_price, supplier, expiry_date, location } = req.body
  const r = await query(
    `INSERT INTO stock_items (name, category, quantity, unit, threshold, unit_price, supplier, expiry_date, location, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [name, category, quantity, unit, threshold, unit_price, supplier, expiry_date, location, req.user?.id]
  )
  res.status(201).json(r.rows[0])
})
stockRouter.post('/movement', authenticate, async (req,res) => {
  const { item_id, movement_type, quantity, reason, zone_id, notes } = req.body
  const r = await query(
    `INSERT INTO stock_movements (item_id, movement_type, quantity, reason, zone_id, notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [item_id, movement_type, quantity, reason, zone_id, notes, req.user?.id]
  )
  const delta = movement_type === 'in' ? quantity : -quantity
  await query('UPDATE stock_items SET quantity = quantity + $1, updated_at=NOW() WHERE id=$2', [delta, item_id])
  res.status(201).json(r.rows[0])
})

// ── Machines ──────────────────────────────────────────────────────────────
const machinesRouter = express.Router()
machinesRouter.get('/', authenticate, async (req,res) => {
  const r = await query('SELECT * FROM machines ORDER BY type, brand')
  res.json({ data: r.rows, total: r.rowCount })
})

// ── Tasks ─────────────────────────────────────────────────────────────────
const tasksRouter = express.Router()
tasksRouter.get('/', authenticate, async (req,res) => {
  const r = await query('SELECT t.*, u.full_name AS assignee_name FROM tasks t LEFT JOIN users u ON t.assignee_id=u.id ORDER BY priority,due_date')
  res.json({ data: r.rows, total: r.rowCount })
})
tasksRouter.post('/', authenticate, async (req,res) => {
  const { title, description, category, priority, assignee_id, due_date, zone_id } = req.body
  const r = await query(
    `INSERT INTO tasks (title, description, category, priority, assignee_id, due_date, zone_id, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'todo',$8) RETURNING *`,
    [title, description, category, priority, assignee_id, due_date, zone_id, req.user?.id]
  )
  res.status(201).json(r.rows[0])
})
tasksRouter.put('/:id/status', authenticate, async (req,res) => {
  const r = await query('UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [req.body.status, req.params.id])
  res.json(r.rows[0])
})

// ── Finance ───────────────────────────────────────────────────────────────
const financeRouter = express.Router()
financeRouter.get('/transactions', authenticate, async (req,res) => {
  const r = await query('SELECT * FROM transactions ORDER BY transaction_date DESC LIMIT 100')
  res.json({ data: r.rows, total: r.rowCount })
})
financeRouter.post('/transactions', authenticate, async (req,res) => {
  const { type, category, description, amount, transaction_date, payment_method } = req.body
  const r = await query(
    `INSERT INTO transactions (type, category, description, amount, transaction_date, payment_method, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,'paid',$7) RETURNING *`,
    [type, category, description, amount, transaction_date, payment_method, req.user?.id]
  )
  res.status(201).json(r.rows[0])
})
financeRouter.get('/summary', authenticate, async (req,res) => {
  try {
    const rev = await query("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE type='income' AND DATE_TRUNC('month',transaction_date)=DATE_TRUNC('month',NOW())")
    const exp = await query("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE type='expense' AND DATE_TRUNC('month',transaction_date)=DATE_TRUNC('month',NOW())")
    res.json({ revenue: parseFloat(rev.rows[0].total), expenses: parseFloat(exp.rows[0].total), profit: parseFloat(rev.rows[0].total)-parseFloat(exp.rows[0].total) })
  } catch(e) { res.status(500).json({error:e.message}) }
})

// ── Alerts ────────────────────────────────────────────────────────────────
const alertsRouter = express.Router()
alertsRouter.get('/', authenticate, async (req,res) => {
  const r = await query("SELECT * FROM alerts WHERE status != 'resolved' ORDER BY priority DESC, created_at DESC")
  res.json({ data: r.rows, total: r.rowCount })
})
alertsRouter.put('/:id/resolve', authenticate, async (req,res) => {
  const r = await query("UPDATE alerts SET status='resolved', resolved_at=NOW(), resolved_by=$1 WHERE id=$2 RETURNING *", [req.user?.id, req.params.id])
  res.json(r.rows[0])
})

// ── Zones ─────────────────────────────────────────────────────────────────
const zonesRouter = express.Router()
zonesRouter.get('/', authenticate, async (req,res) => {
  const r = await query('SELECT * FROM zones ORDER BY name')
  res.json({ data: r.rows, total: r.rowCount })
})
zonesRouter.post('/', authenticate, async (req,res) => {
  const { name, code, type, area_ha, capacity, responsible_id } = req.body
  const r = await query(
    `INSERT INTO zones (name, code, type, area_ha, capacity, responsible_id, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,'active',$7) RETURNING *`,
    [name, code, type, area_ha, capacity, responsible_id, req.user?.id]
  )
  res.status(201).json(r.rows[0])
})

// ── Concessions ───────────────────────────────────────────────────────────
const concessionsRouter = express.Router()
concessionsRouter.get('/', authenticate, async (req,res) => {
  const r = await query('SELECT * FROM concessions ORDER BY name')
  res.json({ data: r.rows, total: r.rowCount })
})

// ── Audit ─────────────────────────────────────────────────────────────────
const auditRouter = express.Router()
auditRouter.get('/', authenticate, async (req,res) => {
  const r = await query('SELECT a.*, u.full_name FROM audit_logs a LEFT JOIN users u ON a.user_id=u.id ORDER BY a.created_at DESC LIMIT 200')
  res.json({ data: r.rows, total: r.rowCount })
})

// ── Reports ───────────────────────────────────────────────────────────────
const reportsRouter = express.Router()
reportsRouter.get('/livestock', authenticate, async (req,res) => {
  const summary = await query('SELECT species, COUNT(*) count, AVG(weight_current) avg_weight FROM animals WHERE archived=false GROUP BY species')
  res.json({ type:'livestock', data: summary.rows, generatedAt: new Date() })
})
reportsRouter.get('/hr', authenticate, async (req,res) => {
  const summary = await query("SELECT role, COUNT(*) count, AVG(salary) avg_salary FROM employees WHERE status='active' GROUP BY role")
  res.json({ type:'hr', data: summary.rows, generatedAt: new Date() })
})
reportsRouter.get('/finance', authenticate, async (req,res) => {
  const r = await query(`
    SELECT DATE_TRUNC('month', transaction_date) month,
           SUM(CASE WHEN type='income' THEN amount ELSE 0 END) revenue,
           SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) expenses
    FROM transactions GROUP BY 1 ORDER BY 1`)
  res.json({ type:'finance', data: r.rows, generatedAt: new Date() })
})

// ── Dashboard ─────────────────────────────────────────────────────────────
const dashboardRouter = express.Router()
dashboardRouter.get('/stats', authenticate, async (req,res) => {
  try {
    const [emp, animals, crops, rev, exp] = await Promise.all([
      query("SELECT COUNT(*) FROM employees WHERE status='active'"),
      query("SELECT COUNT(*) FROM animals WHERE archived=false"),
      query("SELECT COUNT(*) FROM crops WHERE status NOT IN ('harvested','lost')"),
      query("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='income' AND DATE_TRUNC('month',transaction_date)=DATE_TRUNC('month',NOW())"),
      query("SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='expense' AND DATE_TRUNC('month',transaction_date)=DATE_TRUNC('month',NOW())"),
    ])
    res.json({
      employees: parseInt(emp.rows[0].count),
      animals:   parseInt(animals.rows[0].count),
      crops:     parseInt(crops.rows[0].count),
      revenue:   parseFloat(rev.rows[0].coalesce),
      expenses:  parseFloat(exp.rows[0].coalesce),
    })
  } catch(e) { res.status(500).json({error:e.message}) }
})

module.exports = {
  usersRouter, empRouter, cropsRouter, harvestsRouter, stockRouter,
  machinesRouter, tasksRouter, financeRouter, alertsRouter,
  zonesRouter, concessionsRouter, auditRouter, reportsRouter, dashboardRouter,
}
