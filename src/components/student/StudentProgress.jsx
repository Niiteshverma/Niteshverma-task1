import ProgressBar from '../common/ProgressBar'
import { getPercentage } from '../../utils/helpers'

export default function StudentProgress({ submittedCount = 0, totalCount = 0 }) {
  const percentage = getPercentage(submittedCount, totalCount)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Submission Progress
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {submittedCount} of {totalCount} assignments submitted
          </p>
        </div>
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
          {percentage}%
        </span>
      </div>

      <ProgressBar value={submittedCount} max={totalCount} />
    </div>
  )
}
