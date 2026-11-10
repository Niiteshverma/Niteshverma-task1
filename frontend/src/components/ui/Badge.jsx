// Reusable Badge component with semantic status color palettes and optional indicator dot

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  // Normalize string variant or status
  const normalizedVariant = String(variant).toLowerCase().trim()

  // Map known statuses or role strings to semantic color variants
  let resolvedVariant = 'neutral'
  if (['success', 'acknowledged', 'submitted'].includes(normalizedVariant)) {
    resolvedVariant = 'success'
  } else if (['warning', 'due soon', 'pending'].includes(normalizedVariant)) {
    resolvedVariant = 'warning'
  } else if (['danger', 'overdue', 'error'].includes(normalizedVariant)) {
    resolvedVariant = 'danger'
  } else if (['info', 'individual', 'student', 'primary'].includes(normalizedVariant)) {
    resolvedVariant = 'info'
  } else if (['group', 'professor', 'leader', 'neutral'].includes(normalizedVariant)) {
    resolvedVariant = 'purple'
  }

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-indigo-500',
    purple: 'bg-purple-500',
    neutral: 'bg-slate-500',
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${
        variantStyles[resolvedVariant] || variantStyles.neutral
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotColors[resolvedVariant] || dotColors.neutral
          }`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
