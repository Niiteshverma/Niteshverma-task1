import { useState, useEffect } from 'react'
import Header from '../components/common/Header'
import Modal from '../components/common/Modal'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import AssignmentCard from '../components/student/AssignmentCard'
import StudentProgress from '../components/student/StudentProgress'
import { formatDate } from '../utils/helpers'
import { LOADING_DELAY, STATUS } from '../utils/constants'
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

  // Component state
  const [isLoading, setIsLoading] = useState(true)
  const [assignmentToSubmit, setAssignmentToSubmit] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pending' | 'submitted'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' (soonest) | 'desc' (latest)

  // Short simulated loading delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), LOADING_DELAY)
    return () => clearTimeout(timer)
  }, [])

  // Derived values calculated directly during render
  const studentAssignments = currentUser ? getStudentAssignments(currentUser.id) : []

  const submittedCount = studentAssignments.filter(
    (a) => getStudentSubmission(a.id, currentUser?.id)?.status === STATUS.SUBMITTED
  ).length

  const pendingCount = studentAssignments.length - submittedCount

  // Filter and sort visible assignments
  const visibleAssignments = studentAssignments
    .filter((a) => {
      const isSubmitted = getStudentSubmission(a.id, currentUser?.id)?.status === STATUS.SUBMITTED
      if (statusFilter === 'submitted') return isSubmitted
      if (statusFilter === 'pending') return !isSubmitted
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime() || 0
      const dateB = new Date(b.dueDate).getTime() || 0
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

  // Handlers
  const handleOpenSubmitModal = (assignment) => {
    setAssignmentToSubmit(assignment)
  }

  const handleCloseSubmitModal = () => {
    if (!isSubmitting) setAssignmentToSubmit(null)
  }

  const handleConfirmSubmit = () => {
    if (!assignmentToSubmit || !currentUser || isSubmitting) return

    setIsSubmitting(true)
    submitAssignment(assignmentToSubmit.id, currentUser.id)
    setIsSubmitting(false)
    setAssignmentToSubmit(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {storageError ? (
          <ErrorState message={storageError} onReset={resetData} />
        ) : isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <Loader message="Loading your assignments..." />
          </div>
        ) : (
          <>
            {/* Student Welcome Banner */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                Welcome back, {currentUser?.name}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Review your course materials and confirm your assignment submissions.
              </p>
            </section>

            {/* Overall Progress */}
            {studentAssignments.length > 0 && (
              <StudentProgress
                submittedCount={submittedCount}
                totalCount={studentAssignments.length}
              />
            )}

            {/* Assignments Section with Filter & Sort Controls */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                  Your Assignments ({visibleAssignments.length})
                </h3>

                {studentAssignments.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Filter Tabs */}
                    <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900 text-xs">
                      <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-md font-medium transition ${
                          statusFilter === 'all'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter('pending')}
                        className={`px-2.5 py-1 rounded-md font-medium transition ${
                          statusFilter === 'pending'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Pending ({pendingCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter('submitted')}
                        className={`px-2.5 py-1 rounded-md font-medium transition ${
                          statusFilter === 'submitted'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Submitted ({submittedCount})
                      </button>
                    </div>

                    {/* Due Date Sort */}
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      aria-label="Sort assignments by due date"
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <option value="asc">Due Date: Soonest first</option>
                      <option value="desc">Due Date: Latest first</option>
                    </select>
                  </div>
                )}
              </div>

              {studentAssignments.length === 0 ? (
                <EmptyState
                  title="No assignments yet"
                  description="You're all caught up! No assignments have been assigned to you."
                />
              ) : visibleAssignments.length === 0 ? (
                <EmptyState
                  title="No matching assignments"
                  description="No assignments match the selected filter."
                  actionLabel="Show all assignments"
                  onAction={() => setStatusFilter('all')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleAssignments.map((assignment) => (
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
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to mark this assignment as submitted? This cannot be undone.
          </p>

          {assignmentToSubmit && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {assignmentToSubmit.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Due: {formatDate(assignmentToSubmit.dueDate)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleCloseSubmitModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {isSubmitting ? 'Confirming...' : 'Yes, Confirm Submission'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
