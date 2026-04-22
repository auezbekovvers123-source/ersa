import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { apiJson } from '../api.js'

const STORAGE_KEY = 'teamproject_user'

const AuthContext = createContext(null)

function normalizeUser(raw) {
  if (!raw) return null
  return {
    ...raw,
    role: raw.role === 'admin' ? 'admin' : 'user',
  }
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? normalizeUser(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const persist = useCallback((next) => {
    const normalized = normalizeUser(next)
    setUser(normalized)
    if (normalized) localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const data = await apiJson('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    persist(data.user)
    return data.user
  }, [persist])

  const register = useCallback(async ({ email, password, name, role }) => {
    const data = await apiJson('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    })
    persist(data.user)
    return data.user
  }, [persist])

  const logout = useCallback(() => {
    persist(null)
  }, [persist])

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
