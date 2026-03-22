-- ============================================================
-- CONCESSION MUGOGO ERP — DATABASE MIGRATION
-- PostgreSQL 14+
-- Run: psql -U postgres -d mugogo_erp -f 001_initial_schema.sql
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. CONCESSIONS (Farms)
-- ============================================================
CREATE TABLE IF NOT EXISTS concessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(200) NOT NULL,
  location        VARCHAR(300),
  province        VARCHAR(100),
  territory       VARCHAR(100),
  village         VARCHAR(100),
  gps_lat         DECIMAL(10,8),
  gps_lng         DECIMAL(11,8),
  total_area_ha   DECIMAL(10,2),
  soil_type       VARCHAR(100),
  status          VARCHAR(50)  DEFAULT 'active' CHECK (status IN ('active','developing','paused','archived')),
  owner_name      VARCHAR(200),
  phone           VARCHAR(30),
  email           VARCHAR(200),
  land_title_ref  VARCHAR(100),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Insert default concession
INSERT INTO concessions (name, location, province, territory, status, total_area_ha)
VALUES ('Concession Mugogo', 'Mugogo, Sud-Kivu', 'Sud-Kivu', 'Walungu', 'active', 60.5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. ZONES & SUB-ZONES
-- ============================================================
CREATE TABLE IF NOT EXISTS zones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concession_id   UUID REFERENCES concessions(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  code            VARCHAR(20)  UNIQUE,
  type            VARCHAR(50)  CHECK (type IN ('pasture','cropland','mixed','forest','fallow','infrastructure')),
  area_ha         DECIMAL(10,2),
  capacity        INTEGER,  -- animals/ha recommended
  status          VARCHAR(50)  DEFAULT 'active' CHECK (status IN ('active','resting','developing','archived')),
  responsible_id  UUID,     -- FK to employees added later
  gps_polygon     TEXT,     -- GeoJSON polygon string
  notes           TEXT,
  created_by      UUID,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sub_zones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id         UUID REFERENCES zones(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  code            VARCHAR(30),
  area_ha         DECIMAL(10,2),
  specific_use    VARCHAR(200),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 3. USERS (System access)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name       VARCHAR(200) NOT NULL,
  email           VARCHAR(200) UNIQUE,
  phone           VARCHAR(30)  UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(50)  DEFAULT 'visitor' CHECK (role IN (
                    'super_admin','director','livestock_manager','farm_manager',
                    'hr_manager','accountant','vet','shepherd','farmer','visitor')),
  language        VARCHAR(10)  DEFAULT 'fr' CHECK (language IN ('fr','sw','mashi')),
  concession_id   UUID REFERENCES concessions(id),
  avatar_url      VARCHAR(500),
  is_active       BOOLEAN DEFAULT TRUE,
  last_login      TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Default super admin (password: Admin@2025)
INSERT INTO users (full_name, email, phone, password_hash, role, language)
VALUES ('Admin Mugogo', 'richardbunani2013@gmail.com', '+243810000000',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpz8/VPXAk5YOy',
        'super_admin', 'fr')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. EMPLOYEES
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concession_id   UUID REFERENCES concessions(id),
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  local_name      VARCHAR(100),  -- local nickname
  phone           VARCHAR(30),
  phone_secondary VARCHAR(30),
  email           VARCHAR(200),
  address         VARCHAR(300),
  birth_date      DATE,
  birth_place     VARCHAR(200),
  sex             VARCHAR(10)  CHECK (sex IN ('male','female')),
  nationality     VARCHAR(100),
  national_id     VARCHAR(100),
  emergency_name  VARCHAR(200),
  emergency_phone VARCHAR(30),
  role            VARCHAR(50)  CHECK (role IN (
                    'director','livestock_manager','farm_manager','hr_manager',
                    'accountant','vet','shepherd','farmer','driver','guard','other')),
  contract_type   VARCHAR(30)  CHECK (contract_type IN ('cdi','cdd','seasonal','volunteer','intern')),
  contract_end    DATE,
  hire_date       DATE,
  salary          DECIMAL(12,2),
  payment_method  VARCHAR(30)  DEFAULT 'cash' CHECK (payment_method IN ('cash','mpesa','airtel','bank')),
  zone_id         UUID REFERENCES zones(id),
  status          VARCHAR(30)  DEFAULT 'active' CHECK (status IN ('active','on_leave','suspended','archived')),
  user_id         UUID REFERENCES users(id),  -- if employee has app access
  qr_code         VARCHAR(200),
  photo_url       VARCHAR(500),
  language        VARCHAR(10)  DEFAULT 'fr',
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ── Attendance ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id     UUID REFERENCES employees(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  check_in        TIME,
  check_out       TIME,
  status          VARCHAR(30) CHECK (status IN ('present','absent','late','leave','holiday','sick')),
  hours_worked    DECIMAL(5,2),
  gps_lat         DECIMAL(10,8),
  gps_lng         DECIMAL(11,8),
  notes           VARCHAR(300),
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- ── Leave requests ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id     UUID REFERENCES employees(id),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  type            VARCHAR(50) CHECK (type IN ('annual','sick','maternity','paternity','exceptional')),
  reason          TEXT,
  status          VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMP,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ── Payroll ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payroll (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id     UUID REFERENCES employees(id),
  month           DATE NOT NULL,  -- first day of month
  base_salary     DECIMAL(12,2),
  overtime_amount DECIMAL(12,2) DEFAULT 0,
  bonuses         DECIMAL(12,2) DEFAULT 0,
  deductions      DECIMAL(12,2) DEFAULT 0,
  advances        DECIMAL(12,2) DEFAULT 0,
  net_salary      DECIMAL(12,2),
  payment_date    DATE,
  payment_method  VARCHAR(30),
  status          VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, month)
);

-- ============================================================
-- 5. ANIMALS (Livestock)
-- ============================================================
CREATE TABLE IF NOT EXISTS animals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concession_id    UUID REFERENCES concessions(id),
  system_id        VARCHAR(30)  UNIQUE NOT NULL,  -- BOV-2025-001
  tag_number       VARCHAR(100),                  -- official ear tag
  species          VARCHAR(50)  NOT NULL CHECK (species IN (
                     'bovine','goat','sheep','pig','poultry','equine','rabbit','fish','other')),
  breed            VARCHAR(100),
  sex              VARCHAR(20)  CHECK (sex IN ('male','female','unknown')),
  local_name       VARCHAR(100),
  birth_date       DATE,
  estimated_age    VARCHAR(50),
  color            VARCHAR(200),
  weight_entry     DECIMAL(8,2),    -- kg at entry
  weight_current   DECIMAL(8,2),    -- kg current
  zone_id          UUID REFERENCES zones(id),
  responsible_id   UUID REFERENCES employees(id),
  origin           VARCHAR(30)  CHECK (origin IN ('born_on_farm','purchased','donated','transferred')),
  supplier_name    VARCHAR(200),
  purchase_date    DATE,
  purchase_price   DECIMAL(12,2),
  invoice_ref      VARCHAR(100),
  mother_id        UUID REFERENCES animals(id),
  father_id        UUID REFERENCES animals(id),
  health_status    VARCHAR(30)  DEFAULT 'healthy' CHECK (health_status IN (
                     'healthy','sick','quarantine','treatment','deceased','sold')),
  quarantine       BOOLEAN DEFAULT FALSE,
  quarantine_end   DATE,
  castrated        BOOLEAN DEFAULT FALSE,
  repro_status     VARCHAR(50)  CHECK (repro_status IN (
                     'virgin','available','gestating','lactating','rest','retired')),
  vet_notes_entry  TEXT,
  photo_url        VARCHAR(500),
  archived         BOOLEAN DEFAULT FALSE,
  archived_at      TIMESTAMP,
  sold_date        DATE,
  sold_price       DECIMAL(12,2),
  death_date       DATE,
  death_cause      VARCHAR(300),
  qr_code          VARCHAR(200),
  notes            TEXT,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- ── Animal Health Records ────────────────────────────────────
CREATE TABLE IF NOT EXISTS animal_health_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id       UUID REFERENCES animals(id) ON DELETE CASCADE,
  disease         VARCHAR(200),
  symptoms        TEXT,
  diagnosis_date  DATE NOT NULL,
  treatment       TEXT,
  medication      VARCHAR(300),
  dosage          VARCHAR(100),
  duration_days   INTEGER,
  vet_name        VARCHAR(200),
  evolution       VARCHAR(50) CHECK (evolution IN ('recovering','cured','chronic','deceased')),
  cost            DECIMAL(10,2),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ── Animal Vaccinations ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS animal_vaccinations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id       UUID REFERENCES animals(id) ON DELETE CASCADE,
  vaccine_name    VARCHAR(200) NOT NULL,
  date            DATE NOT NULL,
  lot_number      VARCHAR(100),
  next_date       DATE,
  vet_name        VARCHAR(200),
  supplier        VARCHAR(200),
  cost            DECIMAL(10,2),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ── Animal Production ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS animal_production (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id       UUID REFERENCES animals(id) ON DELETE CASCADE,
  production_type VARCHAR(30) CHECK (production_type IN ('milk','eggs','wool','honey')),
  date            DATE NOT NULL,
  quantity        DECIMAL(10,3),
  unit            VARCHAR(20),
  morning         DECIMAL(8,3),
  afternoon       DECIMAL(8,3),
  evening         DECIMAL(8,3),
  quality_notes   VARCHAR(300),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ── Animal Reproduction ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS animal_reproduction (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id       UUID REFERENCES animals(id) ON DELETE CASCADE,
  event_type      VARCHAR(30) CHECK (event_type IN ('mating','insemination','gestation_confirmed','birth','abortion')),
  date            DATE NOT NULL,
  partner_id      UUID REFERENCES animals(id),
  method          VARCHAR(30) CHECK (method IN ('natural','ai')),  -- artificial insemination
  result          VARCHAR(50),
  offspring_count INTEGER,
  alive_count     INTEGER,
  dead_count      INTEGER,
  complications   TEXT,
  vet_name        VARCHAR(200),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ── Animal Weight History ────────────────────────────────────
CREATE TABLE IF NOT EXISTS animal_weights (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id       UUID REFERENCES animals(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  weight_kg       DECIMAL(8,2) NOT NULL,
  measured_by     UUID REFERENCES employees(id),
  notes           VARCHAR(300),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 6. CROPS (Agriculture)
-- ============================================================
CREATE TABLE IF NOT EXISTS crops (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concession_id         UUID REFERENCES concessions(id),
  zone_id               UUID REFERENCES zones(id),
  sub_zone_id           UUID REFERENCES sub_zones(id),
  crop_type             VARCHAR(100) NOT NULL,
  variety               VARCHAR(100),
  seed_source           VARCHAR(200),
  seed_lot              VARCHAR(100),
  area_ha               DECIMAL(10,3),
  seeding_density       VARCHAR(100),
  soil_prep_date        DATE,
  planting_date         DATE,
  expected_harvest_date DATE,
  actual_harvest_date   DATE,
  status                VARCHAR(30) DEFAULT 'planned' CHECK (status IN (
                          'planned','growing','flowering','fruiting','maturation','ready','harvested','lost')),
  health_score          INTEGER CHECK (health_score BETWEEN 0 AND 100),
  estimated_yield_t     DECIMAL(10,3),
  actual_yield_t        DECIMAL(10,3),
  responsible_id        UUID REFERENCES employees(id),
  irrigation_method     VARCHAR(50) CHECK (irrigation_method IN ('rain','drip','sprinkler','gravity','manual')),
  notes                 TEXT,
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- ── Crop Interventions (irrigation, fertilization, phyto) ──
CREATE TABLE IF NOT EXISTS crop_interventions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id         UUID REFERENCES crops(id) ON DELETE CASCADE,
  type            VARCHAR(50) CHECK (type IN ('irrigation','fertilization','pesticide','herbicide','fungicide','observation')),
  date            DATE NOT NULL,
  product         VARCHAR(200),
  dose            VARCHAR(100),
  method          VARCHAR(100),
  area_ha         DECIMAL(10,3),
  water_volume_l  DECIMAL(10,2),
  dar_days        INTEGER,   -- délai avant récolte (pesticides)
  cost            DECIMAL(10,2),
  employee_id     UUID REFERENCES employees(id),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 7. HARVESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS harvests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id         UUID REFERENCES crops(id),
  zone_id         UUID REFERENCES zones(id),
  harvest_date    DATE NOT NULL,
  gross_quantity  DECIMAL(10,3),   -- kg/tonnes
  net_quantity    DECIMAL(10,3),
  unit            VARCHAR(20) DEFAULT 'kg',
  quality_grade   VARCHAR(10) CHECK (quality_grade IN ('A','B','C','rejected')),
  moisture_pct    DECIMAL(5,2),
  destination     VARCHAR(50) CHECK (destination IN ('storage','direct_sale','processing','internal','donation')),
  buyer_name      VARCHAR(200),
  sale_price      DECIMAL(12,2),   -- per unit
  total_revenue   DECIMAL(12,2),
  machine_used    UUID,
  team_size       INTEGER,
  hours_worked    DECIMAL(6,2),
  losses_kg       DECIMAL(10,3),
  loss_cause      VARCHAR(200),
  weather         VARCHAR(100),
  photo_urls      TEXT,           -- JSON array
  delivery_note   VARCHAR(100),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 8. STOCK & INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concession_id   UUID REFERENCES concessions(id),
  name            VARCHAR(200) NOT NULL,
  reference       VARCHAR(100),
  category        VARCHAR(50) CHECK (category IN (
                    'seeds','fertilizers','medicines','pesticides',
                    'fuel','feed','spare_parts','tools','packaging','other')),
  quantity        DECIMAL(12,3) DEFAULT 0,
  unit            VARCHAR(30),
  threshold       DECIMAL(12,3),      -- alert threshold
  order_threshold DECIMAL(12,3),      -- auto-order threshold
  unit_price      DECIMAL(12,2),
  supplier        VARCHAR(200),
  supplier_phone  VARCHAR(30),
  location        VARCHAR(200),
  expiry_date     DATE,
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id         UUID REFERENCES stock_items(id) ON DELETE CASCADE,
  movement_type   VARCHAR(10) CHECK (movement_type IN ('in','out')),
  quantity        DECIMAL(12,3) NOT NULL,
  reason          VARCHAR(100),
  reference_type  VARCHAR(50),   -- 'crop_intervention','health_treatment','machine_fuel'
  reference_id    UUID,
  zone_id         UUID REFERENCES zones(id),
  unit_price      DECIMAL(12,2),
  supplier        VARCHAR(200),
  invoice_ref     VARCHAR(100),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 9. MACHINES & MAINTENANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS machines (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concession_id   UUID REFERENCES concessions(id),
  type            VARCHAR(50) CHECK (type IN ('tractor','cultivator','harvester','pump','generator','vehicle','sprayer','other')),
  brand           VARCHAR(100),
  model           VARCHAR(100),
  year            INTEGER,
  serial_number   VARCHAR(100),
  plate           VARCHAR(30),
  status          VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available','in_use','maintenance','out_of_service')),
  hours_counter   DECIMAL(10,1) DEFAULT 0,
  purchase_date   DATE,
  purchase_price  DECIMAL(12,2),
  current_value   DECIMAL(12,2),
  next_maintenance_at DECIMAL(10,1),  -- hours
  next_maintenance_date DATE,
  photo_url       VARCHAR(500),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machine_usage_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id      UUID REFERENCES machines(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  operator_id     UUID REFERENCES employees(id),
  zone_id         UUID REFERENCES zones(id),
  hours_used      DECIMAL(6,2),
  fuel_liters     DECIMAL(8,2),
  task_description VARCHAR(300),
  km_driven       DECIMAL(8,1),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machine_maintenance (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id      UUID REFERENCES machines(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  type            VARCHAR(30) CHECK (type IN ('preventive','corrective','inspection')),
  description     TEXT,
  cost            DECIMAL(10,2),
  technician      VARCHAR(200),
  parts_used      TEXT,   -- JSON
  hours_at_maintenance DECIMAL(10,1),
  next_maintenance_hours DECIMAL(10,1),
  next_maintenance_date DATE,
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 10. TASKS & WORKFLOW
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concession_id   UUID REFERENCES concessions(id),
  title           VARCHAR(300) NOT NULL,
  description     TEXT,
  category        VARCHAR(50) CHECK (category IN (
                    'livestock','crops','stock','hr','finance','infrastructure','maintenance','other')),
  priority        VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent','high','normal','low')),
  status          VARCHAR(30) DEFAULT 'todo' CHECK (status IN ('backlog','todo','in_progress','review','done','cancelled')),
  assignee_id     UUID REFERENCES employees(id),
  supervisor_id   UUID REFERENCES employees(id),
  due_date        DATE,
  completed_at    TIMESTAMP,
  zone_id         UUID REFERENCES zones(id),
  animal_id       UUID REFERENCES animals(id),
  crop_id         UUID REFERENCES crops(id),
  estimated_hours DECIMAL(5,2),
  actual_hours    DECIMAL(5,2),
  estimated_cost  DECIMAL(10,2),
  actual_cost     DECIMAL(10,2),
  is_recurring    BOOLEAN DEFAULT FALSE,
  recurrence_rule VARCHAR(100),  -- cron-like
  parent_task_id  UUID REFERENCES tasks(id),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  content     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_checklist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID REFERENCES tasks(id) ON DELETE CASCADE,
  item        VARCHAR(300) NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  order_num   INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 11. FINANCE & ACCOUNTING
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concession_id    UUID REFERENCES concessions(id),
  type             VARCHAR(10) CHECK (type IN ('income','expense')),
  category         VARCHAR(100),
  sub_category     VARCHAR(100),
  description      TEXT,
  amount           DECIMAL(14,2) NOT NULL,
  currency         VARCHAR(5) DEFAULT 'USD',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method   VARCHAR(30) CHECK (payment_method IN ('cash','mpesa','airtel','bank','cheque','other')),
  status           VARCHAR(30) DEFAULT 'paid' CHECK (status IN ('paid','pending','overdue','cancelled')),
  invoice_ref      VARCHAR(100),
  supplier_buyer   VARCHAR(200),
  animal_id        UUID REFERENCES animals(id),
  crop_id          UUID REFERENCES crops(id),
  employee_id      UUID REFERENCES employees(id),
  zone_id          UUID REFERENCES zones(id),
  attachment_url   VARCHAR(500),
  notes            TEXT,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concession_id   UUID REFERENCES concessions(id),
  fiscal_year     INTEGER NOT NULL,
  category        VARCHAR(100) NOT NULL,
  planned_amount  DECIMAL(14,2),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(concession_id, fiscal_year, category)
);

-- ============================================================
-- 12. ALERTS & NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concession_id   UUID REFERENCES concessions(id),
  type            VARCHAR(20) CHECK (type IN ('critical','high','normal','info')),
  category        VARCHAR(50) CHECK (category IN (
                    'animal_health','crops','stock','hr','finance','maintenance','security','other')),
  title           VARCHAR(300) NOT NULL,
  description     TEXT,
  reference_type  VARCHAR(50),   -- 'animal','crop','employee','stock_item'
  reference_id    UUID,
  status          VARCHAR(30) DEFAULT 'new' CHECK (status IN ('new','seen','in_progress','resolved','ignored')),
  assigned_to     UUID REFERENCES employees(id),
  resolved_by     UUID REFERENCES users(id),
  resolved_at     TIMESTAMP,
  resolution_note TEXT,
  auto_generated  BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  alert_type      VARCHAR(50),
  email_enabled   BOOLEAN DEFAULT TRUE,
  sms_enabled     BOOLEAN DEFAULT FALSE,
  app_enabled     BOOLEAN DEFAULT TRUE,
  quiet_start     TIME DEFAULT '22:00',
  quiet_end       TIME DEFAULT '06:00',
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, alert_type)
);

-- ============================================================
-- 13. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id),
  action          VARCHAR(50) NOT NULL,   -- create, update, delete, login, logout, export
  module          VARCHAR(50) NOT NULL,   -- livestock, crops, employees, finance, etc.
  record_id       UUID,
  details         JSONB,
  before_data     JSONB,
  after_data      JSONB,
  ip_address      VARCHAR(45),
  user_agent      TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 14. INDEXES (Performance)
-- ============================================================

-- Animals
CREATE INDEX IF NOT EXISTS idx_animals_species       ON animals(species);
CREATE INDEX IF NOT EXISTS idx_animals_health_status ON animals(health_status);
CREATE INDEX IF NOT EXISTS idx_animals_zone_id       ON animals(zone_id);
CREATE INDEX IF NOT EXISTS idx_animals_system_id     ON animals(system_id);
CREATE INDEX IF NOT EXISTS idx_animals_archived       ON animals(archived);

-- Employees
CREATE INDEX IF NOT EXISTS idx_employees_role    ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status  ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_zone_id ON employees(zone_id);

-- Crops
CREATE INDEX IF NOT EXISTS idx_crops_zone_id ON crops(zone_id);
CREATE INDEX IF NOT EXISTS idx_crops_status  ON crops(status);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_cat  ON transactions(category);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_status      ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee    ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority    ON tasks(priority);

-- Stock
CREATE INDEX IF NOT EXISTS idx_stock_category ON stock_items(category);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_date   ON audit_logs(created_at);

-- Vaccinations (for reminders)
CREATE INDEX IF NOT EXISTS idx_vaccines_next_date ON animal_vaccinations(next_date);

-- ============================================================
-- 15. VIEWS (Useful pre-built queries)
-- ============================================================

-- Animal summary view
CREATE OR REPLACE VIEW v_animal_summary AS
SELECT
  a.id, a.system_id, a.tag_number, a.species, a.breed, a.sex,
  a.local_name, a.birth_date,
  CASE
    WHEN a.birth_date IS NOT NULL THEN
      EXTRACT(YEAR FROM AGE(NOW(), a.birth_date)) || 'y ' ||
      EXTRACT(MONTH FROM AGE(NOW(), a.birth_date)) || 'm'
    ELSE a.estimated_age
  END AS age_display,
  a.weight_current, a.health_status, a.quarantine,
  z.name AS zone_name, e.first_name || ' ' || e.last_name AS responsible_name,
  a.created_at
FROM animals a
LEFT JOIN zones z ON a.zone_id = z.id
LEFT JOIN employees e ON a.responsible_id = e.id
WHERE a.archived = FALSE;

-- Monthly production view
CREATE OR REPLACE VIEW v_monthly_production AS
SELECT
  DATE_TRUNC('month', p.date) AS month,
  a.species,
  p.production_type,
  SUM(p.quantity) AS total_quantity,
  AVG(p.quantity) AS avg_daily,
  COUNT(DISTINCT a.id) AS animal_count
FROM animal_production p
JOIN animals a ON p.animal_id = a.id
GROUP BY 1, 2, 3;

-- Finance summary view
CREATE OR REPLACE VIEW v_finance_monthly AS
SELECT
  DATE_TRUNC('month', transaction_date) AS month,
  SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS revenue,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses,
  SUM(CASE WHEN type = 'income'  THEN amount
           WHEN type = 'expense' THEN -amount ELSE 0 END) AS profit
FROM transactions
GROUP BY 1
ORDER BY 1;

-- Stock alert view
CREATE OR REPLACE VIEW v_stock_alerts AS
SELECT
  id, name, category, quantity, threshold, unit,
  CASE
    WHEN quantity <= 0 THEN 'out_of_stock'
    WHEN quantity <= threshold * 0.3 THEN 'critical'
    WHEN quantity <= threshold THEN 'low'
    ELSE 'ok'
  END AS stock_status,
  expiry_date,
  CASE
    WHEN expiry_date IS NOT NULL AND expiry_date <= NOW() + INTERVAL '30 days'
    THEN TRUE ELSE FALSE
  END AS expiring_soon
FROM stock_items;

-- Employee attendance summary
CREATE OR REPLACE VIEW v_attendance_summary AS
SELECT
  e.id, e.first_name || ' ' || e.last_name AS full_name, e.role,
  DATE_TRUNC('month', a.date) AS month,
  COUNT(*) FILTER (WHERE a.status = 'present') AS days_present,
  COUNT(*) FILTER (WHERE a.status = 'absent')  AS days_absent,
  COUNT(*) FILTER (WHERE a.status = 'late')    AS days_late,
  COUNT(*) FILTER (WHERE a.status = 'leave')   AS days_leave,
  SUM(a.hours_worked) AS total_hours
FROM employees e
LEFT JOIN attendance a ON e.id = a.employee_id
GROUP BY 1, 2, 3, 4;

-- ============================================================
-- 16. FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_animals_updated_at    BEFORE UPDATE ON animals     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_employees_updated_at  BEFORE UPDATE ON employees   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_crops_updated_at      BEFORE UPDATE ON crops       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tasks_updated_at      BEFORE UPDATE ON tasks       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_transactions_updated  BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_stock_updated_at      BEFORE UPDATE ON stock_items  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate alerts for low stock
CREATE OR REPLACE FUNCTION check_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= NEW.threshold AND (OLD.quantity > OLD.threshold OR TG_OP = 'INSERT') THEN
    INSERT INTO alerts (type, category, title, description, reference_type, reference_id, auto_generated)
    VALUES (
      CASE WHEN NEW.quantity <= NEW.threshold * 0.3 THEN 'critical' ELSE 'high' END,
      'stock',
      'Stock faible: ' || NEW.name,
      'Quantité actuelle: ' || NEW.quantity || ' ' || NEW.unit || ' (seuil: ' || NEW.threshold || ')',
      'stock_item', NEW.id, TRUE
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_alert AFTER INSERT OR UPDATE ON stock_items FOR EACH ROW EXECUTE FUNCTION check_stock_alert();

-- Auto-generate alert for sick animal
CREATE OR REPLACE FUNCTION check_animal_health_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.health_status IN ('sick','quarantine') AND OLD.health_status = 'healthy' THEN
    INSERT INTO alerts (type, category, title, description, reference_type, reference_id, auto_generated)
    VALUES (
      'critical', 'animal_health',
      'Animal malade: ' || COALESCE(NEW.local_name, NEW.system_id),
      'Statut changé de sain à ' || NEW.health_status,
      'animal', NEW.id, TRUE
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_animal_health_alert AFTER UPDATE ON animals FOR EACH ROW EXECUTE FUNCTION check_animal_health_alert();

COMMIT;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Concession Mugogo ERP — Database schema created successfully!';
  RAISE NOTICE '   Tables: concessions, zones, sub_zones, users, employees, attendance,';
  RAISE NOTICE '           leave_requests, payroll, animals, animal_health_records,';
  RAISE NOTICE '           animal_vaccinations, animal_production, animal_reproduction,';
  RAISE NOTICE '           animal_weights, crops, crop_interventions, harvests,';
  RAISE NOTICE '           stock_items, stock_movements, machines, machine_usage_log,';
  RAISE NOTICE '           machine_maintenance, tasks, task_comments, task_checklist,';
  RAISE NOTICE '           transactions, budget, alerts, notification_settings, audit_logs';
  RAISE NOTICE '   Views:  v_animal_summary, v_monthly_production, v_finance_monthly,';
  RAISE NOTICE '           v_stock_alerts, v_attendance_summary';
  RAISE NOTICE '   Default admin: richardbunani2013@gmail.com / Admin@2025';
END;
$$;
