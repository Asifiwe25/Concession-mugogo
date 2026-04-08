import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  fileName?: string
  status: 'pending' | 'read' | 'archived'
  category: 'daily' | 'incident' | 'livestock' | 'crops' | 'finance' | 'other'
  createdAt: string
  readAt?: string
}

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

interface ExtraStore {
  fieldReports:   FieldReport[]
  managedUsers:   ManagedUser[]
  accessRequests: AccessRequest[]

  addFieldReport:     (r: Omit<FieldReport,'id'|'createdAt'|'status'>) => void
  markReportRead:     (id: string) => void
  archiveReport:      (id: string) => void
  deleteReport:       (id: string) => void

  addManagedUser:     (u: Omit<ManagedUser,'id'|'createdAt'>) => void
  updateManagedUser:  (id: string, changes: Partial<ManagedUser>) => void
  deleteManagedUser:  (id: string) => void

  addAccessRequest:   (r: Omit<AccessRequest,'id'|'createdAt'|'status'>) => void
  approveRequest:     (id: string) => void
  rejectRequest:      (id: string) => void
}

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2,7)}`
const now   = () => new Date().toISOString()

export const useExtraStore = create<ExtraStore>()(
  persist(
    (set, get) => ({
      fieldReports:   [],
      managedUsers:   [
        { id:'admin-1', fullName:'Richard Bunani', email:'richardbunani2013@gmail.com', phone:'+243 976960983', role:'super_admin', language:'fr', status:'active', password:'Mugogo@2025!', createdAt:'2025-01-01', lastLogin: new Date().toISOString() },
      ],
      accessRequests: [],

      addFieldReport: (r) => set(s => ({
        fieldReports: [{ ...r, id: genId(), createdAt: now(), status: 'pending' }, ...s.fieldReports]
      })),
      markReportRead: (id) => set(s => ({
        fieldReports: s.fieldReports.map(r => r.id === id ? { ...r, status: 'read', readAt: now() } : r)
      })),
      archiveReport: (id) => set(s => ({
        fieldReports: s.fieldReports.map(r => r.id === id ? { ...r, status: 'archived' } : r)
      })),
      deleteReport: (id) => set(s => ({
        fieldReports: s.fieldReports.filter(r => r.id !== id)
      })),

      addManagedUser: (u) => set(s => ({
        managedUsers: [...s.managedUsers, { ...u, id: genId(), createdAt: now() }]
      })),
      updateManagedUser: (id, changes) => set(s => ({
        managedUsers: s.managedUsers.map(u => u.id === id ? { ...u, ...changes } : u)
      })),
      deleteManagedUser: (id) => set(s => ({
        managedUsers: s.managedUsers.filter(u => u.id !== id)
      })),

      addAccessRequest: (r) => {
        const req: AccessRequest = { ...r, id: genId(), createdAt: now(), status: 'pending' }
        set(s => ({ accessRequests: [req, ...s.accessRequests] }))
        return req
      },
      approveRequest: (id) => set(s => ({
        accessRequests: s.accessRequests.map(r => r.id === id ? { ...r, status: 'approved' } : r)
      })),
      rejectRequest: (id) => set(s => ({
        accessRequests: s.accessRequests.map(r => r.id === id ? { ...r, status: 'rejected' } : r)
      })),
    }),
    { name: 'mugogo-extra-store' }
  )
)

// ── HomePageContent — editable from dashboard ─────────────────
export interface HomePageContent {
  // Hero
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  // About
  aboutTitle: string
  aboutSubtitle: string
  aboutDescription1: string
  aboutDescription2: string
  ownerName: string
  location: string
  phone: string
  email: string
  area: string
  // Stats
  statEmployees: number
  statZones: number
  statArea: number
  // Testimonials
  testimonials: Array<{ name: string; role: string; text: string; stars: number }>
  // Features  
  features: Array<{ title: string; desc: string }>
  // Report section
  reportTitle: string
  reportSubtitle: string
  // CTA
  ctaTitle: string
  ctaSubtitle: string
  // SEO / Meta
  siteName: string
  siteTagline: string
  // Visibility toggles
  showTestimonials: boolean
  showReportSection: boolean
  showAbout: boolean
  showStats: boolean
  showFeatures: boolean
  showRoles: boolean
}

const DEFAULT_HOMEPAGE: HomePageContent = {
  heroTitle: 'Bienvenue sur le système de la',
  heroSubtitle: 'Concession Mugogo',
  heroDescription: 'Plateforme intégrée de gestion agro-pastorale — élevage, cultures, stock, finance et ressources humaines. Toute la concession pilotée depuis un seul système.',
  aboutTitle: 'La Concession Mugogo, une exploitation moderne',
  aboutSubtitle: 'À propos',
  aboutDescription1: 'Fondée et dirigée par Richard Bunani, la Concession Mugogo est une exploitation agro-pastorale intégrée située à Walungu, dans le Sud-Kivu, en République Démocratique du Congo.',
  aboutDescription2: "L'exploitation couvre 9 hectares de terres agricoles et pastorales, avec un cheptel de bovins Ankole, caprins, volailles et porcins, ainsi que des cultures de maïs, pommes de terre et haricots.",
  ownerName: 'Richard Bunani',
  location: 'Walungu, Sud-Kivu, RDC',
  phone: '+243 976960983',
  email: 'richardbunani2013@gmail.com',
  area: '9 hectares',
  statEmployees: 8,
  statZones: 7,
  statArea: 9,
  testimonials: [
    { name: 'Jean-Baptiste Mutombo', role: 'Berger — Cheptel bovin', text: 'Avec le système Mugogo, je peux enregistrer chaque animal, suivre ses vaccinations et voir son évolution de poids semaine après semaine.', stars: 5 },
    { name: 'Marie Kahindo', role: 'Responsable cultures, Zone C', text: "Le calendrier cultural me rappelle chaque étape — semis, fertilisation, récolte. Les alertes automatiques m'ont sauvé plusieurs fois.", stars: 5 },
    { name: 'Dr. David Shabani', role: 'Vétérinaire en chef', text: "Le carnet de vaccination numérique et le suivi de santé de chaque animal ont transformé mon travail. Je consulte l'historique en quelques secondes.", stars: 5 },
    { name: 'Joseph Mutombo', role: 'Comptable principal', text: 'Les rapports financiers mensuels et le suivi des salaires sont maintenant automatisés. Richard Bunani a une vision claire des finances.', stars: 5 },
  ],
  features: [
    { title: 'Tableau de bord', desc: 'KPIs temps réel, alertes, demandes d\'accès et rapports reçus en un coup d\'œil.' },
    { title: 'Élevage & Cheptel', desc: 'Suivi individuel — vaccinations, santé, reproduction, pesées, valeur estimée.' },
    { title: 'Cultures & Plantations', desc: 'Calendrier cultural, semis, irrigation, traitements phytosanitaires, récoltes.' },
    { title: 'Stock & Inventaire', desc: 'Alertes critiques automatiques, mouvements, approvisionnement, traçabilité.' },
    { title: 'Finance & Trésorerie', desc: 'Revenus, dépenses, paiement salaires, budget prévisionnel, rapports.' },
    { title: 'Ressources humaines', desc: 'Dossiers employés, contrats, présences, performance et fiche de paie.' },
    { title: 'Alertes intelligentes', desc: 'Notification automatique — stock critique, animal malade, récolte prête.' },
    { title: 'Sécurité & Audit', desc: 'Rôles différenciés, journal d\'audit immuable, sessions sécurisées 8h.' },
    { title: 'Trilingue FR/SW/Mashi', desc: 'Interface complète en français, kiswahili et mashi pour toute l\'équipe.' },
    { title: 'Rapports PDF & Word', desc: 'Génération de rapports journaliers, mensuels ou annuels téléchargeables.' },
    { title: 'Zones & Parcelles', desc: 'Cartographie des zones, capacité de charge, rotations, occupation.' },
    { title: 'Machines & Entretien', desc: 'Suivi tracteurs, pompes, véhicules — heures compteur et maintenance.' },
  ],
  reportTitle: 'Envoyez votre rapport à Richard Bunani',
  reportSubtitle: 'Rapport écrit, message vocal ou vidéo — sans connexion requise.',
  ctaTitle: 'Prêt à gérer la Concession Mugogo ?',
  ctaSubtitle: 'Connectez-vous maintenant avec votre compte ou demandez un accès à Richard Bunani.',
  siteName: 'Concession Mugogo',
  siteTagline: 'Gestion Agro-pastorale Intégrée',
  showTestimonials: true,
  showReportSection: true,
  showAbout: true,
  showStats: true,
  showFeatures: true,
  showRoles: true,
}

interface HomeStore {
  homeContent: HomePageContent
  updateHomeContent: (changes: Partial<HomePageContent>) => void
  resetHomeContent: () => void
  updateTestimonial: (index: number, changes: Partial<HomePageContent['testimonials'][0]>) => void
  addTestimonial: () => void
  removeTestimonial: (index: number) => void
  updateFeature: (index: number, changes: Partial<HomePageContent['features'][0]>) => void
  addFeature: () => void
  removeFeature: (index: number) => void
}

export const useHomeStore = create<HomeStore>()(
  persist(
    (set) => ({
      homeContent: DEFAULT_HOMEPAGE,
      updateHomeContent: (changes) => set(s => ({ homeContent: { ...s.homeContent, ...changes } })),
      resetHomeContent: () => set({ homeContent: DEFAULT_HOMEPAGE }),
      updateTestimonial: (index, changes) => set(s => ({
        homeContent: { ...s.homeContent, testimonials: s.homeContent.testimonials.map((t, i) => i === index ? { ...t, ...changes } : t) }
      })),
      addTestimonial: () => set(s => ({
        homeContent: { ...s.homeContent, testimonials: [...s.homeContent.testimonials, { name: 'Nouveau témoin', role: 'Rôle', text: 'Témoignage...', stars: 5 }] }
      })),
      removeTestimonial: (index) => set(s => ({
        homeContent: { ...s.homeContent, testimonials: s.homeContent.testimonials.filter((_, i) => i !== index) }
      })),
      updateFeature: (index, changes) => set(s => ({
        homeContent: { ...s.homeContent, features: s.homeContent.features.map((f, i) => i === index ? { ...f, ...changes } : f) }
      })),
      addFeature: () => set(s => ({
        homeContent: { ...s.homeContent, features: [...s.homeContent.features, { title: 'Nouveau module', desc: 'Description...' }] }
      })),
      removeFeature: (index) => set(s => ({
        homeContent: { ...s.homeContent, features: s.homeContent.features.filter((_, i) => i !== index) }
      })),
    }),
    { name: 'mugogo-home-store' }
  )
)
