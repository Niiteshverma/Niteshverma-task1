// Reusable PageHeader component with breadcrumb/back navigation, titles, badges, and action slots
import { useNavigate } from 'react-router-dom'

export default function PageHeader({
  title,
  subtitle,
  badge,
  action,
  backTo,
  backLabel = 'Back',
  className = '',
}) {
  const navigate = useNavigate()

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 ${className}`}
    >
      <div className="space-y-1">
        {backTo && (
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition gap-1 mb-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {backLabel}
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {badge}
        </div>

        {subtitle && (
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  )
}
