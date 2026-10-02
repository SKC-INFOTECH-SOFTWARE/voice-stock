import { createContext, useContext, useEffect, useState } from 'react'
import { adminMe, adminLogout, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

/**
 * App-wide auth. Validates any stored token on mount so the WHOLE app (billing + admin)
 * sits behind login. Exposes user + login/logout helpers.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!getToken()) { setChecking(false); return }
    adminMe()
      .then((res) => setUser(res.user))
      .catch(() => setToken(''))
      .finally(() => setChecking(false))
  }, [])

  async function logout() {
    try { await adminLogout() } catch { /* ignore */ }
    setToken('')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, checking, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
