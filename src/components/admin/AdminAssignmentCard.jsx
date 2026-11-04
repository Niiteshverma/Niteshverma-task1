import StudentStatusList from './StudentStatusList'

export default function AdminAssignmentCard({
  assignment,
  allStudents = [],
  getStudentSubmission,
  onEdit,
  onDelete,
}) {
  // Format readable due date (e.g. "Oct 15, 2026")
  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date'
    const parts = dateString.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      return new Date(year, month, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    return dateString
  }

  const assignedCount = assignment.assignedTo ? assignment.assignedTo.length : 0
  const isAllStudents = assignedCount === allStudents.length

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Title & Scope Badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-slate-800 text-base leading-snug">
            {assignment.title}
          </h3>
          <span className="shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
            {isAllStudents ? 'All students' : `${assignedCount} students`}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm line-clamp-3">
          {assignment.description || 'No description provided.'}
        </p>

        {/* Due Date & Drive Link */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2">
          <div className="text-slate-500">
            <span className="font-medium text-slate-700">Due: </span>
            {formatDueDate(assignment.dueDate)}
          </div>

          {assignment.driveLink && (
            <a
              href={assignment.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Drive Materials
              <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Student Submissions Tracking Section */}
      <StudentStatusList
        assignedStudentIds={assignment.assignedTo || []}
        assignmentId={assignment.id}
        allStudents={allStudents}
        getStudentSubmission={getStudentSubmission}
      />

      {/* Card Actions: Edit & Delete */}
      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onEdit(assignment)}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(assignment)}
          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition"
        >
          Delete
        </button>
      </div>
    </article>
  )
}
