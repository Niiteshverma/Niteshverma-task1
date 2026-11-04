import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { initialUsers } from '../data/seedData'
import { ROLES } from '../utils/constants'

// Small internal component to render each clickable user card
function UserCard({ user, onSelect }) {
  const isAdmin = user.role === ROLES.ADMIN

  return (
    <button
      type="button"
      onClick={() => onSelect(user)}
      className="flex items-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 transition ${
          isAdmin
            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white'
            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white'
        }`}
      >
        {user.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
          {user.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
          {user.role} {isAdmin ? '• Manage Class' : ''}
        </p>
      </div>
    </button>
  )
}

export default function LoginPage() {
  const { currentUser, login } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  if (currentUser?.role === ROLES.ADMIN) return <Navigate to="/admin" replace />
  if (currentUser?.role === ROLES.STUDENT) return <Navigate to="/student" replace />

  const admins = initialUsers.filter((u) => u.role === ROLES.ADMIN)
  const students = initialUsers.filter((u) => u.role === ROLES.STUDENT)

  const handleSelectUser = (user) => {
    login(user)
    const destination = user.role === ROLES.ADMIN ? '/admin' : '/student'
    navigate(destination, { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-sm">
            AR
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Assignment &amp; Review Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a mock user profile below to sign in directly (no password needed).
          </p>
        </div>

        {/* Admin Accounts */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Professors / Admins ({admins.length})
            </h2>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full font-medium">
              Create &amp; Review
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {admins.map((user) => (
              <UserCard key={user.id} user={user} onSelect={handleSelectUser} />
            ))}
          </div>
        </section>

        {/* Student Accounts */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Students ({students.length})
            </h2>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-medium">
              Submit &amp; Track
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {students.map((user) => (
              <UserCard key={user.id} user={user} onSelect={handleSelectUser} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
