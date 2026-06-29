// ── Location Service ──────────────────────────────────────────────────────────
// Wraps the Geolocation API with a clean promise interface,
// sensible timeouts, and informative error messages.
//
// PRODUCTION NOTE: navigator.geolocation is blocked by browsers on HTTP.
// Vercel/Netlify provide HTTPS automatically. If using a custom domain,
// ensure HTTPS is enforced before going live.

/**
 * Warn in dev/staging if running on HTTP (geolocation will silently fail).
 */
function warnIfInsecure() {
  if (
    typeof window !== 'undefined' &&
    window.location.protocol !== 'https:' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    console.warn(
      '[LocalLens] navigator.geolocation requires HTTPS in production. ' +
      'GPS will be silently blocked on this page because it is served over HTTP.'
    )
  }
}

const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 60_000, // Cache position for 1 minute
}

/**
 * Get current GPS position once.
 * @returns {Promise<{lat: number, lon: number, accuracy: number}>}
 */
export function getCurrentLocation() {
  warnIfInsecure()

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      (err) => {
        const messages = {
          1: 'Location access was denied. Please allow location in your browser settings.',
          2: 'Location unavailable. Check your device settings.',
          3: 'Location request timed out. Please try again.',
        }
        reject(new Error(messages[err.code] || 'Location error.'))
      },
      GEO_OPTIONS
    )
  })
}

/**
 * Watch location changes continuously — returns a cleanup function.
 * Uses lower accuracy + longer cache for battery efficiency.
 * @param {function({lat, lon, accuracy}): void} onUpdate
 * @param {function(Error): void} onError
 * @returns {function(): void} cleanup — call to stop watching
 */
export function watchLocation(onUpdate, onError) {
  warnIfInsecure()

  if (!navigator.geolocation) {
    onError(new Error('Geolocation not supported.'))
    return () => {}
  }

  const id = navigator.geolocation.watchPosition(
    (pos) =>
      onUpdate({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
    (err) => onError(new Error(err.message)),
    {
      enableHighAccuracy: false, // battery-friendly for background watching
      timeout: 15_000,
      maximumAge: 30_000,
    }
  )

  return () => navigator.geolocation.clearWatch(id)
}
