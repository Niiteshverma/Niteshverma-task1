import ProgressBar from '../common/ProgressBar'
import { getPercentage } from '../../utils/helpers'
import { STATUS } from '../../utils/constants'

export default function StudentStatusList({
  assignedStudentIds = [],
  assignmentId,
  allStudents = [],
  getStudentSubmission,
}) {
  const totalAssigned = assignedStudentIds.length

  // Students enrolled in this assignment
  const assignedStudents = allStudents.filter((student) =>
    assignedStudentIds.includes(student.id)
  )

  // Count how many assigned students have submitted
  const submittedCount = assignedStudents.filter((student) => {
    const submission = getStudentSubmission(assignmentId, student.id)
    return submission?.status === STATUS.SUBMITTED
  }).length

  const completionPercentage = getPercentage(submittedCount, totalAssigned)

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      {/* Progress summary */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Class Completion</span>
          <span className="font-medium text-slate-600 dark:text-slate-400">
            {submittedCount} of {totalAssigned} submitted ({completionPercentage}%)
          </span>
        </div>
        <ProgressBar value={submittedCount} max={totalAssigned} />
      </div>

      {/* Student list */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {assignedStudents.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No students assigned.</p>
        ) : (
          assignedStudents.map((student) => {
            const submission = getStudentSubmission(assignmentId, student.id)
            const isSubmitted = submission?.status === STATUS.SUBMITTED

            return (
              <div
                key={student.id}
                className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
              >
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate mr-2">
                  {student.name}
                </span>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-medium ${
                    isSubmitted
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                  }`}
                >
                  <span className="mr-1" aria-hidden="true">
                    {isSubmitted ? '✓' : '○'}
                  </span>
                  {isSubmitted ? STATUS.SUBMITTED : STATUS.NOT_SUBMITTED}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
