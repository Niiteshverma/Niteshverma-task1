// Reusable Card container component with clean borders, shadow, and optional hover elevation

export default function Card({
  children,
  hoverable = false,
  className = '',
  onClick,
  ...props
}) {
  const hoverStyles = hoverable
    ? 'hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer'
    : 'transition-shadow duration-200'

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

