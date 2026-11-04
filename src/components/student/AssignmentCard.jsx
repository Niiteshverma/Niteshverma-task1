import { formatDate, isOverdue, isValidUrl } from '../../utils/helpers'

export default function AssignmentCard({ assignment, submission, onSubmitClick }) {
  const isSubmitted = submission?.status === 'Submitted'
  const isAssignmentOverdue = isOverdue(assignment.dueDate, isSubmitted)
  const hasValidDriveLink = isValidUrl(assignment.driveLink)

  return (
    <article
      className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm transition flex flex-col justify-between overflow-hidden break-words ${
        isAssignmentOverdue
          ? 'border-red-300 dark:border-red-800/80 bg-red-50/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base leading-snug break-words">
            {assignment.title}
          </h3>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {isAssignmentOverdue && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                <span className="mr-1" aria-hidden="true">&#9888;</span> Overdue
              </span>
            )}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isSubmitted
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              <span className="mr-1" aria-hidden="true">
                {isSubmitted ? '✓' : '○'}
              </span>
              {isSubmitted ? 'Submitted' : 'Not submitted'}
            </span>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 break-words">
          {assignment.description}
        </p>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className={`${isAssignmentOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
            <span className="font-medium text-slate-700 dark:text-slate-300">Due: </span>
            {formatDate(assignment.dueDate)}
          </div>

          {hasValidDriveLink && (
            <a
              href={assignment.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              Open Materials
              <svg
                className="w-3.5 h-3.5 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>

        {/* Action Button: only visible if not submitted */}
        {!isSubmitted ? (
          <button
            type="button"
            onClick={() => onSubmitClick(assignment)}
            className="w-full mt-2 py-2.5 px-3 min-h-[40px] text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
          >
            Yes, I have submitted
          </button>
        ) : (
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center py-2 bg-emerald-50/50 dark:bg-emerald-950/30 rounded border border-emerald-100 dark:border-emerald-900/50">
            &#10003; Marked as submitted
          </div>
        )}
      </div>
    </article>
  )
}
