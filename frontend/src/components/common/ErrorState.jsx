export default function ErrorState({ message, onReset }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/60 p-8 shadow-sm max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Storage Error Detected
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {message || 'Unable to read your saved data. The local storage may be corrupted.'}
          </p>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="w-full py-2.5 px-4 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition"
          >
            Reset data to defaults
          </button>
        )}
      </div>
    </div>
  )
}
