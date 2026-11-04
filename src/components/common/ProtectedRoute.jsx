import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Route wrapper that ensures:
 * 1. Unauthenticated or invalid users are redirected to the login page.
 * 2. Students cannot access admin routes and admins cannot access student routes.
 */
export default function ProtectedRoute({ allowedRole, children }) {
  const { currentUser } = useAuth()

  // Not logged in or invalid session -> redirect to login
  if (!currentUser || !currentUser.role) {
    return <Navigate to="/" replace />
  }

  // Logged in with wrong role -> redirect to their designated dashboard
  if (currentUser.role !== allowedRole) {
    const destination = currentUser.role === 'admin' ? '/admin' : '/student'
    return <Navigate to={destination} replace />
  }

  return children
}
