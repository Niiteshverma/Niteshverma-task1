// Context providing current user authentication and role state
import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ROLES, STORAGE_KEYS } from '../utils/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [storedSession, setStoredSession] = useLocalStorage(STORAGE_KEYS.SESSION, null)

  // Validate that the stored session has a valid user object with recognized role
  const rawUser = storedSession && storedSession.user ? storedSession.user : storedSession
  const isValidObject = rawUser && typeof rawUser === 'object' && !Array.isArray(rawUser)
  const hasValidRole = isValidObject && (rawUser.role === ROLES.STUDENT || rawUser.role === ROLES.PROFESSOR)
  const currentUser = hasValidRole && typeof rawUser.id === 'string' && rawUser.id.trim() ? rawUser : null

  const login = (userData) => {
    if (userData && userData.id) {
      setStoredSession({
        token: btoa(JSON.stringify({ userId: userData.id, role: userData.role, exp: Date.now() + 3600000 })),
        user: userData,
      })
    }
  }

  const logout = () => {
    setStoredSession(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
