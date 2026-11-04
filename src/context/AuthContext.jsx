import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AuthContext = createContext(null)

// Validate that a user object has the expected schema and role
function isValidUser(user) {
  return (
    user !== null &&
    typeof user === 'object' &&
    typeof user.id === 'string' &&
    user.id.trim().length > 0 &&
    typeof user.name === 'string' &&
    (user.role === 'student' || user.role === 'admin')
  )
}

export function AuthProvider({ children }) {
  const [storedUser, setStoredUser] = useLocalStorage('current_user', null)

  // Ensure stored user is valid, otherwise treat as logged out
  const currentUser = useMemo(() => {
    return isValidUser(storedUser) ? storedUser : null
  }, [storedUser])

  const login = (user) => {
    if (isValidUser(user)) {
      setStoredUser(user)
    } else {
      console.warn('Attempted to log in with invalid user object:', user)
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
