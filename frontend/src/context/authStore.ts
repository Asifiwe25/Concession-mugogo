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
  lastLogin?: string
}

// Safe localStorage helpers — never throw on Vercel
function lsGet(key: string): string | null {
  try { return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null }
  catch { return null }
}
function lsSet(key: string, val: string) {
  try { typeof window !== 'undefined' && window.localStorage.setItem(key, val) } catch {}
}
function lsDel(key: string) {
  try { typeof window !== 'undefined' && window.localStorage.removeItem(key) } catch {}
}

function getStoredUser(): User | null {
  const stored = lsGet('mugogo_user')
  const token  = lsGet('mugogo_token')
  if (!stored || !token) return null
  try { return JSON.parse(stored) as User } catch { return null }
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
  token:           lsGet('mugogo_token'),
  isAuthenticated: !!(lsGet('mugogo_token') && lsGet('mugogo_user')),

  login: (user, token) => {
    lsSet('mugogo_token', token)
    lsSet('mugogo_user', JSON.stringify({ ...user, lastLogin: new Date().toISOString() }))
    lsSet('mugogo_lang', user.language || 'fr')
    set({ user: { ...user, lastLogin: new Date().toISOString() }, token, isAuthenticated: true })
  },

  logout: () => {
    lsDel('mugogo_token')
    lsDel('mugogo_user')
    lsDel('mugogo_session_expiry')
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (updates) => set((state) => {
    const updated = state.user ? { ...state.user, ...updates } : null
    if (updated) lsSet('mugogo_user', JSON.stringify(updated))
    return { user: updated }
  }),
}))
