// ── Nominatim Service ─────────────────────────────────────────────────────────
// Geocoding via OpenStreetMap Nominatim.
// Policy: max 1 request/second, must include descriptive User-Agent.
// https://operations.osmfoundation.org/policies/nominatim/

const BASE = 'https://nominatim.openstreetmap.org'

// User-Agent: falls back to env var, then to a sensible default.
// After deploying, set VITE_NOMINATIM_USER_AGENT in Vercel/Netlify dashboard.
const USER_AGENT =
  import.meta.env.VITE_NOMINATIM_USER_AGENT ||
  'LocalLens/1.0 (https://github.com/locallens)'

const HEADERS = {
  'Accept': 'application/json',
  'Accept-Language': 'en',
  'User-Agent': USER_AGENT,
}

/**
 * Forward geocode: place name → coordinates (up to 8 results).
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function geocode(query) {
  if (!query?.trim()) throw new Error('Search query cannot be empty.')

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: '8',
    addressdetails: '1',
  })

  const res = await fetch(`${BASE}/search?${params}`, { headers: HEADERS })
  if (!res.ok) throw new Error(`Nominatim search failed (${res.status})`)

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No results found for "${query}". Try a different name or be more specific.`)
  }

  return data.map((item) => {
    const addr = item.address || {}

    // Build a meaningful label: most specific address component first,
    // then fall back to broader ones. This ensures "HSR Layout" shows as
    // "HSR Layout" rather than collapsing to "Bengaluru".
    const specificName =
      item.name ||                          // exact OSM name of the result
      addr.neighbourhood ||
      addr.suburb ||
      addr.quarter ||
      addr.hamlet ||
      addr.village ||
      addr.town ||
      addr.city ||
      addr.county ||
      item.display_name.split(',')[0]

    // For the controls bar label use the same specific name
    const shortName = specificName

    return {
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name,
      shortName,
      type: item.type,
      boundingbox: item.boundingbox?.map(parseFloat),
      importance: item.importance,
    }
  })
}

/**
 * Reverse geocode: coordinates → city/state/country.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{displayName, city, state, country}>}
 */
export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'json',
    addressdetails: '1',
  })

  const res = await fetch(`${BASE}/reverse?${params}`, { headers: HEADERS })
  if (!res.ok) throw new Error(`Reverse geocode failed (${res.status})`)

  const data = await res.json()
  const addr = data.address || {}

  return {
    displayName: data.display_name,
    city:
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.county ||
      'Your Area',
    state: addr.state || '',
    country: addr.country || '',
  }
}
