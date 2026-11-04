import ProgressBar from '../common/ProgressBar'

export default function StudentProgress({ submittedCount = 0, totalCount = 0 }) {
  const percentage = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Submission Progress
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {submittedCount} of {totalCount} assignments submitted
          </p>
        </div>
        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
          {percentage}%
        </span>
      </div>

      <ProgressBar value={submittedCount} max={totalCount} />
    </div>
  )
}

