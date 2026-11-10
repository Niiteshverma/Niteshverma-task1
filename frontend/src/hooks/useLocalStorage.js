// Custom hook that syncs state with localStorage and listens to changes across tabs
import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue, onError) {
  // Read saved value on mount with fallback to initialValue
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) {
        return JSON.parse(saved)
      }
    } catch (error) {
      if (onError) onError(error)
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      if (onError) onError(error)
    }
  }, [key, value, onError])

  // Sync state if localStorage is changed in another browser tab
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setValue(JSON.parse(event.newValue))
        } catch {
          // Ignore parse errors from other tabs
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [value, setValue]
}
