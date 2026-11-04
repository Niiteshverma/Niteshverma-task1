export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 space-y-3">
      <div
        className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  )
}
