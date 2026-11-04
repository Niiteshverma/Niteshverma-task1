export default function AssignmentCard({ assignment, submission }) {
  const isSubmitted = submission?.status === 'Submitted'

  // Format date nicely (e.g. "Oct 15, 2026")
  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date'
    // Split YYYY-MM-DD to avoid timezone shifting
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

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-slate-800 text-base leading-snug">
            {assignment.title}
          </h3>
          <span
            className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isSubmitted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isSubmitted ? 'Submitted' : 'Not submitted'}
          </span>
        </div>

        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
          {assignment.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
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
    </article>
  )
}
