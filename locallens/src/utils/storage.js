// ── Safe sessionStorage helpers ───────────────────────────────────────────────
// sessionStorage can be unavailable in:
//   - Safari private browsing
//   - Some storage-quota-exceeded states
//   - Certain browser security policies
// All access is wrapped in try/catch so the app never crashes on storage errors.

/**
 * Safely write a value to sessionStorage as JSON.
 * @param {string} key
 * @param {*} value — must be JSON-serialisable
 * @returns {boolean} true if saved successfully
 */
export function safeSave(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Safely read and parse a JSON value from sessionStorage.
 * @param {string} key
 * @returns {*|null} parsed value, or null if missing/invalid/unavailable
 */
export function safeLoad(key) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
