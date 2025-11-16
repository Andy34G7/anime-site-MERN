import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { setAuthToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const u = typeof window !== 'undefined' ? localStorage.getItem('username') : null
    setToken(t)
    setUsername(u)
    setAuthToken(t)
    setLoading(false)
  }, [])

  const login = (newToken, user) => {
    setToken(newToken)
    setUsername(user?.username || null)
    try { localStorage.setItem('token', newToken) } catch {}
    try { localStorage.setItem('username', user?.username || '') } catch {}
    setAuthToken(newToken)
  }

  const logout = () => {
    setToken(null)
    setUsername(null)
    try { localStorage.removeItem('token') } catch {}
    try { localStorage.removeItem('username') } catch {}
    setAuthToken(null)
  }

  // Optional: refresh current user
  const refresh = async () => {
    if (!token) return null
    try {
      const res = await api.get('/me')
      const user = res.data?.user
      if (user?.username) {
        setUsername(user.username)
        try { localStorage.setItem('username', user.username) } catch {}
      }
      return user
    } catch {
      return null
    }
  }

  const value = useMemo(() => ({ token, username, login, logout, refresh, loading }), [token, username, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
