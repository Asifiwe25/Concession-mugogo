// Mock data for demo — replace with real API calls
export const mockStats = {
  employees: { total: 24, activeToday: 19, onLeave: 3, absent: 2 },
  animals:   { total: 342, healthy: 318, sick: 12, quarantine: 8, deceased: 4 },
  crops:     { total: 14, active: 9, flowering: 3, ready: 2 },
  revenue:   { month: 12450, prevMonth: 11200, year: 134600 },
  expenses:  { month: 7820, prevMonth: 8100, year: 91400 },
  profit:    { month: 4630, year: 43200 },
  area:      { active: 48.5, fallow: 12.0, total: 60.5 },
  score:     78,
}

export const mockAnimals = [
  { id: 'BOV-2024-001', localName: 'Mapendo', species: 'bovine', breed: 'Ankole', sex: 'female', age: '3 ans', weight: 320, zone: 'Zone A', status: 'healthy', lastVet: '2024-11-15', production: '12L/j' },
  { id: 'BOV-2024-002', localName: 'Kahindo', species: 'bovine', breed: 'Frisonne', sex: 'female', age: '5 ans', weight: 480, zone: 'Zone A', status: 'healthy', lastVet: '2024-11-10', production: '18L/j' },
  { id: 'CAP-2024-001', localName: 'Mutoto', species: 'goat', breed: 'Alpine', sex: 'male', age: '2 ans', weight: 45, zone: 'Zone B', status: 'sick', lastVet: '2024-11-20', production: '-' },
  { id: 'VOL-2024-001', localName: '-', species: 'poultry', breed: 'Cobb 500', sex: 'female', age: '8 mois', weight: 2.5, zone: 'Poulailler', status: 'healthy', lastVet: '2024-10-01', production: '1 œuf/j' },
  { id: 'BOV-2024-003', localName: 'Furaha', species: 'bovine', breed: 'Locale', sex: 'female', age: '2 ans', weight: 280, zone: 'Zone C', status: 'quarantine', lastVet: '2024-11-22', production: '-' },
  { id: 'POR-2024-001', localName: 'Nguruwe', species: 'pig', breed: 'Locale', sex: 'male', age: '1 an', weight: 85, zone: 'Zone D', status: 'healthy', lastVet: '2024-11-05', production: '-' },
]

export const mockEmployees = [
  { id: 'EMP-001', name: 'Jean-Baptiste Mutombo', role: 'shepherd', zone: 'Zone A & B', status: 'active', score: 88, phone: '+243 81 234 5678', hireDate: '2022-03-01' },
  { id: 'EMP-002', name: 'Marie Kahindo', role: 'farmer', zone: 'Zone C', status: 'active', score: 92, phone: '+243 99 876 5432', hireDate: '2021-06-15' },
  { id: 'EMP-003', name: 'Pierre Lwambo', role: 'livestock_manager', zone: 'Toutes', status: 'active', score: 95, phone: '+243 81 555 1234', hireDate: '2020-01-10' },
  { id: 'EMP-004', name: 'Espérance Bibi', role: 'farmer', zone: 'Zone D', status: 'onLeave', score: 79, phone: '+243 97 333 7890', hireDate: '2023-04-20' },
  { id: 'EMP-005', name: 'David Shabani', role: 'vet', zone: 'Toutes', status: 'active', score: 91, phone: '+243 81 777 4567', hireDate: '2021-09-01' },
]

export const mockAlerts = [
  { id: 1, type: 'critical', category: 'animalHealth', title: 'Animal malade non traité', desc: 'CAP-2024-001 (Mutoto) — Traitement requis depuis 3 jours', time: 'Il y a 2h', status: 'new' },
  { id: 2, type: 'high', category: 'stock', title: 'Stock médicaments critique', desc: 'Ivermectine — 2 flacons restants (seuil: 10)', time: 'Il y a 5h', status: 'new' },
  { id: 3, type: 'normal', category: 'crops', title: 'Culture prête à récolter', desc: 'Maïs — Zone C (2.5 ha) — Fenêtre de récolte: 7 jours', time: 'Il y a 1j', status: 'seen' },
  { id: 4, type: 'high', category: 'hr', title: 'Absence non justifiée', desc: 'EMP-007 Kabila Jonas — Absent depuis 2 jours', time: 'Il y a 1j', status: 'new' },
  { id: 5, type: 'normal', category: 'finance', title: 'Facture en attente', desc: 'Fournisseur Semences KIVU — 450 USD', time: 'Il y a 3j', status: 'seen' },
  { id: 6, type: 'info', category: 'livestock', title: 'Rappel vaccin', desc: 'BOV-2024-005 — Vaccin FMD à prévoir dans 7 jours', time: 'Il y a 3j', status: 'seen' },
]

export const mockCrops = [
  { id: 'CRP-001', type: 'Maïs', variety: 'SC403', zone: 'Zone C', area: 2.5, planted: '2024-09-01', harvestDate: '2025-01-15', status: 'ready', health: 88, yield: 4.2 },
  { id: 'CRP-002', type: 'Haricots', variety: 'Roba', zone: 'Zone D', area: 1.8, planted: '2024-10-15', harvestDate: '2025-02-01', status: 'flowering', health: 72, yield: 1.8 },
  { id: 'CRP-003', type: 'Pomme de terre', variety: 'Victoria', zone: 'Zone E', area: 3.0, planted: '2024-08-20', harvestDate: '2025-01-05', status: 'ready', health: 91, yield: 18.5 },
  { id: 'CRP-004', type: 'Sorgho', variety: 'Locale', zone: 'Zone F', area: 1.2, planted: '2024-11-01', harvestDate: '2025-03-20', status: 'growing', health: 95, yield: 2.1 },
]

export const mockMonthlyProduction = [
  { month: 'Jan', milk: 340, eggs: 180, crops: 2100 },
  { month: 'Fév', milk: 380, eggs: 195, crops: 1800 },
  { month: 'Mar', milk: 420, eggs: 210, crops: 3200 },
  { month: 'Avr', milk: 395, eggs: 220, crops: 2900 },
  { month: 'Mai', milk: 440, eggs: 205, crops: 4100 },
  { month: 'Jun', milk: 460, eggs: 215, crops: 3800 },
  { month: 'Jul', milk: 430, eggs: 200, crops: 2200 },
  { month: 'Aoû', milk: 415, eggs: 188, crops: 1900 },
  { month: 'Sep', milk: 450, eggs: 225, crops: 3500 },
  { month: 'Oct', milk: 480, eggs: 230, crops: 4200 },
  { month: 'Nov', milk: 510, eggs: 245, crops: 3900 },
  { month: 'Déc', milk: 490, eggs: 235, crops: 4800 },
]

export const mockFinance = {
  revenue:  [4200, 4800, 5100, 4900, 5600, 5200, 4800, 5000, 5400, 5800, 6100, 5900],
  expenses: [2800, 3100, 3400, 3200, 3600, 3400, 3100, 3200, 3500, 3700, 3900, 3800],
  months:   ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
}

export const mockStock = [
  { id: 1, name: 'Ivermectine 1%', category: 'medicines', qty: 2, unit: 'flacons', threshold: 10, price: 12, expiry: '2025-06-01', status: 'critical' },
  { id: 2, name: 'Vaccin FMD', category: 'medicines', qty: 15, unit: 'doses', threshold: 20, price: 3.5, expiry: '2025-02-15', status: 'low' },
  { id: 3, name: 'Semences Maïs SC403', category: 'seeds', qty: 45, unit: 'kg', threshold: 20, price: 4.2, expiry: '2025-08-01', status: 'ok' },
  { id: 4, name: 'NPK 17-17-17', category: 'fertilizers', qty: 320, unit: 'kg', threshold: 100, price: 0.85, expiry: null, status: 'ok' },
  { id: 5, name: 'Diesel', category: 'fuel', qty: 120, unit: 'litres', threshold: 50, price: 1.1, expiry: null, status: 'ok' },
  { id: 6, name: 'Son de blé', category: 'feed', qty: 8, unit: 'sacs 50kg', threshold: 15, price: 18, expiry: null, status: 'low' },
]

export const mockTasks = {
  backlog: [
    { id: 't1', title: 'Analyse de sol — Zone F', priority: 'normal', assignee: 'Marie Kahindo', due: '2025-01-20', category: 'crops' },
    { id: 't2', title: 'Réparation clôture Zone B', priority: 'high', assignee: 'Jean-Baptiste', due: '2025-01-15', category: 'infrastructure' },
  ],
  todo: [
    { id: 't3', title: 'Vaccination FMD — Lot A', priority: 'urgent', assignee: 'Dr. David Shabani', due: '2025-01-10', category: 'livestock' },
    { id: 't4', title: 'Commande semences Saison B', priority: 'high', assignee: 'Marie Kahindo', due: '2025-01-12', category: 'stock' },
  ],
  inProgress: [
    { id: 't5', title: 'Traitement Mutoto (CAP-001)', priority: 'urgent', assignee: 'Dr. David Shabani', due: '2025-01-08', category: 'livestock' },
    { id: 't6', title: 'Récolte Pommes de terre Zone E', priority: 'high', assignee: 'Équipe C', due: '2025-01-09', category: 'crops' },
  ],
  review: [
    { id: 't7', title: 'Bilan mensuel décembre', priority: 'normal', assignee: 'Pierre Lwambo', due: '2025-01-05', category: 'finance' },
  ],
  done: [
    { id: 't8', title: 'Pesée mensuelle cheptel', priority: 'normal', assignee: 'Jean-Baptiste', due: '2025-01-03', category: 'livestock' },
    { id: 't9', title: 'Paie décembre 2024', priority: 'high', assignee: 'Admin', due: '2025-01-03', category: 'hr' },
  ],
}
