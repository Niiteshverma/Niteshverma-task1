import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Store the active user in localStorage so login persists across page reloads
  const [currentUser, setCurrentUser] = useLocalStorage('current_user', null)

  const login = (user) => {
    setCurrentUser(user)
  }

  const logout = () => {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for convenient access to auth state in components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

