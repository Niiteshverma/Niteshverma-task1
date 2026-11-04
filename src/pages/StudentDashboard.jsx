import Header from '../components/common/Header'
import AssignmentCard from '../components/student/AssignmentCard'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

export default function StudentDashboard() {
  const { currentUser } = useAuth()
  const { getStudentAssignments, getStudentSubmission } = useData()

  // Retrieve only assignments assigned to this student
  const studentAssignments = currentUser ? getStudentAssignments(currentUser.id) : []

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Welcome Section */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            Welcome back, {currentUser?.name}!
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Here are the assignments assigned to you. Review due dates and materials.
          </p>
        </section>

        {/* Assignments List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">
              Your Assignments ({studentAssignments.length})
            </h3>
          </div>

          {studentAssignments.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
              <p className="text-sm text-slate-500">
                You have no assignments assigned to you at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  submission={getStudentSubmission(assignment.id, currentUser.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
