// Reusable animated progress bar with accessible ARIA attributes and zero-division protection
import { getPercentage } from '../../utils/helpers'

export default function ProgressBar({
  value = 0,
  max = 100,
  showLabel = false,
  size = 'md',
  className = '',
}) {
  const percentage = getPercentage(value, max)

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Completion</span>
          <span>{percentage}%</span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full bg-slate-100 rounded-full overflow-hidden ${
          heightStyles[size] || heightStyles.md
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

