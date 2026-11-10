// Course Assignments page for both student and professor roles
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import AssignmentCard from '../components/student/AssignmentCard'
import GroupPanel from '../components/student/GroupPanel'
import AssignmentForm from '../components/professor/AssignmentForm'
import AssignmentTracking from '../components/professor/AssignmentTracking'
import ProgressBar from '../components/ui/ProgressBar'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { LOADING_DELAY, ROLES, SUBMISSION_TYPE } from '../utils/constants'
import { formatDateTime, isValidUrl, getPercentage } from '../utils/helpers'

export default function CourseAssignmentsPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const {
    getCourseById,
    getUserById,
    getAssignmentsForCourse,
    getGroupForStudent,
    getGroupsForCourse,
    getAcknowledgement,
    getAcknowledgementsForAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  } = useData()
  const { showToast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState(null)
  const [trackingAssignment, setTrackingAssignment] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filters and search states (Phase 10)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'individual' | 'group'
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pending' | 'acknowledged'

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, LOADING_DELAY)
    return () => clearTimeout(timer)
  }, [courseId])

  const course = getCourseById(courseId)
  const isProfessor = currentUser?.role === ROLES.PROFESSOR

  // Role-based course permission check:
  // - Professor must teach the course (course.professorId === currentUser.id)
  // - Student must be enrolled in course.studentIds
  const isAuthorized = isProfessor
    ? Boolean(course && currentUser && course.professorId === currentUser.id)
    : Boolean(course && course.studentIds && currentUser && course.studentIds.includes(currentUser.id))

  const professor = course?.professorId ? getUserById(course.professorId) : null
  const assignments = course ? getAssignmentsForCourse(course.id) : []
  const studentGroup =
    !isProfessor && currentUser ? getGroupForStudent(courseId, currentUser.id) : null

  // Filter assignments by search query, submission type, and acknowledgement status
  const filteredAssignments = assignments.filter((assignment) => {
    // 1. Search Query (title or description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const matchesTitle = assignment.title.toLowerCase().includes(query)
      const matchesDesc = assignment.description
        ? assignment.description.toLowerCase().includes(query)
        : false
      if (!matchesTitle && !matchesDesc) return false
    }

    // 2. Type Filter (individual / group)
    if (typeFilter !== 'all' && assignment.submissionType !== typeFilter) {
      return false
    }

    // 3. Status Filter (acknowledged / pending)
    if (statusFilter !== 'all') {
      let isAck = false
      if (isProfessor) {
        const acks = getAcknowledgementsForAssignment(assignment.id)
        isAck = acks.length > 0
      } else {
        const ack =
          assignment.submissionType === 'group'
            ? studentGroup
              ? getAcknowledgement(assignment.id, null, studentGroup.id)
              : null
            : getAcknowledgement(assignment.id, currentUser?.id, null)
        isAck = Boolean(ack)
      }

      if (statusFilter === 'acknowledged' && !isAck) return false
      if (statusFilter === 'pending' && isAck) return false
    }

    return true
  })

  const handleResetFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  // Handler: Open modal for creating a new assignment
  const handleOpenCreateModal = () => {
    setEditingAssignment(null)
    setIsAssignmentModalOpen(true)
  }

  // Handler: Open modal for editing an existing assignment
  const handleOpenEditModal = (assignment) => {
    setEditingAssignment(assignment)
    setIsAssignmentModalOpen(true)
  }

  // Handler: Submit create/edit assignment
  const handleAssignmentFormSubmit = (payload) => {
    setIsSubmitting(true)
    if (editingAssignment) {
      updateAssignment(editingAssignment.id, payload)
      showToast('Assignment updated successfully!', 'success')
    } else {
      createAssignment({
        courseId,
        ...payload,
      })
      showToast('Assignment published successfully!', 'success')
    }
    setIsSubmitting(false)
    setIsAssignmentModalOpen(false)
    setEditingAssignment(null)
  }

  // Handler: Trigger delete confirmation dialog
  const handlePromptDelete = (assignment) => {
    setAssignmentToDelete(assignment)
    setIsDeleteConfirmOpen(true)
  }

  // Handler: Confirm delete assignment
  const handleConfirmDelete = () => {
    if (!assignmentToDelete) return
    setIsSubmitting(true)
    deleteAssignment(assignmentToDelete.id)
    setIsSubmitting(false)
    setIsDeleteConfirmOpen(false)
    showToast(`Assignment "${assignmentToDelete.title}" deleted successfully!`, 'success')
    setAssignmentToDelete(null)
  }

  // If course does not exist or user lacks permission
  if (!isLoading && (!course || !isAuthorized)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
          <EmptyState
            title="Course Not Found or Access Denied"
            description="You do not have permission to view this course, or it does not exist. Please return to your dashboard."
            actionLabel="Return to Dashboard"
            onAction={() => navigate(isProfessor ? '/professor' : '/student')}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          backTo={isProfessor ? '/professor' : '/student'}
          backLabel={isProfessor ? 'My Courses' : 'All Courses'}
          title={course ? course.name : 'Course Assignments'}
          subtitle={
            isProfessor
              ? `Course Code: ${course?.code} • ${course?.studentIds?.length || 0} Students Enrolled`
              : professor
              ? `Taught by ${professor.name} • Code: ${course.code}`
              : `Course Code: ${course?.code}`
          }
          badge={
            <Badge variant="purple" size="sm">
              {course?.code}
            </Badge>
          }
          action={
            isProfessor ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto"
              >
                + Create Assignment
              </Button>
            ) : null
          }
        />

        {isLoading ? (
          <div className="py-16">
            <Loader message="Loading coursework and assignments..." size="md" />
          </div>
        ) : (
          <>
            {/* Student Group Workspace Panel (Students only) */}
            {!isProfessor && <GroupPanel courseId={courseId} />}

            {/* Assignments Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Assignments ({assignments.length})
                </h2>
              </div>

              {/* Filters & Search Control Bar */}
              {assignments.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-6">
                      <Input
                        id="assignment-search"
                        placeholder="Search assignments by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <Select
                        id="assignment-type-filter"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        options={[
                          { value: 'all', label: 'All Types' },
                          { value: SUBMISSION_TYPE.INDIVIDUAL, label: 'Individual Only' },
                          { value: SUBMISSION_TYPE.GROUP, label: 'Group Only' },
                        ]}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <Select
                        id="assignment-status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={[
                          { value: 'all', label: 'All Statuses' },
                          { value: 'pending', label: 'Pending Only' },
                          { value: 'acknowledged', label: 'Acknowledged Only' },
                        ]}
                      />
                    </div>
                  </div>

                  {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium">
                        Showing {filteredAssignments.length} of {assignments.length} assignments
                      </span>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition underline cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              )}

              {assignments.length === 0 ? (
                <EmptyState
                  title="No assignments posted"
                  description={
                    isProfessor
                      ? 'You have not created any assignments for this course yet. Click below to publish your first assignment.'
                      : 'Your instructor has not created any assignments for this course yet. Check back soon.'
                  }
                  actionLabel={isProfessor ? '+ Create Assignment' : undefined}
                  onAction={isProfessor ? handleOpenCreateModal : undefined}
                />
              ) : filteredAssignments.length === 0 ? (
                <EmptyState
                  title="No assignments match your filters"
                  description="Try clearing your search query or changing your filter criteria."
                  actionLabel="Reset Filters"
                  onAction={handleResetFilters}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredAssignments.map((assignment) => {
                    if (isProfessor) {
                      const isGroup = assignment.submissionType === SUBMISSION_TYPE.GROUP
                      const hasLink = isValidUrl(assignment.oneDriveLink)
                      const acks = getAcknowledgementsForAssignment(assignment.id)
                      const totalExpected = isGroup
                        ? getGroupsForCourse(course.id).length
                        : course.studentIds?.length || 0
                      const ackCount = acks.length
                      const percentage = getPercentage(ackCount, totalExpected)

                      return (
                        <Card
                          key={assignment.id}
                          className="flex flex-col justify-between space-y-4 text-left border-slate-200"
                        >
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <Badge variant={isGroup ? 'purple' : 'info'} size="sm">
                                {isGroup ? 'Group Submission' : 'Individual'}
                              </Badge>
                              <span className="text-xs text-slate-500 font-medium">
                                Created {formatDateTime(assignment.createdAt)}
                              </span>
                            </div>

                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                                {assignment.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                                {assignment.description || 'No instructions provided.'}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <svg
                                  className="w-4 h-4 text-slate-400 shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>
                                  Due:{' '}
                                  <span className="font-semibold text-slate-800">
                                    {formatDateTime(assignment.deadline)}
                                  </span>
                                </span>
                              </div>

                              {hasLink && (
                                <a
                                  href={assignment.oneDriveLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition"
                                >
                                  <span>OneDrive Link</span>
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              )}
                            </div>

                            {/* Submissions Progress Indicator */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Submissions</span>
                                <span className="font-semibold text-slate-800">
                                  {ackCount} / {totalExpected} {isGroup ? 'groups' : 'students'} ({percentage}%)
                                </span>
                              </div>
                              <ProgressBar value={ackCount} max={totalExpected} size="sm" />
                            </div>

                            {/* Professor action buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={() => setTrackingAssignment(assignment)}
                                className="text-xs"
                              >
                                Track Submissions
                              </Button>

                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleOpenEditModal(assignment)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handlePromptDelete(assignment)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    }

                    // Student card rendering
                    const ack =
                      assignment.submissionType === 'group'
                        ? studentGroup
                          ? getAcknowledgement(assignment.id, null, studentGroup.id)
                          : null
                        : getAcknowledgement(assignment.id, currentUser?.id, null)

                    return (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        acknowledgement={ack}
                        studentGroup={studentGroup}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Create / Edit Assignment Modal */}
      {isProfessor && (
        <Modal
          isOpen={isAssignmentModalOpen}
          onClose={() => {
            if (!isSubmitting) {
              setIsAssignmentModalOpen(false)
              setEditingAssignment(null)
            }
          }}
          title={editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
        >
          <AssignmentForm
            initialData={editingAssignment}
            onSubmit={handleAssignmentFormSubmit}
            onCancel={() => {
              setIsAssignmentModalOpen(false)
              setEditingAssignment(null)
            }}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}

      {/* Delete Assignment ConfirmDialog */}
      {isProfessor && (
        <ConfirmDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => !isSubmitting && setIsDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Assignment"
          message={`Are you sure you want to delete "${assignmentToDelete?.title}"? All student acknowledgements and submissions for this assignment will also be permanently removed. This action cannot be undone.`}
          confirmText="Delete Assignment"
          cancelText="Cancel"
          variant="danger"
          isLoading={isSubmitting}
        />
      )}

      {/* Submission Tracking Drill-Down Modal */}
      {isProfessor && (
        <Modal
          isOpen={Boolean(trackingAssignment)}
          onClose={() => setTrackingAssignment(null)}
          title={trackingAssignment ? `Track: ${trackingAssignment.title}` : 'Track Submissions'}
          maxWidth="max-w-3xl"
        >
          {trackingAssignment && (
            <AssignmentTracking
              assignment={trackingAssignment}
              course={course}
            />
          )}
        </Modal>
      )}
    </div>
  )
}
