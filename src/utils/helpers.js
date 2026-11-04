// Reusable helper functions for date formatting, validation, and percentage calculations

// Convert YYYY-MM-DD into a human-readable date, e.g. "Oct 15, 2026"
export function formatDate(dateString) {
  if (!dateString) return 'No due date'
  const parts = dateString.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return dateString

  const [year, month, day] = parts
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Return today's date formatted as YYYY-MM-DD
export function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// An assignment is overdue only if due date has passed and it is not submitted
export function isOverdue(dueDate, isSubmitted) {
  if (isSubmitted || !dueDate) return false
  return dueDate < getTodayDate()
}

// Safe completion percentage (returns 0 if total is 0 to avoid NaN)
export function getPercentage(value, total) {
  if (!total || total <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)))
}

// Check that a URL is a valid web link starting with http:// or https://
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false
  }
  try {
    new URL(trimmed)
    return true
  } catch {
    return false
  }
}

