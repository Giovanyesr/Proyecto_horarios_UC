/**
 * Client-side JWT utilities.
 * Tokens are signed (HS256) on the backend — we only PARSE here, never verify the
 * signature client-side (that would be insecure).  We use the decoded payload only
 * for UX decisions like showing a "session expiring" warning or redirecting on expiry.
 */

interface JwtPayload {
  sub: string
  role: string
  iat: number
  exp: number
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

/** Returns true when the token is expired or malformed. */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  const payload = decodePayload(token)
  if (!payload?.exp) return true
  // Allow 30s clock skew
  return Date.now() >= (payload.exp - 30) * 1000
}

/** Returns the expiry timestamp in milliseconds (or 0 if malformed). */
export function getTokenExpiresAt(token: string | null): number {
  if (!token) return 0
  const payload = decodePayload(token)
  return payload?.exp ? payload.exp * 1000 : 0
}

/** Returns milliseconds until expiry (negative if already expired). */
export function msUntilExpiry(token: string | null): number {
  const exp = getTokenExpiresAt(token)
  return exp ? exp - Date.now() : -1
}

/** Returns the role embedded in the token payload. */
export function getTokenRole(token: string | null): string | null {
  if (!token) return null
  return decodePayload(token)?.role ?? null
}

/**
 * Sanitize a user-supplied string: trim whitespace and strip HTML tags
 * to prevent stored XSS if inputs ever reach rendered HTML directly.
 */
export function sanitizeInput(value: string): string {
  return value.trim().replace(/<[^>]*>/g, '')
}
