// Simulated JWT-style session utilities (NOTE: This is client-side simulation for mock purposes, not secure)

const ONE_HOUR_MS = 60 * 60 * 1000

// Creates a base64 encoded token with user credentials and expiration timestamp
export function createToken(user) {
  if (!user || !user.id || !user.role) return null

  const payload = {
    userId: user.id,
    role: user.role,
    expiresAt: Date.now() + ONE_HOUR_MS,
  }

  try {
    return btoa(JSON.stringify(payload))
  } catch {
    return null
  }
}

// Decodes and parses a base64 token safely
export function parseToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const json = atob(token)
    const payload = JSON.parse(json)
    if (payload && payload.userId && payload.role && payload.expiresAt) {
      return payload
    }
  } catch {
    // Malformed token
  }
  return null
}

// Checks if the token has expired
export function isTokenExpired(token) {
  const payload = parseToken(token)
  if (!payload) return true
  return payload.expiresAt <= Date.now()
}

// Validates active session: token must be valid, not expired, and match a registered user
export function validateSession(session, users = []) {
  if (!session || typeof session !== 'object') return null
  if (!session.token || !session.user || typeof session.user !== 'object') return null

  const payload = parseToken(session.token)
  if (!payload) return null
  if (payload.expiresAt <= Date.now()) return null

  // Ensure user still exists in the system with the same id and role
  const user = users.find((u) => u.id === payload.userId && u.role === payload.role)
  if (!user) return null

  return user
}

