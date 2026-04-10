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
  language: 'fr' | 'en' | 'sw' | 'mashi'
  avatar?: string
  concessionId?: string
  lastLogin?: string
  sessionExpiry?: number
}

const SESSION_DURATION = 8 * 60 * 60 * 1000

// Simple session check - no expiry on Vercel to avoid issues
function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem('mugogo_user')
    const token  = localStorage.getItem('mugogo_token')
    if (!stored || !token) return null
    return JSON.parse(stored) as User
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
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            getStoredUser(),
  token:           localStorage.getItem('mugogo_token'),
  isAuthenticated: !!localStorage.getItem('mugogo_token') && !!localStorage.getItem('mugogo_user'),

  login: (user, token) => {
    localStorage.setItem('mugogo_token', token)
    localStorage.setItem('mugogo_user', JSON.stringify({ ...user, lastLogin: new Date().toISOString() }))
    localStorage.setItem('mugogo_lang', user.language || 'fr')
    set({ user: { ...user, lastLogin: new Date().toISOString() }, token, isAuthenticated: true })
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
}))
