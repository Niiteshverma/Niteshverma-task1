// Context providing current user authentication and role state
import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ROLES, STORAGE_KEYS } from '../utils/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [storedUser, setStoredUser] = useLocalStorage(STORAGE_KEYS.USER, null)

  // Validate that the stored user has a recognized role and non-empty id
  const isValidObject = storedUser && typeof storedUser === 'object' && !Array.isArray(storedUser)
  const hasValidRole = isValidObject && (storedUser.role === ROLES.STUDENT || storedUser.role === ROLES.ADMIN)
  const currentUser = hasValidRole && typeof storedUser.id === 'string' && storedUser.id.trim() ? storedUser : null

  const login = (user) => {
    if (user && user.id && (user.role === ROLES.STUDENT || user.role === ROLES.ADMIN)) {
      setStoredUser(user)
    }
  }

  const logout = () => {
    setStoredUser(null)
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
