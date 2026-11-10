// Context providing simulated token-based authentication and active user session state
import { createContext, useContext, useMemo, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/constants'
import { createToken, validateSession } from '../utils/auth'
import { useData } from './DataContext'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { users, addUser } = useData()
  const [session, setSession] = useLocalStorage(STORAGE_KEYS.SESSION, null)

  // Validate session against active users and token expiration
  const currentUser = useMemo(() => {
    return validateSession(session, users)
  }, [session, users])

  // Automatically clear expired or corrupted session
  useEffect(() => {
    if (session && !currentUser) {
      setSession(null)
    }
  }, [session, currentUser, setSession])

  const login = (email, password) => {
    const cleanEmail = email ? email.trim().toLowerCase() : ''
    const user = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    )

    if (!user) {
      return { success: false, error: 'Invalid email or password. Please try again.' }
    }

    const token = createToken(user)
    setSession({ token, user })
    return { success: true, user }
  }

  const register = ({ name, email, password, role }) => {
    const cleanEmail = email ? email.trim().toLowerCase() : ''
    const cleanName = name ? name.trim() : ''

    // Check if email already exists
    const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail)
    if (emailExists) {
      return { success: false, error: 'An account with this email already exists.' }
    }

    const newUser = addUser({
      name: cleanName,
      email: cleanEmail,
      password,
      role,
    })

    const token = createToken(newUser)
    setSession({ token, user: newUser })
    return { success: true, user: newUser }
  }

  const logout = () => {
    setSession(null)
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
