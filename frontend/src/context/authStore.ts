import { create } from 'zustand'

export type Role =
  | 'super_admin' | 'director' | 'livestock_manager' | 'farm_manager'
  | 'hr_manager' | 'accountant' | 'vet' | 'shepherd' | 'farmer' | 'visitor'

export interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  role: Role
  language: 'fr' | 'sw' | 'mashi'
  avatar?: string
  concessionId?: string
  lastLogin?: string
  sessionExpiry?: number
}

// Session duration: 8 hours
const SESSION_DURATION = 8 * 60 * 60 * 1000

function isSessionValid(): boolean {
  try {
    const expiry = localStorage.getItem('mugogo_session_expiry')
    if (!expiry) return false
    const token = localStorage.getItem('mugogo_token')
    if (!token) return false
    return Date.now() < parseInt(expiry)
  } catch { return false }
}

function getStoredUser(): User | null {
  try {
    if (!isSessionValid()) {
      clearSession()
      return null
    }
    const stored = localStorage.getItem('mugogo_user')
    return stored ? JSON.parse(stored) : null
  } catch { return null }
}

function clearSession() {
  localStorage.removeItem('mugogo_token')
  localStorage.removeItem('mugogo_user')
  localStorage.removeItem('mugogo_session_expiry')
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  checkSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: isSessionValid() ? localStorage.getItem('mugogo_token') : null,
  isAuthenticated: isSessionValid() && !!localStorage.getItem('mugogo_token'),

  login: (user, token) => {
    const expiry = Date.now() + SESSION_DURATION
    localStorage.setItem('mugogo_token', token)
    localStorage.setItem('mugogo_user', JSON.stringify({ ...user, lastLogin: new Date().toISOString() }))
    localStorage.setItem('mugogo_session_expiry', String(expiry))
    localStorage.setItem('mugogo_lang', user.language || 'fr')
    set({ user: { ...user, lastLogin: new Date().toISOString(), sessionExpiry: expiry }, token, isAuthenticated: true })
  },

  logout: () => {
    clearSession()
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (updates) =>
    set((state) => {
      const updated = state.user ? { ...state.user, ...updates } : null
      if (updated) localStorage.setItem('mugogo_user', JSON.stringify(updated))
      return { user: updated }
    }),

  checkSession: () => {
    if (!isSessionValid()) {
      clearSession()
      set({ user: null, token: null, isAuthenticated: false })
    }
  },
}))

// Auto-check session every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    useAuthStore.getState().checkSession()
  }, 5 * 60 * 1000)
}
