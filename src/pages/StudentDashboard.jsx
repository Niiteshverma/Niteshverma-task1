import Header from '../components/common/Header'
import { useAuth } from '../context/AuthContext'

export default function StudentDashboard() {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            Welcome back, {currentUser?.name}!
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Student Dashboard &bull; View your pending and completed assignments.
          </p>
        </div>
      </main>
    </div>
  )
}
