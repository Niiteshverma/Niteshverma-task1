import { useState, useEffect } from 'react'

/**
 * Custom hook to synchronize state with localStorage.
 * - Reads on load with fallback to initialValue if empty or corrupted.
 * - Saves on state change.
 * - Listens for external changes across browser tabs.
 */
export function useLocalStorage(key, initialValue, onError) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      if (item !== null) {
        return JSON.parse(item)
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      if (onError) onError(error)
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  // Synchronize state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error)
      if (onError) onError(error)
    }
  }, [key, value, onError])

  // Multi-tab synchronization: listen for changes made in other tabs
  useEffect(() => {
    const handleStorageEvent = (event) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setValue(JSON.parse(event.newValue))
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageEvent)
    return () => window.removeEventListener('storage', handleStorageEvent)
  }, [key])

  return [value, setValue]
}
