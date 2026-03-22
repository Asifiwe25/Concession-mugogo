import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Types ─────────────────────────────────────────────────────────────────

export interface Animal {
  id: string
  systemId: string
  species: string
  breed: string
  sex: string
  localName: string
  tagNumber: string
  birthDate: string
  estimatedAge: string
  color: string
  weight: number
  zone: string
  responsible: string
  origin: string
  supplierName: string
  purchaseDate: string
  purchasePrice: number
  healthStatus: string
  quarantine: boolean
  vetNotes: string
  motherTag: string
  fatherTag: string
  production: string
  lastVet: string
  photo: string
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  localName: string
  phone: string
  email: string
  role: string
  contractType: string
  salary: number
  zone: string
  hireDate: string
  status: string
  photo: string
  score: number
  createdAt: string
  updatedAt: string
}

export interface Crop {
  id: string
  type: string
  variety: string
  zone: string
  area: number
  plantingDate: string
  harvestDate: string
  status: string
  health: number
  yieldEst: number
  responsible: string
  irrigation: string
  seedSource: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Harvest {
  id: string
  cropId: string
  cropType: string
  zone: string
  date: string
  grossQty: number
  netQty: number
  unit: string
  grade: string
  destination: string
  salePrice: number
  revenue: number
  responsible: string
  notes: string
  createdAt: string
}

export interface StockItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  threshold: number
  unitPrice: number
  supplier: string
  expiryDate: string
  location: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: string
  itemId: string
  itemName: string
  type: 'in' | 'out'
  quantity: number
  reason: string
  date: string
  createdBy: string
}

export interface Machine {
  id: string
  type: string
  brand: string
  model: string
  year: number
  serial: string
  plate: string
  status: string
  hours: number
  fuel: string
  value: number
  nextMainDate: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  assignee: string
  dueDate: string
  zone: string
  estimatedHours: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string
  paymentMethod: string
  status: string
  reference: string
  notes: string
  createdAt: string
}

export interface Zone {
  id: string
  name: string
  code: string
  type: string
  area: number
  capacity: number
  used: number
  status: string
  responsible: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Alert {
  id: string
  type: string
  category: string
  title: string
  desc: string
  status: string
  time: string
  createdAt: string
}

// ── Initial Data ──────────────────────────────────────────────────────────

const INIT_ANIMALS: Animal[] = [
  { id:'1', systemId:'BOV-2021-001', species:'bovine',  breed:'Ankole',    sex:'female', localName:'Mapendo',  tagNumber:'RCD-001', birthDate:'2021-03-15', estimatedAge:'', color:'Robe fauve', weight:320, zone:'Zone A', responsible:'Jean-Baptiste Mutombo', origin:'born_on_farm', supplierName:'', purchaseDate:'', purchasePrice:0, healthStatus:'healthy', quarantine:false, vetNotes:'', motherTag:'', fatherTag:'', production:'12L/j', lastVet:'2024-11-15', photo:'', createdAt:'2021-03-15', updatedAt:'2024-11-15' },
  { id:'2', systemId:'BOV-2019-001', species:'bovine',  breed:'Frisonne',  sex:'female', localName:'Kahindo',  tagNumber:'RCD-002', birthDate:'2019-06-01', estimatedAge:'', color:'Noir et blanc', weight:480, zone:'Zone A', responsible:'Jean-Baptiste Mutombo', origin:'purchased', supplierName:'Marché Bukavu', purchaseDate:'2019-07-01', purchasePrice:850, healthStatus:'healthy', quarantine:false, vetNotes:'', motherTag:'', fatherTag:'', production:'18L/j', lastVet:'2024-11-10', photo:'', createdAt:'2019-07-01', updatedAt:'2024-11-10' },
  { id:'3', systemId:'CAP-2022-001', species:'goat',    breed:'Alpine',    sex:'male',   localName:'Mutoto',   tagNumber:'RCD-003', birthDate:'2022-08-05', estimatedAge:'', color:'Gris clair', weight:45, zone:'Zone D', responsible:'Pierre Lwambo', origin:'purchased', supplierName:'Éleveur Kahuzi', purchaseDate:'2022-09-01', purchasePrice:120, healthStatus:'sick', quarantine:false, vetNotes:'Gale en traitement', motherTag:'', fatherTag:'', production:'-', lastVet:'2024-11-20', photo:'', createdAt:'2022-09-01', updatedAt:'2024-11-20' },
  { id:'4', systemId:'VOL-2024-001', species:'poultry', breed:'ISA Brown', sex:'female', localName:'',        tagNumber:'',        birthDate:'2024-03-01', estimatedAge:'', color:'Roux', weight:2.1, zone:'Poulailler', responsible:'Christine Mapendo', origin:'purchased', supplierName:'Agristock Bukavu', purchaseDate:'2024-03-05', purchasePrice:8, healthStatus:'healthy', quarantine:false, vetNotes:'', motherTag:'', fatherTag:'', production:'1 œuf/j', lastVet:'2024-10-01', photo:'', createdAt:'2024-03-05', updatedAt:'2024-10-01' },
  { id:'5', systemId:'BOV-2022-001', species:'bovine',  breed:'Locale',    sex:'female', localName:'Furaha',  tagNumber:'RCD-005', birthDate:'2022-11-20', estimatedAge:'', color:'Brune', weight:280, zone:'Zone B', responsible:'Emmanuel Kasereka', origin:'purchased', supplierName:'Marché Walungu', purchaseDate:'2023-01-10', purchasePrice:600, healthStatus:'quarantine', quarantine:true, vetNotes:'Arrivée récente — quarantaine 14j', motherTag:'', fatherTag:'', production:'-', lastVet:'2024-11-22', photo:'', createdAt:'2023-01-10', updatedAt:'2024-11-22' },
  { id:'6', systemId:'POR-2023-001', species:'pig',     breed:'Large White',sex:'male',  localName:'Nguruwe', tagNumber:'RCD-006', birthDate:'2023-09-01', estimatedAge:'', color:'Rose', weight:85, zone:'Zone D', responsible:'Pierre Lwambo', origin:'purchased', supplierName:'Ferme Goma', purchaseDate:'2023-10-01', purchasePrice:200, healthStatus:'healthy', quarantine:false, vetNotes:'', motherTag:'', fatherTag:'', production:'-', lastVet:'2024-11-05', photo:'', createdAt:'2023-10-01', updatedAt:'2024-11-05' },
]

const INIT_EMPLOYEES: Employee[] = [
  { id:'1', firstName:'Jean-Baptiste', lastName:'Mutombo',  localName:'JB',     phone:'+243 81 234 5678', email:'jb@mugogo.cd',      role:'shepherd',          contractType:'cdi',      salary:180, zone:'Zone A & B', hireDate:'2022-03-01', status:'active',   photo:'', score:88, createdAt:'2022-03-01', updatedAt:'2024-12-01' },
  { id:'2', firstName:'Marie',         lastName:'Kahindo',   localName:'Mama M', phone:'+243 99 876 5432', email:'marie@mugogo.cd',    role:'farmer',            contractType:'cdi',      salary:160, zone:'Zone C',     hireDate:'2021-06-15', status:'active',   photo:'', score:92, createdAt:'2021-06-15', updatedAt:'2024-12-01' },
  { id:'3', firstName:'Pierre',        lastName:'Lwambo',    localName:'Chef P', phone:'+243 81 555 1234', email:'pierre@mugogo.cd',   role:'livestock_manager', contractType:'cdi',      salary:350, zone:'Toutes',     hireDate:'2020-01-10', status:'active',   photo:'', score:95, createdAt:'2020-01-10', updatedAt:'2024-12-01' },
  { id:'4', firstName:'Espérance',     lastName:'Bibi',      localName:'Spe',    phone:'+243 97 333 7890', email:'',                   role:'farmer',            contractType:'cdd',      salary:150, zone:'Zone D',     hireDate:'2023-04-20', status:'on_leave', photo:'', score:79, createdAt:'2023-04-20', updatedAt:'2024-12-01' },
  { id:'5', firstName:'David',         lastName:'Shabani',   localName:'Doc',    phone:'+243 81 777 4567', email:'david@mugogo.cd',    role:'vet',               contractType:'cdi',      salary:400, zone:'Toutes',     hireDate:'2021-09-01', status:'active',   photo:'', score:91, createdAt:'2021-09-01', updatedAt:'2024-12-01' },
  { id:'6', firstName:'Christine',     lastName:'Mapendo',   localName:'Chris',  phone:'+243 85 222 3344', email:'',                   role:'farmer',            contractType:'cdi',      salary:165, zone:'Poulailler', hireDate:'2021-03-15', status:'active',   photo:'', score:85, createdAt:'2021-03-15', updatedAt:'2024-12-01' },
]

const INIT_CROPS: Crop[] = [
  { id:'1', type:'Maïs',          variety:'SC403',    zone:'Zone C', area:2.5, plantingDate:'2024-09-01', harvestDate:'2025-01-15', status:'ready',    health:88, yieldEst:4.2,  responsible:'Marie Kahindo',   irrigation:'rain',    seedSource:'Agristock Bukavu', notes:'', createdAt:'2024-09-01', updatedAt:'2024-12-01' },
  { id:'2', type:'Haricots',      variety:'Roba',     zone:'Zone D', area:1.8, plantingDate:'2024-10-15', harvestDate:'2025-02-01', status:'flowering', health:72, yieldEst:1.8,  responsible:'Marie Kahindo',   irrigation:'rain',    seedSource:'Agristock Bukavu', notes:'', createdAt:'2024-10-15', updatedAt:'2024-12-01' },
  { id:'3', type:'Pomme de terre',variety:'Victoria', zone:'Zone E', area:3.0, plantingDate:'2024-08-20', harvestDate:'2025-01-05', status:'ready',    health:91, yieldEst:18.5, responsible:'Joséphine Nabintu',irrigation:'manual',  seedSource:'Agristock Bukavu', notes:'', createdAt:'2024-08-20', updatedAt:'2024-12-01' },
  { id:'4', type:'Sorgho',        variety:'Locale',   zone:'Zone F', area:1.2, plantingDate:'2024-11-01', harvestDate:'2025-03-20', status:'growing',  health:95, yieldEst:2.1,  responsible:'Marie Kahindo',   irrigation:'rain',    seedSource:'Semences locales', notes:'', createdAt:'2024-11-01', updatedAt:'2024-12-01' },
]

const INIT_HARVESTS: Harvest[] = [
  { id:'1', cropId:'1', cropType:'Maïs SC403',     zone:'Zone C', date:'2025-01-08', grossQty:10.5, netQty:9.8,  unit:'tonnes', grade:'A', destination:'sale',    salePrice:450, revenue:4410, responsible:'Marie Kahindo',    notes:'',                   createdAt:'2025-01-08' },
  { id:'2', cropId:'3', cropType:'Pomme de terre', zone:'Zone E', date:'2025-01-05', grossQty:55.0, netQty:52.0, unit:'tonnes', grade:'A', destination:'storage', salePrice:0,   revenue:0,    responsible:'Joséphine Nabintu', notes:'Stockage chambre froide', createdAt:'2025-01-05' },
  { id:'3', cropId:'2', cropType:'Haricots Roba',  zone:'Zone D', date:'2024-12-20', grossQty:3.2,  netQty:3.0,  unit:'tonnes', grade:'B', destination:'mixed',   salePrice:450, revenue:1350, responsible:'Marie Kahindo',    notes:'',                   createdAt:'2024-12-20' },
]

const INIT_STOCK: StockItem[] = [
  { id:'1', name:'Ivermectine 1%',         category:'medicines',    quantity:2,   unit:'flacons',   threshold:10,  unitPrice:12.0, supplier:'PharmAgri Bukavu', expiryDate:'2025-06-01', location:'Armoire vétérinaire', status:'critical', createdAt:'2024-01-01', updatedAt:'2025-01-01' },
  { id:'2', name:'Vaccin FMD',             category:'medicines',    quantity:15,  unit:'doses',     threshold:20,  unitPrice:3.50,  supplier:'SODEVA Goma',      expiryDate:'2025-02-15', location:'Réfrigérateur',       status:'low',      createdAt:'2024-01-01', updatedAt:'2025-01-01' },
  { id:'3', name:'Semences Maïs SC403',    category:'seeds',        quantity:45,  unit:'kg',        threshold:20,  unitPrice:4.20,  supplier:'Agristock Bukavu', expiryDate:'2025-08-01', location:'Entrepôt principal',  status:'ok',       createdAt:'2024-01-01', updatedAt:'2025-01-01' },
  { id:'4', name:'NPK 17-17-17',           category:'fertilizers',  quantity:320, unit:'kg',        threshold:100, unitPrice:0.85,  supplier:'Fert-RDC Goma',    expiryDate:'',           location:'Hangar agricole',     status:'ok',       createdAt:'2024-01-01', updatedAt:'2025-01-01' },
  { id:'5', name:'Diesel',                 category:'fuel',         quantity:120, unit:'litres',    threshold:50,  unitPrice:1.10,  supplier:'Station Walungu',  expiryDate:'',           location:'Réservoir carburant', status:'ok',       createdAt:'2024-01-01', updatedAt:'2025-01-01' },
  { id:'6', name:'Son de blé',             category:'feed',         quantity:8,   unit:'sacs 50kg', threshold:15,  unitPrice:18.0,  supplier:'Moulin de Bukavu', expiryDate:'',           location:'Entrepôt principal',  status:'low',      createdAt:'2024-01-01', updatedAt:'2025-01-01' },
  { id:'7', name:'Urée 46%',               category:'fertilizers',  quantity:180, unit:'kg',        threshold:80,  unitPrice:0.75,  supplier:'Fert-RDC Goma',    expiryDate:'',           location:'Hangar agricole',     status:'ok',       createdAt:'2024-01-01', updatedAt:'2025-01-01' },
  { id:'8', name:'Oxytétracycline spray',  category:'medicines',    quantity:8,   unit:'flacons',   threshold:15,  unitPrice:8.50,  supplier:'PharmAgri Bukavu', expiryDate:'2025-09-01', location:'Armoire vétérinaire', status:'low',      createdAt:'2024-01-01', updatedAt:'2025-01-01' },
]

const INIT_STOCK_MOVEMENTS: StockMovement[] = [
  { id:'1', itemId:'1', itemName:'Ivermectine 1%',   type:'out', quantity:10, reason:'Traitement Mutoto (CAP-2022-001)', date:'2025-01-03', createdBy:'Dr. David Shabani' },
  { id:'2', itemId:'4', itemName:'NPK 17-17-17',     type:'out', quantity:50, reason:'Fertilisation Zone C — Maïs',    date:'2024-11-15', createdBy:'Marie Kahindo' },
  { id:'3', itemId:'3', itemName:'Semences Maïs SC403',type:'in', quantity:50, reason:'Achat Agristock — Saison B',    date:'2024-10-01', createdBy:'Pierre Lwambo' },
]

const INIT_MACHINES: Machine[] = [
  { id:'1', type:'tractor',    brand:'Massey Ferguson', model:'MF 290',    year:2018, serial:'MF290-KV-1842', plate:'—',       status:'available',    hours:4250,   fuel:'diesel',    value:28000, nextMainDate:'2025-02-01', notes:'Tracteur principal polyvalent',           createdAt:'2018-03-15', updatedAt:'2024-11-01' },
  { id:'2', type:'cultivator', brand:'Honda',           model:'FJ500',     year:2021, serial:'HFJ500-0082',   plate:'—',       status:'available',    hours:890,    fuel:'essence',   value:2200,  nextMainDate:'2025-03-15', notes:'Motoculteur petites parcelles',            createdAt:'2021-07-20', updatedAt:'2024-10-15' },
  { id:'3', type:'pump',       brand:'Grundfos',        model:'CM3-5',     year:2020, serial:'GF-CM35-0041',  plate:'—',       status:'available',    hours:1240,   fuel:'électrique',value:1800,  nextMainDate:'2025-04-01', notes:'Pompe irrigation forages',                createdAt:'2020-09-01', updatedAt:'2024-09-01' },
  { id:'4', type:'generator',  brand:'Kipor',           model:'KDE6700T',  year:2019, serial:'KDE67-3312',    plate:'—',       status:'maintenance',  hours:5600,   fuel:'diesel',    value:3500,  nextMainDate:'2025-01-10', notes:'Groupe électrogène — révision en cours',  createdAt:'2019-05-12', updatedAt:'2025-01-04' },
  { id:'5', type:'vehicle',    brand:'Toyota',          model:'Hilux 4x4', year:2017, serial:'KV-ABC-1234',   plate:'KV-1234', status:'available',    hours:112000, fuel:'diesel',    value:45000, nextMainDate:'2025-03-01', notes:'Véhicule de liaison et transport',         createdAt:'2017-08-01', updatedAt:'2024-12-15' },
]

const INIT_TASKS: Task[] = [
  { id:'1', title:'Vaccination FMD — Lot A', description:'Vacciner tous les bovins de la Zone A contre la fièvre aphteuse. Utiliser vaccin lot LOT-FMD-2025.', category:'livestock', priority:'urgent', status:'todo',       assignee:'David Shabani',       dueDate:'2025-01-10', zone:'Zone A',     estimatedHours:4, notes:'', createdAt:'2025-01-05', updatedAt:'2025-01-05' },
  { id:'2', title:'Traitement Mutoto (CAP-001)', description:'Continuer le traitement anti-gale pour le bouc Mutoto. 2e injection ivermectine.', category:'livestock', priority:'urgent', status:'in_progress', assignee:'David Shabani',       dueDate:'2025-01-08', zone:'Zone D',     estimatedHours:1, notes:'', createdAt:'2025-01-03', updatedAt:'2025-01-06' },
  { id:'3', title:'Récolte Pommes de terre Zone E', description:'Organiser équipe de 8 personnes pour récolte 3 ha. Prévoir sacs, transport.', category:'crops',     priority:'high',   status:'in_progress', assignee:'Joséphine Nabintu',    dueDate:'2025-01-09', zone:'Zone E',     estimatedHours:24,notes:'', createdAt:'2025-01-04', updatedAt:'2025-01-06' },
  { id:'4', title:'Commande semences Saison B', description:'Passer commande chez Agristock: 100kg maïs SC403 + 50kg haricots Roba.', category:'stock',     priority:'high',   status:'todo',       assignee:'Marie Kahindo',        dueDate:'2025-01-12', zone:'',           estimatedHours:2, notes:'', createdAt:'2025-01-05', updatedAt:'2025-01-05' },
  { id:'5', title:'Réparation clôture Zone B', description:'Remplacer 15m de clôture côté nord. Matériaux: poteaux bois + fil barbelé.', category:'infrastructure',priority:'high',status:'backlog',  assignee:'Jean-Baptiste Mutombo', dueDate:'2025-01-15', zone:'Zone B',     estimatedHours:6, notes:'', createdAt:'2025-01-02', updatedAt:'2025-01-02' },
  { id:'6', title:'Pesée mensuelle cheptel', description:'Peser tous les bovins et caprins, enregistrer dans le système.', category:'livestock', priority:'normal', status:'done',       assignee:'Jean-Baptiste Mutombo', dueDate:'2025-01-03', zone:'Toutes',     estimatedHours:8, notes:'', createdAt:'2024-12-28', updatedAt:'2025-01-03' },
  { id:'7', title:'Analyse de sol Zone F', description:'Prélever échantillons pour analyse avant remise en culture Saison B.', category:'crops',     priority:'normal', status:'backlog',    assignee:'Marie Kahindo',        dueDate:'2025-01-20', zone:'Zone F',     estimatedHours:3, notes:'', createdAt:'2025-01-01', updatedAt:'2025-01-01' },
]

const INIT_TRANSACTIONS: Transaction[] = [
  { id:'1', type:'income',  category:'milk_eggs',    description:'Vente lait — Semaine 1 Janvier 2025',            amount:420,  date:'2025-01-05', paymentMethod:'cash',  status:'paid',    reference:'',       notes:'', createdAt:'2025-01-05' },
  { id:'2', type:'income',  category:'animal_sales', description:'Vente 3 bovins — Marché de Bukavu',              amount:1850, date:'2025-01-04', paymentMethod:'cash',  status:'paid',    reference:'',       notes:'', createdAt:'2025-01-04' },
  { id:'3', type:'income',  category:'crop_sales',   description:'Vente maïs — 2.1 tonnes Zone C',                 amount:945,  date:'2025-01-03', paymentMethod:'mpesa', status:'paid',    reference:'MP-001', notes:'', createdAt:'2025-01-03' },
  { id:'4', type:'expense', category:'salaries',     description:'Paie Décembre 2024 — 8 employés',                amount:1640, date:'2025-01-02', paymentMethod:'cash',  status:'paid',    reference:'',       notes:'', createdAt:'2025-01-02' },
  { id:'5', type:'expense', category:'vet_medicines','description':'Achat médicaments vétérinaires — PharmAgri',   amount:185,  date:'2025-01-01', paymentMethod:'cash',  status:'paid',    reference:'FAC-001',notes:'', createdAt:'2025-01-01' },
  { id:'6', type:'expense', category:'fuel_energy',  description:'Carburant diesel — Décembre 2024',               amount:132,  date:'2024-12-30', paymentMethod:'cash',  status:'paid',    reference:'',       notes:'', createdAt:'2024-12-30' },
  { id:'7', type:'expense', category:'animal_feed',  description:'Son de blé + tourteau soja — Moulin Bukavu',     amount:304,  date:'2024-12-28', paymentMethod:'cash',  status:'paid',    reference:'',       notes:'', createdAt:'2024-12-28' },
  { id:'8', type:'income',  category:'milk_eggs',    description:'Vente œufs — Semaine 1 Janvier 2025',            amount:84,   date:'2025-01-06', paymentMethod:'cash',  status:'paid',    reference:'',       notes:'', createdAt:'2025-01-06' },
  { id:'9', type:'expense', category:'seeds',        description:'Facture semences Agristock — Saison B',          amount:450,  date:'2025-01-08', paymentMethod:'bank',  status:'pending', reference:'FAC-002',notes:'', createdAt:'2025-01-08' },
  { id:'10',type:'income',  category:'crop_sales',   description:'Vente pommes de terre — Contrat hôtel Bukavu',  amount:2775, date:'2025-01-10', paymentMethod:'mpesa', status:'pending', reference:'CTR-001',notes:'', createdAt:'2025-01-08' },
]

const INIT_ZONES: Zone[] = [
  { id:'1', name:'Zone A — Pâturage Nord',   code:'Z-A', type:'pasture',        area:12.0, capacity:30, used:28, status:'active',  responsible:'Jean-Baptiste Mutombo', notes:'Herbage naturel, accès point d\'eau', createdAt:'2018-03-15', updatedAt:'2024-12-01' },
  { id:'2', name:'Zone B — Pâturage Est',    code:'Z-B', type:'pasture',        area:8.5,  capacity:20, used:14, status:'active',  responsible:'Emmanuel Kasereka',     notes:'Zone clôturée, bonne qualité herbage', createdAt:'2018-03-15', updatedAt:'2024-12-01' },
  { id:'3', name:'Zone C — Cultures Maïs',  code:'Z-C', type:'cropland',       area:5.0,  capacity:0,  used:0,  status:'active',  responsible:'Marie Kahindo',         notes:'Sol argilo-limoneux, bon drainage', createdAt:'2018-03-15', updatedAt:'2024-12-01' },
  { id:'4', name:'Zone D — Polyvalente',    code:'Z-D', type:'mixed',          area:7.0,  capacity:15, used:12, status:'active',  responsible:'Pierre Lwambo',         notes:'Mixte élevage et culture', createdAt:'2018-03-15', updatedAt:'2024-12-01' },
  { id:'5', name:'Zone E — Pommes de terre',code:'Z-E', type:'cropland',       area:4.5,  capacity:0,  used:0,  status:'active',  responsible:'Joséphine Nabintu',     notes:'Sol riche, altitude favorable', createdAt:'2018-03-15', updatedAt:'2024-12-01' },
  { id:'6', name:'Zone F — Jachère',        code:'Z-F', type:'fallow',         area:6.0,  capacity:0,  used:0,  status:'resting', responsible:'—',                     notes:'En repos — rotation prévue Saison B', createdAt:'2018-03-15', updatedAt:'2024-12-01' },
  { id:'7', name:'Poulailler Central',       code:'Z-P', type:'infrastructure', area:0.3,  capacity:500,used:420,status:'active',  responsible:'Christine Mapendo',     notes:'Poulailler pondeuses ISA Brown', createdAt:'2018-03-15', updatedAt:'2024-12-01' },
]

const INIT_ALERTS: Alert[] = [
  { id:'1', type:'critical', category:'animalHealth', title:'Animal malade non traité',   desc:'CAP-2022-001 (Mutoto) — Traitement requis depuis 3 jours', status:'new',  time:'Il y a 2h',  createdAt:'2025-01-07T12:00' },
  { id:'2', type:'high',     category:'stock',        title:'Stock médicaments critique', desc:'Ivermectine 1% — 2 flacons restants (seuil: 10)',           status:'new',  time:'Il y a 5h',  createdAt:'2025-01-07T09:00' },
  { id:'3', type:'normal',   category:'crops',        title:'Culture prête à récolter',   desc:'Maïs Zone C (2.5 ha) — Fenêtre de récolte : 7 jours',       status:'seen', time:'Il y a 1j',  createdAt:'2025-01-06T08:00' },
  { id:'4', type:'high',     category:'hr',           title:'Absence non justifiée',      desc:'Employé Kabila Jonas — Absent depuis 2 jours sans justificatif', status:'new',time:'Il y a 1j',createdAt:'2025-01-06T07:00' },
  { id:'5', type:'normal',   category:'finance',      title:'Facture en attente',         desc:'Fournisseur Semences KIVU — 450 USD à régler',              status:'seen', time:'Il y a 3j',  createdAt:'2025-01-04T10:00' },
  { id:'6', type:'info',     category:'livestock',    title:'Rappel vaccin à prévoir',    desc:'BOV-2021-001 (Mapendo) — Vaccin FMD dans 7 jours',          status:'seen', time:'Il y a 3j',  createdAt:'2025-01-04T09:00' },
]

// ── Helper ────────────────────────────────────────────────────────────────
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }
function now() { return new Date().toISOString().split('T')[0] }

// ── Store ─────────────────────────────────────────────────────────────────
interface AppStore {
  animals:     Animal[]
  employees:   Employee[]
  crops:       Crop[]
  harvests:    Harvest[]
  stock:       StockItem[]
  movements:   StockMovement[]
  machines:    Machine[]
  tasks:       Task[]
  transactions:Transaction[]
  zones:       Zone[]
  alerts:      Alert[]

  // Animals CRUD
  addAnimal:    (a: Omit<Animal,'id'|'createdAt'|'updatedAt'>) => Animal
  updateAnimal: (id:string, changes: Partial<Animal>) => void
  deleteAnimal: (id:string) => void

  // Employees CRUD
  addEmployee:    (e: Omit<Employee,'id'|'createdAt'|'updatedAt'>) => Employee
  updateEmployee: (id:string, changes: Partial<Employee>) => void
  deleteEmployee: (id:string) => void

  // Crops CRUD
  addCrop:    (c: Omit<Crop,'id'|'createdAt'|'updatedAt'>) => Crop
  updateCrop: (id:string, changes: Partial<Crop>) => void
  deleteCrop: (id:string) => void

  // Harvests CRUD
  addHarvest:    (h: Omit<Harvest,'id'|'createdAt'>) => Harvest
  updateHarvest: (id:string, changes: Partial<Harvest>) => void
  deleteHarvest: (id:string) => void

  // Stock CRUD
  addStockItem:    (s: Omit<StockItem,'id'|'status'|'createdAt'|'updatedAt'>) => StockItem
  updateStockItem: (id:string, changes: Partial<StockItem>) => void
  deleteStockItem: (id:string) => void
  addMovement:     (m: Omit<StockMovement,'id'>) => void

  // Machines CRUD
  addMachine:    (m: Omit<Machine,'id'|'createdAt'|'updatedAt'>) => Machine
  updateMachine: (id:string, changes: Partial<Machine>) => void
  deleteMachine: (id:string) => void

  // Tasks CRUD
  addTask:    (t: Omit<Task,'id'|'createdAt'|'updatedAt'>) => Task
  updateTask: (id:string, changes: Partial<Task>) => void
  deleteTask: (id:string) => void
  moveTask:   (id:string, status:string) => void

  // Transactions CRUD
  addTransaction:    (t: Omit<Transaction,'id'|'createdAt'>) => Transaction
  updateTransaction: (id:string, changes: Partial<Transaction>) => void
  deleteTransaction: (id:string) => void

  // Zones CRUD
  addZone:    (z: Omit<Zone,'id'|'createdAt'|'updatedAt'>) => Zone
  updateZone: (id:string, changes: Partial<Zone>) => void
  deleteZone: (id:string) => void

  // Alerts
  resolveAlert: (id:string) => void
  dismissAlert: (id:string) => void
  addAlert:     (a: Omit<Alert,'id'|'createdAt'>) => void

  // Reset
  resetAll: () => void
}

function calcStockStatus(qty: number, threshold: number): string {
  if (qty <= 0) return 'critical'
  if (qty <= threshold * 0.3) return 'critical'
  if (qty <= threshold) return 'low'
  return 'ok'
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      animals:      INIT_ANIMALS,
      employees:    INIT_EMPLOYEES,
      crops:        INIT_CROPS,
      harvests:     INIT_HARVESTS,
      stock:        INIT_STOCK,
      movements:    INIT_STOCK_MOVEMENTS,
      machines:     INIT_MACHINES,
      tasks:        INIT_TASKS,
      transactions: INIT_TRANSACTIONS,
      zones:        INIT_ZONES,
      alerts:       INIT_ALERTS,

      // ── Animals ──────────────────────────────────────────────
      addAnimal: (data) => {
        const species = data.species?.toUpperCase().slice(0,3) || 'ANI'
        const year = new Date().getFullYear()
        const count = get().animals.filter(a => a.species === data.species).length + 1
        const systemId = `${species}-${year}-${String(count).padStart(3,'0')}`
        const animal: Animal = { ...data, id: genId(), systemId, createdAt: now(), updatedAt: now() }
        set(s => ({ animals: [...s.animals, animal] }))
        // Auto-alert if quarantine
        if (data.quarantine) {
          get().addAlert({ type:'normal', category:'animalHealth', title:`Quarantaine — ${systemId}`, desc:`${systemId} en quarantaine 14 jours`, status:'new', time:'À l\'instant' })
        }
        return animal
      },
      updateAnimal: (id, changes) => set(s => ({
        animals: s.animals.map(a => a.id === id ? { ...a, ...changes, updatedAt: now() } : a)
      })),
      deleteAnimal: (id) => set(s => ({ animals: s.animals.filter(a => a.id !== id) })),

      // ── Employees ────────────────────────────────────────────
      addEmployee: (data) => {
        const emp: Employee = { ...data, id: genId(), createdAt: now(), updatedAt: now() }
        set(s => ({ employees: [...s.employees, emp] }))
        return emp
      },
      updateEmployee: (id, changes) => set(s => ({
        employees: s.employees.map(e => e.id === id ? { ...e, ...changes, updatedAt: now() } : e)
      })),
      deleteEmployee: (id) => set(s => ({ employees: s.employees.filter(e => e.id !== id) })),

      // ── Crops ────────────────────────────────────────────────
      addCrop: (data) => {
        const crop: Crop = { ...data, id: genId(), createdAt: now(), updatedAt: now() }
        set(s => ({ crops: [...s.crops, crop] }))
        return crop
      },
      updateCrop: (id, changes) => set(s => ({
        crops: s.crops.map(c => c.id === id ? { ...c, ...changes, updatedAt: now() } : c)
      })),
      deleteCrop: (id) => set(s => ({ crops: s.crops.filter(c => c.id !== id) })),

      // ── Harvests ─────────────────────────────────────────────
      addHarvest: (data) => {
        const h: Harvest = { ...data, id: genId(), createdAt: now() }
        set(s => ({ harvests: [...s.harvests, h] }))
        // Auto transaction if revenue
        if (data.revenue > 0) {
          get().addTransaction({ type:'income', category:'crop_sales', description:`Vente ${data.cropType} — ${data.netQty} ${data.unit}`, amount:data.revenue, date:data.date, paymentMethod:'cash', status:'paid', reference:'', notes:'' })
        }
        return h
      },
      updateHarvest: (id, changes) => set(s => ({
        harvests: s.harvests.map(h => h.id === id ? { ...h, ...changes } : h)
      })),
      deleteHarvest: (id) => set(s => ({ harvests: s.harvests.filter(h => h.id !== id) })),

      // ── Stock ────────────────────────────────────────────────
      addStockItem: (data) => {
        const status = calcStockStatus(data.quantity, data.threshold)
        const item: StockItem = { ...data, id: genId(), status, createdAt: now(), updatedAt: now() }
        set(s => ({ stock: [...s.stock, item] }))
        return item
      },
      updateStockItem: (id, changes) => set(s => ({
        stock: s.stock.map(item => {
          if (item.id !== id) return item
          const updated = { ...item, ...changes, updatedAt: now() }
          updated.status = calcStockStatus(updated.quantity, updated.threshold)
          return updated
        })
      })),
      deleteStockItem: (id) => set(s => ({ stock: s.stock.filter(i => i.id !== id) })),
      addMovement: (data) => {
        const mv: StockMovement = { ...data, id: genId() }
        set(s => {
          const stock = s.stock.map(item => {
            if (item.id !== data.itemId) return item
            const delta = data.type === 'in' ? data.quantity : -data.quantity
            const quantity = Math.max(0, item.quantity + delta)
            return { ...item, quantity, status: calcStockStatus(quantity, item.threshold), updatedAt: now() }
          })
          return { movements: [...s.movements, mv], stock }
        })
        // Alert if critical
        const item = get().stock.find(i => i.id === data.itemId)
        if (item && item.status === 'critical') {
          get().addAlert({ type:'critical', category:'stock', title:`Stock critique: ${item.name}`, desc:`Quantité: ${item.quantity} ${item.unit} (seuil: ${item.threshold})`, status:'new', time:'À l\'instant' })
        }
      },

      // ── Machines ─────────────────────────────────────────────
      addMachine: (data) => {
        const m: Machine = { ...data, id: genId(), createdAt: now(), updatedAt: now() }
        set(s => ({ machines: [...s.machines, m] }))
        return m
      },
      updateMachine: (id, changes) => set(s => ({
        machines: s.machines.map(m => m.id === id ? { ...m, ...changes, updatedAt: now() } : m)
      })),
      deleteMachine: (id) => set(s => ({ machines: s.machines.filter(m => m.id !== id) })),

      // ── Tasks ────────────────────────────────────────────────
      addTask: (data) => {
        const t: Task = { ...data, id: genId(), createdAt: now(), updatedAt: now() }
        set(s => ({ tasks: [...s.tasks, t] }))
        return t
      },
      updateTask: (id, changes) => set(s => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, ...changes, updatedAt: now() } : t)
      })),
      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      moveTask: (id, status) => set(s => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, status, updatedAt: now() } : t)
      })),

      // ── Transactions ─────────────────────────────────────────
      addTransaction: (data) => {
        const t: Transaction = { ...data, id: genId(), createdAt: now() }
        set(s => ({ transactions: [t, ...s.transactions] }))
        return t
      },
      updateTransaction: (id, changes) => set(s => ({
        transactions: s.transactions.map(t => t.id === id ? { ...t, ...changes } : t)
      })),
      deleteTransaction: (id) => set(s => ({ transactions: s.transactions.filter(t => t.id !== id) })),

      // ── Zones ────────────────────────────────────────────────
      addZone: (data) => {
        const z: Zone = { ...data, id: genId(), createdAt: now(), updatedAt: now() }
        set(s => ({ zones: [...s.zones, z] }))
        return z
      },
      updateZone: (id, changes) => set(s => ({
        zones: s.zones.map(z => z.id === id ? { ...z, ...changes, updatedAt: now() } : z)
      })),
      deleteZone: (id) => set(s => ({ zones: s.zones.filter(z => z.id !== id) })),

      // ── Alerts ───────────────────────────────────────────────
      resolveAlert: (id) => set(s => ({
        alerts: s.alerts.map(a => a.id === id ? { ...a, status:'resolved' } : a)
      })),
      dismissAlert: (id) => set(s => ({
        alerts: s.alerts.map(a => a.id === id ? { ...a, status:'ignored' } : a)
      })),
      addAlert: (data) => set(s => ({
        alerts: [{ ...data, id: genId(), createdAt: new Date().toISOString() }, ...s.alerts]
      })),

      // ── Reset ────────────────────────────────────────────────
      resetAll: () => set({
        animals: INIT_ANIMALS, employees: INIT_EMPLOYEES, crops: INIT_CROPS,
        harvests: INIT_HARVESTS, stock: INIT_STOCK, movements: INIT_STOCK_MOVEMENTS,
        machines: INIT_MACHINES, tasks: INIT_TASKS, transactions: INIT_TRANSACTIONS,
        zones: INIT_ZONES, alerts: INIT_ALERTS,
      }),
    }),
    {
      name: 'mugogo-erp-store',
      version: 1,
    }
  )
)

// ── FieldReport (rapports envoyés par les employés) ──────────
export interface FieldReport {
  id: string
  authorId: string
  authorName: string
  authorRole: string
  type: 'text' | 'voice' | 'video'
  title: string
  content: string
  mediaUrl?: string
  mediaSize?: string
  duration?: string
  status: 'pending' | 'read' | 'archived'
  category: 'daily' | 'incident' | 'livestock' | 'crops' | 'finance' | 'other'
  createdAt: string
  readAt?: string
}

// ── ManagedUser (utilisateurs créés par l'admin) ─────────────
export interface ManagedUser {
  id: string
  fullName: string
  email: string
  phone: string
  role: string
  language: 'fr' | 'sw' | 'mashi'
  status: 'active' | 'suspended' | 'pending'
  password: string
  createdAt: string
  lastLogin?: string
  zone?: string
}

// ── AccessRequest (demandes d'accès depuis la HomePage) ──────
export interface AccessRequest {
  id: string
  fullName: string
  email: string
  phone: string
  role: string
  language: string
  message?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}
