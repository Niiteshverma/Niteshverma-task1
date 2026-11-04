import ProgressBar from '../common/ProgressBar'

export default function StudentStatusList({
  assignedStudentIds = [],
  assignmentId,
  allStudents = [],
  getStudentSubmission,
}) {
  const totalAssigned = assignedStudentIds.length

  // Filter students who are assigned to this assignment
  const assignedStudents = allStudents.filter((student) =>
    assignedStudentIds.includes(student.id)
  )

  // Count how many assigned students have submitted
  const submittedCount = assignedStudents.filter((student) => {
    const submission = getStudentSubmission(assignmentId, student.id)
    return submission?.status === 'Submitted'
  }).length

  // Calculate percentage safely avoiding division by zero
  const completionPercentage = totalAssigned > 0
    ? Math.round((submittedCount / totalAssigned) * 100)
    : 0

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      {/* Class Completion Progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700">Class Completion</span>
          <span className="font-medium text-slate-600">
            {submittedCount} of {totalAssigned} students submitted ({completionPercentage}%)
          </span>
        </div>
        <ProgressBar value={submittedCount} max={totalAssigned} />
      </div>

      {/* Student List & Status Badges */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {assignedStudents.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No students assigned.</p>
        ) : (
          assignedStudents.map((student) => {
            const submission = getStudentSubmission(assignmentId, student.id)
            const isSubmitted = submission?.status === 'Submitted'

            return (
              <div
                key={student.id}
                className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 border border-slate-100"
              >
                <span className="text-slate-700 font-medium truncate mr-2">
                  {student.name}
                </span>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-medium ${
                    isSubmitted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isSubmitted ? 'Submitted' : 'Not submitted'}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
