export default function ProgressBar({ value = 0, max = 0, className = '' }) {
  // Prevent division by zero and clamp percentage between 0 and 100
  const percentage = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0

  return (
    <div className={`w-full ${className}`}>
      <div
        className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Progress bar"
      >
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

