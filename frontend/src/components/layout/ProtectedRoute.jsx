// Route guard ensuring the user is authenticated and possesses the required role
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'

export default function ProtectedRoute({ allowedRole, children }) {
  const { currentUser } = useAuth()

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // If role does not match, redirect to the user's appropriate dashboard
  if (allowedRole && currentUser.role !== allowedRole) {
    const destination = currentUser.role === ROLES.PROFESSOR ? '/professor' : '/student'
    return <Navigate to={destination} replace />
  }

  return children
}
