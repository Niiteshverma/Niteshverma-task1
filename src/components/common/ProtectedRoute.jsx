import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'

export default function ProtectedRoute({ allowedRole, children }) {
  const { currentUser } = useAuth()

  // If not logged in, redirect to login page
  if (!currentUser || !currentUser.role) {
    return <Navigate to="/" replace />
  }

  // If logged in with wrong role, redirect to their role's dashboard
  if (currentUser.role !== allowedRole) {
    const destination = currentUser.role === ROLES.ADMIN ? '/admin' : '/student'
    return <Navigate to={destination} replace />
  }

  return children
}
