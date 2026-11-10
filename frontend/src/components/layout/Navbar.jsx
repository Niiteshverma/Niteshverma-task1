// Top navigation bar displaying brand, active user info, role badge, and logout trigger
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { ROLES } from '../../utils/constants'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    showToast('Logged out successfully', 'info')
    navigate('/login', { replace: true })
  }

  const isProfessor = currentUser?.role === ROLES.PROFESSOR

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            SM
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg block leading-none">
              Portal
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Student &amp; Assignment Management
            </span>
          </div>
        </div>

        {/* User Info & Actions */}
        {currentUser && (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 text-right">
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
              </div>

              <Badge variant={isProfessor ? 'purple' : 'info'} size="sm" dot>
                {isProfessor ? 'Professor' : 'Student'}
              </Badge>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="text-xs"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

