// Reusable Loader component with accessible status announcement and animated spinner

export default function Loader({
  message = 'Loading...',
  size = 'md',
  className = '',
}) {
  const spinnerSizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center py-10 px-4 text-center ${className}`}
    >
      <div
        className={`${
          spinnerSizes[size] || spinnerSizes.md
        } border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-3`}
      />
      {message && (
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}
