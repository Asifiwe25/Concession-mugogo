-- ============================================================
-- CONCESSION MUGOGO ERP — SEED DATA (Demo / Development)
-- Run AFTER migration: psql -U postgres -d mugogo_erp -f 002_seed.sql
-- ============================================================

-- ── Zones ──────────────────────────────────────────────────────────────────
INSERT INTO zones (id, name, code, type, area_ha, capacity, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Zone A — Pâturage Nord',  'Z-A', 'pasture',    12.0, 30, 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Zone B — Pâturage Est',   'Z-B', 'pasture',     8.5, 20, 'active'),
  ('33333333-3333-3333-3333-333333333333', 'Zone C — Cultures Maïs',  'Z-C', 'cropland',    5.0, 0,  'active'),
  ('44444444-4444-4444-4444-444444444444', 'Zone D — Polyvalente',    'Z-D', 'mixed',       7.0, 15, 'active'),
  ('55555555-5555-5555-5555-555555555555', 'Zone E — Pommes de terre','Z-E', 'cropland',    4.5, 0,  'active'),
  ('66666666-6666-6666-6666-666666666666', 'Zone F — Jachère',       'Z-F', 'fallow',      6.0, 0,  'resting'),
  ('77777777-7777-7777-7777-777777777777', 'Poulailler Central',      'Z-P', 'infrastructure', 0.3, 500, 'active')
ON CONFLICT DO NOTHING;

-- ── Employees ──────────────────────────────────────────────────────────────
INSERT INTO employees (id, first_name, last_name, local_name, phone, role, contract_type, salary, zone_id, hire_date, status) VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Jean-Baptiste', 'Mutombo',  'JB',      '+243812345678', 'shepherd',           'cdi',      180, '11111111-1111-1111-1111-111111111111', '2022-03-01', 'active'),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'Marie',         'Kahindo',   'Mama M',  '+243998765432', 'farmer',             'cdi',      160, '33333333-3333-3333-3333-333333333333', '2021-06-15', 'active'),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'Pierre',        'Lwambo',    'Chef P',  '+243815551234', 'livestock_manager',  'cdi',      350, null,                                   '2020-01-10', 'active'),
  ('a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', 'Espérance',     'Bibi',      'Spe',     '+243973337890', 'farmer',             'cdd',      150, '44444444-4444-4444-4444-444444444444', '2023-04-20', 'on_leave'),
  ('a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5', 'David',         'Shabani',   'Doc',     '+243817774567', 'vet',                'cdi',      400, null,                                   '2021-09-01', 'active'),
  ('a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6', 'Joséphine',     'Nabintu',   'Josy',    '+243821114567', 'farmer',             'seasonal', 120, '55555555-5555-5555-5555-555555555555', '2024-08-01', 'active'),
  ('a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'Emmanuel',      'Kasereka',  'Manu',    '+243841234560', 'shepherd',           'cdi',      175, '22222222-2222-2222-2222-222222222222', '2022-07-10', 'active'),
  ('a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8', 'Christine',     'Mapendo',   'Chris',   '+243852223344', 'farmer',             'cdi',      165, '77777777-7777-7777-7777-777777777777', '2021-03-15', 'active')
ON CONFLICT DO NOTHING;

-- ── Animals ─────────────────────────────────────────────────────────────────
INSERT INTO animals (system_id, species, breed, sex, local_name, birth_date, weight_entry, weight_current, zone_id, responsible_id, origin, health_status, quarantine) VALUES
  ('BOV-2021-001', 'bovine',  'Ankole',    'female', 'Mapendo',  '2021-03-15', 280, 320, '11111111-1111-1111-1111-111111111111', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'born_on_farm', 'healthy',    false),
  ('BOV-2019-001', 'bovine',  'Frisonne',  'female', 'Kahindo',  '2019-06-01', 420, 480, '11111111-1111-1111-1111-111111111111', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'purchased',   'healthy',    false),
  ('BOV-2022-001', 'bovine',  'Locale',    'female', 'Furaha',   '2022-11-20', 240, 280, '22222222-2222-2222-2222-222222222222', 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'purchased',   'quarantine', true),
  ('BOV-2020-001', 'bovine',  'Brahman',   'male',   'Nguvu',    '2020-02-14', 380, 520, '11111111-1111-1111-1111-111111111111', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'purchased',   'healthy',    false),
  ('CAP-2022-001', 'goat',    'Alpine',    'male',   'Mutoto',   '2022-08-05', 30, 45,   '44444444-4444-4444-4444-444444444444', 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'purchased',   'sick',       false),
  ('CAP-2022-002', 'goat',    'Locale',    'female', 'Amani',    '2022-01-20', 25, 38,   '44444444-4444-4444-4444-444444444444', 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'born_on_farm','healthy',    false),
  ('CAP-2023-001', 'goat',    'Boer',      'female', 'Baraka',   '2023-05-10', 35, 52,   '44444444-4444-4444-4444-444444444444', 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'purchased',   'healthy',    false),
  ('POR-2023-001', 'pig',     'Locale',    'male',   'Nguruwe',  '2023-09-01', 30, 85,   '44444444-4444-4444-4444-444444444444', 'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', 'purchased',   'healthy',    false),
  ('POR-2023-002', 'pig',     'Large White','female','Mama Pig', '2023-07-15', 45, 120,  '44444444-4444-4444-4444-444444444444', 'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', 'purchased',   'healthy',    false),
  ('VOL-2024-001', 'poultry', 'ISA Brown', 'female', null,       '2024-03-01', 1.8, 2.1, '77777777-7777-7777-7777-777777777777', 'a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8', 'purchased',   'healthy',    false),
  ('BOV-2023-001', 'bovine',  'Locale',    'female', 'Tumaini',  '2023-04-10', 220, 260, '22222222-2222-2222-2222-222222222222', 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'born_on_farm','healthy',    false),
  ('CAP-2024-001', 'goat',    'Alpine',    'female', 'Neema',    '2024-01-22', 22, 31,   '44444444-4444-4444-4444-444444444444', 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'born_on_farm','healthy',    false)
ON CONFLICT DO NOTHING;

-- ── Vaccinations ────────────────────────────────────────────────────────────
INSERT INTO animal_vaccinations (animal_id, vaccine_name, date, lot_number, next_date, vet_name)
SELECT id, 'FMD (Fièvre aphteuse)', '2024-06-15', 'LOT-FMD-001', '2025-01-15', 'Dr. David Shabani'
FROM animals WHERE system_id = 'BOV-2021-001' ON CONFLICT DO NOTHING;

INSERT INTO animal_vaccinations (animal_id, vaccine_name, date, lot_number, next_date, vet_name)
SELECT id, 'CBPP (Péripneumonie)', '2024-05-20', 'LOT-CBP-012', '2025-05-20', 'Dr. David Shabani'
FROM animals WHERE system_id = 'BOV-2019-001' ON CONFLICT DO NOTHING;

-- ── Health records ──────────────────────────────────────────────────────────
INSERT INTO animal_health_records (animal_id, disease, symptoms, diagnosis_date, treatment, medication, vet_name, evolution)
SELECT id, 'Gale', 'Démangeaisons, perte de poils', '2025-01-03', 'Injection ivermectine', 'Ivermectine 1%', 'Dr. David Shabani', 'recovering'
FROM animals WHERE system_id = 'CAP-2022-001' ON CONFLICT DO NOTHING;

-- ── Production records ──────────────────────────────────────────────────────
INSERT INTO animal_production (animal_id, production_type, date, quantity, unit, morning, afternoon, evening)
SELECT id, 'milk', CURRENT_DATE - INTERVAL '1 day', 12.5, 'L', 5.0, 3.5, 4.0
FROM animals WHERE system_id = 'BOV-2019-001' ON CONFLICT DO NOTHING;

INSERT INTO animal_production (animal_id, production_type, date, quantity, unit, morning, afternoon, evening)
SELECT id, 'milk', CURRENT_DATE - INTERVAL '1 day', 9.0, 'L', 3.5, 2.5, 3.0
FROM animals WHERE system_id = 'BOV-2021-001' ON CONFLICT DO NOTHING;

-- ── Crops ───────────────────────────────────────────────────────────────────
INSERT INTO crops (id, zone_id, crop_type, variety, area_ha, planting_date, expected_harvest_date, status, health_score, estimated_yield_t, responsible_id) VALUES
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '33333333-3333-3333-3333-333333333333', 'Maïs',          'SC403',    2.5, '2024-09-01', '2025-01-15', 'ready',    88, 4.2, 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'),
  ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', '44444444-4444-4444-4444-444444444444', 'Haricots',      'Roba',     1.8, '2024-10-15', '2025-02-01', 'flowering', 72, 1.8, 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', '55555555-5555-5555-5555-555555555555', 'Pomme de terre','Victoria', 3.0, '2024-08-20', '2025-01-05', 'ready',    91, 18.5,'a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6'),
  ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', '44444444-4444-4444-4444-444444444444', 'Sorgho',        'Locale',   1.2, '2024-11-01', '2025-03-20', 'growing',  95, 2.1, 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2')
ON CONFLICT DO NOTHING;

-- ── Stock items ─────────────────────────────────────────────────────────────
INSERT INTO stock_items (name, category, quantity, unit, threshold, unit_price, supplier, expiry_date) VALUES
  ('Ivermectine 1%',         'medicines',    2,    'flacons', 10,  12.00, 'PharmAgri Bukavu',  '2025-06-01'),
  ('Vaccin FMD',             'medicines',    15,   'doses',   20,   3.50, 'SODEVA Goma',       '2025-02-15'),
  ('Oxytétracycline spray',  'medicines',    8,    'flacons', 15,   8.50, 'PharmAgri Bukavu',  '2025-09-01'),
  ('Semences Maïs SC403',    'seeds',        45,   'kg',      20,   4.20, 'Agristock Bukavu',  '2025-08-01'),
  ('Semences Haricots Roba', 'seeds',        22,   'kg',      10,   5.50, 'Agristock Bukavu',  '2025-07-01'),
  ('NPK 17-17-17',           'fertilizers', 320,  'kg',      100,  0.85, 'Fert-RDC Goma',     NULL),
  ('Urée 46%',               'fertilizers', 180,  'kg',      80,   0.75, 'Fert-RDC Goma',     NULL),
  ('Diesel',                 'fuel',        120,  'litres',  50,   1.10, 'Station Walungu',   NULL),
  ('Son de blé',             'feed',          8,  'sacs 50kg',15,  18.00,'Moulin de Bukavu',  NULL),
  ('Tourteau de soja',       'feed',         12,  'sacs 50kg',10,  22.00,'Agristock Bukavu',  NULL),
  ('Glyphosate 360g/L',      'pesticides',   6,   'litres',  10,   7.50, 'Agri-Service',      '2026-01-01'),
  ('Mancozèbe 80%',          'pesticides',   3,   'kg',       8,   5.00, 'Agri-Service',      '2025-11-01')
ON CONFLICT DO NOTHING;

-- ── Machines ────────────────────────────────────────────────────────────────
INSERT INTO machines (type, brand, model, year, serial_number, status, hours_counter, purchase_date, purchase_price, next_maintenance_date) VALUES
  ('tractor',    'Massey Ferguson', 'MF 290',      2018, 'MF290-KV-1842', 'available',    4250, '2018-03-15', 28000, '2025-02-01'),
  ('cultivator', 'Honda',           'FJ500',       2021, 'HFJ500-0082',   'available',     890, '2021-07-20',  2200, '2025-03-15'),
  ('pump',       'Grundfos',        'CM3-5',       2020, 'GF-CM35-0041',  'available',    1240, '2020-09-01',  1800, '2025-04-01'),
  ('generator',  'Kipor',           'KDE6700T',    2019, 'KDE67-3312',    'maintenance',  5600, '2019-05-12',  3500, '2025-01-10'),
  ('vehicle',    'Toyota',          'Hilux 4x4',   2017, 'KV-ABC-1234',   'available',  112000, '2017-08-01', 45000, '2025-03-01')
ON CONFLICT DO NOTHING;

-- ── Tasks ───────────────────────────────────────────────────────────────────
INSERT INTO tasks (title, description, category, priority, status, assignee_id, due_date) VALUES
  ('Vaccination FMD — Lot A', 'Vacciner tous les bovins de la Zone A contre la fièvre aphteuse', 'livestock', 'urgent', 'todo', 'a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5', CURRENT_DATE + 2),
  ('Traitement Mutoto (CAP-001)', 'Continuer traitement anti-gale pour le bouc Mutoto', 'livestock', 'urgent', 'in_progress', 'a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5', CURRENT_DATE + 1),
  ('Récolte Pommes de terre Zone E', 'Organiser équipe de récolte pour 3 ha', 'crops', 'high', 'in_progress', 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', CURRENT_DATE + 3),
  ('Commande semences Saison B', 'Passer commande chez Agristock: maïs + haricots', 'stock', 'high', 'todo', 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', CURRENT_DATE + 5),
  ('Réparation clôture Zone B', 'Remplacer 15m de clôture côté nord', 'infrastructure', 'high', 'backlog', 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', CURRENT_DATE + 7),
  ('Pesée mensuelle cheptel', 'Peser tous les bovins et enregistrer dans le système', 'livestock', 'normal', 'done', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', CURRENT_DATE - 2),
  ('Analyse de sol Zone F', 'Prélever échantillons avant remise en culture', 'crops', 'normal', 'backlog', 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', CURRENT_DATE + 14)
ON CONFLICT DO NOTHING;

-- ── Finance transactions ─────────────────────────────────────────────────────
INSERT INTO transactions (type, category, description, amount, transaction_date, payment_method, status) VALUES
  ('income',  'milk_eggs',      'Vente lait — Semaine 1 Janvier',     420.00, CURRENT_DATE - 5, 'cash',    'paid'),
  ('income',  'animal_sales',   'Vente 3 bovins — Marché Bukavu',    1850.00, CURRENT_DATE - 4, 'cash',    'paid'),
  ('income',  'crop_sales',     'Vente maïs — 2.1 tonnes',            945.00, CURRENT_DATE - 3, 'mpesa',   'paid'),
  ('expense', 'salaries',       'Paie décembre 2024 — 8 employés',   1640.00, CURRENT_DATE - 2, 'cash',    'paid'),
  ('expense', 'vet_medicines',  'Achat médicaments vétérinaires',      185.00, CURRENT_DATE - 1, 'cash',    'paid'),
  ('expense', 'fuel_energy',    'Carburant diesel — Décembre',         132.00, CURRENT_DATE - 6, 'cash',    'paid'),
  ('expense', 'animal_feed',    'Son de blé + tourteau soja',          304.00, CURRENT_DATE - 7, 'cash',    'paid'),
  ('income',  'milk_eggs',      'Vente œufs — Semaine 1 Janvier',      84.00, CURRENT_DATE,     'cash',    'paid'),
  ('expense', 'seeds',          'Facture semences Agristock',          450.00, CURRENT_DATE + 2, 'bank',    'pending'),
  ('income',  'crop_sales',     'Vente pommes de terre — contrat',   2775.00, CURRENT_DATE + 5, 'mpesa',   'pending')
ON CONFLICT DO NOTHING;

-- ── Alerts ──────────────────────────────────────────────────────────────────
INSERT INTO alerts (type, category, title, description, reference_type, status) VALUES
  ('critical', 'animal_health', 'Animal malade non traité',    'CAP-2022-001 (Mutoto) — Traitement requis depuis 3 jours', 'animal', 'new'),
  ('high',     'stock',         'Stock médicaments critique',  'Ivermectine 1% — 2 flacons restants (seuil: 10)',           'stock_item', 'new'),
  ('normal',   'crops',         'Culture prête à récolter',    'Maïs Zone C (2.5 ha) — Fenêtre de récolte dans 7 jours',   'crop', 'seen'),
  ('high',     'hr',            'Absence non justifiée',       'EMP Kabila Jonas — Absent depuis 2 jours',                  'employee', 'new'),
  ('normal',   'finance',       'Facture en attente',          'Fournisseur Semences KIVU — 450 USD',                       'transaction', 'seen'),
  ('info',     'animal_health', 'Rappel vaccin à prévoir',     'BOV-2021-001 (Mapendo) — Vaccin FMD dans 7 jours',          'animal', 'seen')
ON CONFLICT DO NOTHING;

-- ── Attendance (sample) ─────────────────────────────────────────────────────
INSERT INTO attendance (employee_id, date, check_in, check_out, status, hours_worked)
SELECT 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', CURRENT_DATE - i, '06:30', '17:30', 'present', 11
FROM generate_series(1, 20) AS s(i)
WHERE EXTRACT(DOW FROM CURRENT_DATE - i) NOT IN (0)
ON CONFLICT DO NOTHING;

INSERT INTO attendance (employee_id, date, check_in, check_out, status, hours_worked)
SELECT 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', CURRENT_DATE - i, '07:00', '16:30', 'present', 9.5
FROM generate_series(1, 20) AS s(i)
WHERE EXTRACT(DOW FROM CURRENT_DATE - i) NOT IN (0)
ON CONFLICT DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✅ Seed data inserted successfully!';
  RAISE NOTICE '   - 7 zones créées';
  RAISE NOTICE '   - 8 employés créés';
  RAISE NOTICE '   - 12 animaux créés';
  RAISE NOTICE '   - 4 cultures créées';
  RAISE NOTICE '   - 12 articles de stock créés';
  RAISE NOTICE '   - 5 machines créées';
  RAISE NOTICE '   - 7 tâches créées';
  RAISE NOTICE '   - 10 transactions financières créées';
  RAISE NOTICE '   - 6 alertes créées';
END;
$$;
