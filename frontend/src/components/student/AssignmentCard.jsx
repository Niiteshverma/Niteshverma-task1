// Card component rendering assignment details, readable deadline, OneDrive link, and status indicators
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatDateTime, isOverdue, isDueSoon, isValidUrl } from '../../utils/helpers'
import { SUBMISSION_TYPE } from '../../utils/constants'

export default function AssignmentCard({
  assignment,
  acknowledgement,
  studentGroup,
  children,
}) {
  const isAcknowledged = Boolean(acknowledgement)
  const isGroupSubmission = assignment.submissionType === SUBMISSION_TYPE.GROUP
  const overdue = !isAcknowledged && isOverdue(assignment.deadline)
  const dueSoon = !isAcknowledged && isDueSoon(assignment.deadline)
  const hasValidLink = isValidUrl(assignment.oneDriveLink)

  return (
    <Card
      className={`flex flex-col justify-between space-y-4 text-left transition-all ${
        overdue
          ? 'border-rose-300 bg-rose-50/10 shadow-rose-100/50'
          : 'border-slate-200'
      }`}
    >
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant={isGroupSubmission ? 'purple' : 'info'} size="sm">
            {isGroupSubmission ? 'Group Submission' : 'Individual'}
          </Badge>

          <div className="flex items-center gap-1.5">
            {isAcknowledged ? (
              <Badge variant="success" size="sm" dot>
                Acknowledged
              </Badge>
            ) : overdue ? (
              <Badge variant="danger" size="sm" dot>
                Overdue
              </Badge>
            ) : dueSoon ? (
              <Badge variant="warning" size="sm" dot>
                Due soon
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                Pending
              </Badge>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {assignment.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
            {assignment.description || 'No instructions provided.'}
          </p>
        </div>
      </div>

      {/* Meta details & external resources */}
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
              Deadline:{' '}
              <span
                className={`font-semibold ${
                  overdue ? 'text-rose-600' : 'text-slate-800'
                }`}
              >
                {formatDateTime(assignment.deadline)}
              </span>
            </span>
          </div>

          {hasValidLink && (
            <a
              href={assignment.oneDriveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition"
            >
              <span>OneDrive Materials</span>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>

        {/* Action / acknowledgement slots (extended in Phase 5 and 7) */}
        {children}
      </div>
    </Card>
  )
}
