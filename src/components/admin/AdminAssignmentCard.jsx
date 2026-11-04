import StudentStatusList from './StudentStatusList'
import { formatDueDate } from '../../utils/dateUtils'
import { isValidHttpUrl } from '../../utils/urlUtils'

export default function AdminAssignmentCard({
  assignment,
  allStudents = [],
  getStudentSubmission,
  onEdit,
  onDelete,
}) {
  const assignedCount = assignment.assignedTo ? assignment.assignedTo.length : 0
  const isAllStudents = assignedCount === allStudents.length
  const hasValidDriveLink = isValidHttpUrl(assignment.driveLink)

  return (
    <article className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between space-y-4 overflow-hidden break-words">
      <div className="space-y-3">
        {/* Title & Scope Badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base leading-snug break-words">
            {assignment.title}
          </h3>
          <span className="shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
            {isAllStudents ? 'All students' : `${assignedCount} students`}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 break-words">
          {assignment.description || 'No description provided.'}
        </p>

        {/* Due Date & Drive Link */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2">
          <div className="text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Due: </span>
            {formatDueDate(assignment.dueDate)}
          </div>

          {hasValidDriveLink && (
            <a
              href={assignment.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
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
      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onEdit(assignment)}
          className="px-3 py-1.5 min-h-[36px] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(assignment)}
          className="px-3 py-1.5 min-h-[36px] text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition"
        >
          Delete
        </button>
      </div>
    </article>
  )
}
