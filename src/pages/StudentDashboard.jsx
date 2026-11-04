import { useState, useEffect } from 'react'
import Header from '../components/common/Header'
import Modal from '../components/common/Modal'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import AssignmentCard from '../components/student/AssignmentCard'
import StudentProgress from '../components/student/StudentProgress'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

export default function StudentDashboard() {
  const { currentUser } = useAuth()
  const {
    getStudentAssignments,
    getStudentSubmission,
    submitAssignment,
    storageError,
    resetData,
  } = useData()

  // Simulated short loading delay (~500ms)
  const [isLoading, setIsLoading] = useState(true)

  // Track the assignment currently selected for submission confirmation
  const [assignmentToSubmit, setAssignmentToSubmit] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Retrieve only assignments assigned to this student
  const studentAssignments = currentUser ? getStudentAssignments(currentUser.id) : []

  // Count how many assignments this student has submitted
  const submittedCount = studentAssignments.filter(
    (assignment) => getStudentSubmission(assignment.id, currentUser?.id)?.status === 'Submitted'
  ).length

  const handleOpenSubmitModal = (assignment) => {
    setAssignmentToSubmit(assignment)
  }

  const handleCloseSubmitModal = () => {
    if (isSubmitting) return
    setAssignmentToSubmit(null)
  }

  const handleConfirmSubmit = () => {
    if (!assignmentToSubmit || !currentUser || isSubmitting) return

    setIsSubmitting(true)
    submitAssignment(assignmentToSubmit.id, currentUser.id)
    setIsSubmitting(false)
    setAssignmentToSubmit(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Error State */}
        {storageError ? (
          <ErrorState message={storageError} onReset={resetData} />
        ) : isLoading ? (
          /* Simulated Loading State */
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <Loader message="Loading your assignments..." />
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  Welcome back, {currentUser?.name}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Review your course materials and confirm your assignment submissions.
                </p>
              </div>
            </section>

            {/* Progress Overview (shown if student has assignments) */}
            {studentAssignments.length > 0 && (
              <StudentProgress
                submittedCount={submittedCount}
                totalCount={studentAssignments.length}
              />
            )}

            {/* Assignments Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                  Your Assignments ({studentAssignments.length})
                </h3>
              </div>

              {studentAssignments.length === 0 ? (
                <EmptyState
                  title="No assignments yet"
                  description="You're all caught up! No assignments have been assigned to you."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      submission={getStudentSubmission(assignment.id, currentUser.id)}
                      onSubmitClick={handleOpenSubmitModal}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Two-step Submission Confirmation Modal */}
      <Modal
        isOpen={Boolean(assignmentToSubmit)}
        onClose={handleCloseSubmitModal}
        title="Confirm Assignment Submission"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to mark this assignment as submitted? This cannot be undone.
          </p>

          {assignmentToSubmit && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-slate-800">
                {assignmentToSubmit.title}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Due: {assignmentToSubmit.dueDate}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleCloseSubmitModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming...' : 'Yes, Confirm Submission'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
