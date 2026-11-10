// Context providing a lightweight toast notification queue and helper function
import { createContext, useContext, useState, useCallback } from 'react'
import { TOAST_DURATION } from '../utils/constants'
import Toast from '../components/ui/Toast'

export const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = crypto.randomUUID()
      const newToast = { id, message, type }

      setToasts((prev) => [...prev, newToast])

      // Auto dismiss after specified duration
      setTimeout(() => {
        dismissToast(id)
      }, TOAST_DURATION)

      return id
    },
    [dismissToast]
  )

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

