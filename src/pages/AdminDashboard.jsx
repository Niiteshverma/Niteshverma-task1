import { useState, useEffect } from 'react'
import Header from '../components/common/Header'
import Modal from '../components/common/Modal'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import AdminAssignmentCard from '../components/admin/AdminAssignmentCard'
import AssignmentForm from '../components/admin/AssignmentForm'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { initialUsers } from '../data/seedData'

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  const {
    getAdminAssignments,
    getStudentSubmission,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    storageError,
    resetData,
  } = useData()

  // Simulated short loading delay (~500ms)
  const [isLoading, setIsLoading] = useState(true)

  // Modal states for Create, Edit, and Delete confirmation
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [assignmentToEdit, setAssignmentToEdit] = useState(null)
  const [assignmentToDelete, setAssignmentToDelete] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Students list from seed users for assignment targeting and status tracking
  const students = initialUsers.filter((u) => u.role === 'student')

  // Retrieve only assignments created by this logged-in admin
  const adminAssignments = currentUser ? getAdminAssignments(currentUser.id) : []

  // Create submission handler
  const handleCreateSubmit = (formData) => {
    if (!currentUser) return
    createAssignment({
      ...formData,
      createdBy: currentUser.id,
    })
    setIsCreateOpen(false)
  }

  // Edit submission handler
  const handleEditSubmit = (formData) => {
    if (!assignmentToEdit) return
    updateAssignment(assignmentToEdit.id, formData)
    setAssignmentToEdit(null)
  }

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (!assignmentToDelete) return
    deleteAssignment(assignmentToDelete.id)
    setAssignmentToDelete(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Storage Error State */}
        {storageError ? (
          <ErrorState message={storageError} onReset={resetData} />
        ) : isLoading ? (
          /* Simulated Loading State */
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <Loader message="Loading your assignments..." />
          </div>
        ) : (
          <>
            {/* Admin Header Section */}
            <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  Welcome, {currentUser?.name}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Admin Workspace &bull; Manage assignments, monitor progress, and review student submissions.
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

            {/* Assignments Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                  Your Created Assignments ({adminAssignments.length})
                </h3>
              </div>

              {adminAssignments.length === 0 ? (
                <EmptyState
                  title="You haven't created any assignments"
                  description="Get started by creating your first assignment for your students."
                  actionLabel="+ Create Assignment"
                  onAction={() => setIsCreateOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {adminAssignments.map((assignment) => (
                    <AdminAssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      allStudents={students}
                      getStudentSubmission={getStudentSubmission}
                      onEdit={(item) => setAssignmentToEdit(item)}
                      onDelete={(item) => setAssignmentToDelete(item)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
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

      {/* Edit Assignment Modal */}
      <Modal
        isOpen={Boolean(assignmentToEdit)}
        onClose={() => setAssignmentToEdit(null)}
        title="Edit Assignment"
      >
        {assignmentToEdit && (
          <AssignmentForm
            isOpen={Boolean(assignmentToEdit)}
            initialData={assignmentToEdit}
            onClose={() => setAssignmentToEdit(null)}
            onSubmit={handleEditSubmit}
            students={students}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(assignmentToDelete)}
        onClose={() => setAssignmentToDelete(null)}
        title="Confirm Delete Assignment"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this assignment?
          </p>

          {assignmentToDelete && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-red-900">
                {assignmentToDelete.title}
              </p>
              <p className="text-xs text-red-700 mt-1">
                This will permanently delete the assignment and all associated student submission records.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setAssignmentToDelete(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm"
            >
              Yes, Delete Assignment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
