// Shared helper functions for date formatting, validation, and calculations

// Formats an ISO string into a readable date and time string: "Nov 25, 2026, 11:59 PM"
export function formatDateTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// Formats an ISO string into a readable date: "Nov 25, 2026"
export function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Returns today's date in YYYY-MM-DD format
export function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Checks if a deadline has already passed
export function isOverdue(deadlineIso) {
  if (!deadlineIso) return false
  const deadlineTime = new Date(deadlineIso).getTime()
  if (isNaN(deadlineTime)) return false
  return deadlineTime < Date.now()
}

// Checks if a deadline is due within the next 24 hours
export function isDueSoon(deadlineIso) {
  if (!deadlineIso) return false
  const deadlineTime = new Date(deadlineIso).getTime()
  if (isNaN(deadlineTime)) return false

  const now = Date.now()
  const diff = deadlineTime - now
  const oneDayMs = 24 * 60 * 60 * 1000

  return diff > 0 && diff <= oneDayMs
}

// Validates whether a string is a valid web URL starting with http:// or https://
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Calculates percentage clamped safely between 0 and 100 without NaN
export function getPercentage(count, total) {
  if (!total || total <= 0 || isNaN(total)) return 0
  const pct = Math.round((count / total) * 100)
  return Math.min(Math.max(pct, 0), 100)
}

// Converts an ISO date string or Date object to YYYY-MM-DDTHH:mm for datetime-local input
export function toDatetimeLocal(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
