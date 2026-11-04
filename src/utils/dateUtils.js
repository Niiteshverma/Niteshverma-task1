/**
 * Utility functions for robust and timezone-safe date operations.
 */

// Format YYYY-MM-DD into a localized readable date (e.g. "Oct 15, 2026")
export function formatDueDate(dateString) {
  if (!dateString) return 'No due date'
  const parts = String(dateString).split('-')
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
  }
  return dateString
}

// Get today's local date as YYYY-MM-DD
export function getTodayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Determine if an assignment is overdue (unsubmitted and due date strictly before today)
export function isAssignmentOverdue(dueDate, isSubmitted) {
  if (isSubmitted || !dueDate) return false
  const todayStr = getTodayDateString()
  // Lexicographical comparison of YYYY-MM-DD is 100% timezone-safe
  return dueDate < todayStr
}

// Determine if an assignment is due today
export function isDueToday(dueDate) {
  if (!dueDate) return false
  return dueDate === getTodayDateString()
}

