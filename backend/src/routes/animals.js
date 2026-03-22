const express = require('express')
const router  = express.Router()
const { query } = require('../config/database')
const { authenticate, authorize, logAction } = require('../middleware/auth')

// GET /api/animals — List all animals
router.get('/', authenticate, async (req, res) => {
  try {
    const { species, status, zone_id, sex, search, limit = 50, offset = 0 } = req.query
    let sql = `
      SELECT a.*, z.name AS zone_name,
             EXTRACT(YEAR FROM AGE(NOW(), a.birth_date)) || ' ans' AS age_display
      FROM animals a
      LEFT JOIN zones z ON a.zone_id = z.id
      WHERE 1=1
    `
    const params = []
    let p = 1

    if (species) { sql += ` AND a.species = $${p++}`; params.push(species) }
    if (status)  { sql += ` AND a.health_status = $${p++}`; params.push(status) }
    if (zone_id) { sql += ` AND a.zone_id = $${p++}`; params.push(zone_id) }
    if (sex)     { sql += ` AND a.sex = $${p++}`; params.push(sex) }
    if (search)  { sql += ` AND (a.system_id ILIKE $${p} OR a.local_name ILIKE $${p} OR a.breed ILIKE $${p})`; params.push(`%${search}%`); p++ }

    sql += ` ORDER BY a.created_at DESC LIMIT $${p++} OFFSET $${p++}`
    params.push(parseInt(limit), parseInt(offset))

    const result = await query(sql, params)
    const count  = await query('SELECT COUNT(*) FROM animals WHERE 1=1', [])

    res.json({ data: result.rows, total: parseInt(count.rows[0].count) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/animals/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT a.*, z.name AS zone_name
      FROM animals a LEFT JOIN zones z ON a.zone_id = z.id
      WHERE a.id = $1`, [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Animal introuvable' })

    // Load health records
    const health = await query('SELECT * FROM animal_health_records WHERE animal_id = $1 ORDER BY date DESC', [req.params.id])
    // Load vaccinations
    const vaccines = await query('SELECT * FROM animal_vaccinations WHERE animal_id = $1 ORDER BY date DESC', [req.params.id])
    // Load production
    const production = await query('SELECT * FROM animal_production WHERE animal_id = $1 ORDER BY date DESC LIMIT 30', [req.params.id])
    // Load reproduction
    const repro = await query('SELECT * FROM animal_reproduction WHERE animal_id = $1 ORDER BY date DESC', [req.params.id])

    res.json({
      ...result.rows[0],
      healthRecords: health.rows,
      vaccinations:  vaccines.rows,
      production:    production.rows,
      reproduction:  repro.rows,
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/animals — Create animal
router.post('/', authenticate, authorize('super_admin','director','livestock_manager','vet','shepherd'),
  logAction('create', 'livestock'),
  async (req, res) => {
    try {
      const {
        species, breed, sex, local_name, tag_number, birth_date, estimated_age,
        color, weight_entry, origin, supplier_name, purchase_date, purchase_price,
        zone_id, responsible_id, health_status, quarantine, vet_notes,
        mother_id, father_id,
      } = req.body

      // Auto-generate system ID: BOV-2025-042
      const prefix = (species || 'ANI').toUpperCase().slice(0, 3)
      const countResult = await query('SELECT COUNT(*) FROM animals WHERE species = $1', [species])
      const num = String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0')
      const year = new Date().getFullYear()
      const system_id = `${prefix}-${year}-${num}`

      const result = await query(`
        INSERT INTO animals (
          system_id, species, breed, sex, local_name, tag_number, birth_date,
          estimated_age, color, weight_entry, weight_current, origin,
          supplier_name, purchase_date, purchase_price, zone_id,
          responsible_id, health_status, quarantine, vet_notes_entry,
          mother_id, father_id, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
        ) RETURNING *`,
        [
          system_id, species, breed, sex, local_name, tag_number,
          birth_date || null, estimated_age, color,
          parseFloat(weight_entry) || null, origin,
          supplier_name, purchase_date || null,
          parseFloat(purchase_price) || null,
          zone_id || null, responsible_id || null,
          health_status || 'good',
          quarantine !== undefined ? quarantine : true,
          vet_notes, mother_id || null, father_id || null,
          req.user.id,
        ]
      )

      // Record purchase in finance if price provided
      if (purchase_price) {
        await query(`
          INSERT INTO transactions (type, category, description, amount, transaction_date, created_by)
          VALUES ('expense', 'animal_purchase', $1, $2, $3, $4)`,
          [`Achat animal ${system_id}`, parseFloat(purchase_price), purchase_date || new Date(), req.user.id]
        )
      }

      // Auto-create quarantine task if needed
      if (quarantine) {
        await query(`
          INSERT INTO tasks (title, description, category, priority, status, due_date, created_by)
          VALUES ($1, $2, 'livestock', 'high', 'todo', $3, $4)`,
          [
            `Quarantaine — ${system_id}`,
            `Surveiller l'animal ${system_id} pendant 14 jours. Entrée: ${new Date().toLocaleDateString()}`,
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            req.user.id,
          ]
        )
      }

      res.status(201).json(result.rows[0])
    } catch (err) { res.status(500).json({ error: err.message }) }
  }
)

// PUT /api/animals/:id
router.put('/:id', authenticate, authorize('super_admin','director','livestock_manager','vet'),
  logAction('update', 'livestock'),
  async (req, res) => {
    try {
      const fields = ['species','breed','sex','local_name','tag_number','birth_date',
        'color','weight_current','zone_id','responsible_id','health_status','quarantine']
      const updates = []
      const params  = []
      let p = 1

      fields.forEach(f => {
        if (req.body[f] !== undefined) {
          updates.push(`${f} = $${p++}`)
          params.push(req.body[f])
        }
      })

      if (updates.length === 0) return res.status(400).json({ error: 'Aucun champ à mettre à jour' })

      params.push(req.params.id)
      const result = await query(
        `UPDATE animals SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${p} RETURNING *`,
        params
      )
      if (result.rows.length === 0) return res.status(404).json({ error: 'Animal introuvable' })
      res.json(result.rows[0])
    } catch (err) { res.status(500).json({ error: err.message }) }
  }
)

// DELETE /api/animals/:id (soft delete — mark as archived)
router.delete('/:id', authenticate, authorize('super_admin','director'),
  logAction('delete', 'livestock'),
  async (req, res) => {
    try {
      await query('UPDATE animals SET archived = true, archived_at = NOW() WHERE id = $1', [req.params.id])
      res.json({ message: 'Animal archivé' })
    } catch (err) { res.status(500).json({ error: err.message }) }
  }
)

// POST /api/animals/:id/health — Add health record
router.post('/:id/health', authenticate, authorize('super_admin','director','livestock_manager','vet'),
  async (req, res) => {
    try {
      const { disease, symptoms, diagnosis_date, treatment, vet_name, evolution } = req.body
      const result = await query(`
        INSERT INTO animal_health_records (animal_id, disease, symptoms, diagnosis_date, treatment, vet_name, evolution, created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [req.params.id, disease, symptoms, diagnosis_date, treatment, vet_name, evolution, req.user.id]
      )
      // Update animal health status
      await query(`UPDATE animals SET health_status = 'sick', updated_at = NOW() WHERE id = $1`, [req.params.id])
      res.status(201).json(result.rows[0])
    } catch (err) { res.status(500).json({ error: err.message }) }
  }
)

// POST /api/animals/:id/vaccination — Add vaccination
router.post('/:id/vaccination', authenticate, authorize('super_admin','director','livestock_manager','vet'),
  async (req, res) => {
    try {
      const { vaccine_name, date, lot_number, next_date, vet_name, supplier } = req.body
      const result = await query(`
        INSERT INTO animal_vaccinations (animal_id, vaccine_name, date, lot_number, next_date, vet_name, supplier, created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [req.params.id, vaccine_name, date, lot_number, next_date, vet_name, supplier, req.user.id]
      )
      res.status(201).json(result.rows[0])
    } catch (err) { res.status(500).json({ error: err.message }) }
  }
)

// POST /api/animals/:id/production — Record daily production
router.post('/:id/production', authenticate,
  async (req, res) => {
    try {
      const { production_type, quantity, unit, morning, afternoon, evening, quality_notes } = req.body
      const result = await query(`
        INSERT INTO animal_production (animal_id, production_type, quantity, unit, morning, afternoon, evening, quality_notes, date, created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_DATE,$9) RETURNING *`,
        [req.params.id, production_type, quantity, unit, morning, afternoon, evening, quality_notes, req.user.id]
      )
      res.status(201).json(result.rows[0])
    } catch (err) { res.status(500).json({ error: err.message }) }
  }
)

// GET /api/animals/stats/summary — Dashboard stats
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const total     = await query("SELECT COUNT(*) FROM animals WHERE archived = false")
    const healthy   = await query("SELECT COUNT(*) FROM animals WHERE health_status = 'healthy' AND archived = false")
    const sick      = await query("SELECT COUNT(*) FROM animals WHERE health_status = 'sick' AND archived = false")
    const quarantine= await query("SELECT COUNT(*) FROM animals WHERE quarantine = true AND archived = false")
    const bySpecies = await query("SELECT species, COUNT(*) AS count FROM animals WHERE archived = false GROUP BY species")
    const deceased  = await query("SELECT COUNT(*) FROM animals WHERE health_status = 'deceased' AND archived = false")

    res.json({
      total:      parseInt(total.rows[0].count),
      healthy:    parseInt(healthy.rows[0].count),
      sick:       parseInt(sick.rows[0].count),
      quarantine: parseInt(quarantine.rows[0].count),
      deceased:   parseInt(deceased.rows[0].count),
      bySpecies:  bySpecies.rows,
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
