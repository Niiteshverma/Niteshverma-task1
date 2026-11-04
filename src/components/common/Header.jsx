import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  if (!currentUser) return null

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            AR
          </div>
          <div>
            <h1 className="font-semibold text-slate-800 text-sm sm:text-base leading-tight">
              Assignment &amp; Review Dashboard
            </h1>
            <p className="text-xs text-slate-500 capitalize">
              {currentUser.role} Workspace
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-800">{currentUser.name}</p>
            <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 capitalize">
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
