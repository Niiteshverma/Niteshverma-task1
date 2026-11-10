// Reusable multi-line Textarea component with built-in label and accessible error alert

export default function Textarea({
  id,
  name,
  label,
  error,
  rows = 3,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const textareaId = id || name

  return (
    <div className="space-y-1 text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold text-slate-700 select-none"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        name={name || id}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
          error
            ? 'border-red-400 bg-red-50/20 focus:ring-red-500 focus:border-red-500'
            : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      />

      {error && (
        <p
          id={`${textareaId}-error`}
          role="alert"
          className="text-xs text-red-600 font-medium mt-1"
        >
          {error}
        </p>
      )}
    </div>
  )
}

