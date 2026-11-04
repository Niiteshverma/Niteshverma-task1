import { useState, useEffect } from 'react'

/**
 * Custom hook to synchronize state with localStorage.
 * Falls back to initialValue if localStorage is empty or corrupted.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      if (item !== null) {
        return JSON.parse(item)
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error)
    }
  }, [key, value])

  return [value, setValue]
}
