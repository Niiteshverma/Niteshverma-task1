import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { initialUsers } from '../data/seedData'

export default function LoginPage() {
  const { currentUser, login } = useAuth()
  const navigate = useNavigate()

  // If already logged in, redirect directly to their dashboard
  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/student'} replace />
  }

  const admins = initialUsers.filter((u) => u.role === 'admin')
  const students = initialUsers.filter((u) => u.role === 'student')

  const handleSelectUser = (user) => {
    login(user)
    if (user.role === 'admin') {
      navigate('/admin', { replace: true })
    } else {
      navigate('/student', { replace: true })
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-sm">
            AR
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Assignment &amp; Review Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Select a mock user profile below to sign in directly (no password needed).
          </p>
        </div>

        {/* Admin Accounts */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Professors / Admins ({admins.length})
            </h2>
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
              Create &amp; Review
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {admins.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-sm text-left transition group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mr-3 group-hover:bg-indigo-600 group-hover:text-white transition">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user.role} &bull; Manage Class
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Student Accounts */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Students ({students.length})
            </h2>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              Submit &amp; Track
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {students.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm text-left transition group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mr-3 group-hover:bg-emerald-600 group-hover:text-white transition">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user.role}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
