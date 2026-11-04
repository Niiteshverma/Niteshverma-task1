import { useState } from 'react'
import Header from '../components/common/Header'
import Modal from '../components/common/Modal'
import AdminAssignmentCard from '../components/admin/AdminAssignmentCard'
import AssignmentForm from '../components/admin/AssignmentForm'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { initialUsers } from '../data/seedData'

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  const { getAdminAssignments, createAssignment } = useData()

  // Modal open/close state for creating an assignment
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Students list from seed users for assignment targeting
  const students = initialUsers.filter((u) => u.role === 'student')

  // Retrieve only assignments created by this logged-in admin
  const adminAssignments = currentUser ? getAdminAssignments(currentUser.id) : []

  const handleCreateSubmit = (formData) => {
    if (!currentUser) return
    createAssignment({
      ...formData,
      createdBy: currentUser.id,
    })
    setIsCreateOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Admin Header Section */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Welcome, {currentUser?.name}!
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Admin Workspace &bull; Create assignments and track student submissions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition shrink-0"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Assignment
          </button>
        </section>

        {/* Assignments List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">
              Your Created Assignments ({adminAssignments.length})
            </h3>
          </div>

          {adminAssignments.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center space-y-3">
              <p className="text-sm text-slate-500">
                You haven&apos;t created any assignments yet.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition"
              >
                + Create your first assignment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminAssignments.map((assignment) => (
                <AdminAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  totalStudentsCount={students.length}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Assignment"
      >
        <AssignmentForm
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
          students={students}
        />
      </Modal>
    </div>
  )
}
