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
