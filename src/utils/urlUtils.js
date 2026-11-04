/**
 * Validates that a string is a secure web URL (http or https protocol).
 * Explicitly rejects javascript:, data:, file:, and other unsafe protocols.
 */
export function isValidHttpUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false
  const trimmed = urlString.trim()
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false
  }
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

