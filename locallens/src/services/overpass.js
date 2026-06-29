// ── Overpass API Service ──────────────────────────────────────────────────────
// Fetches POI data from OpenStreetMap via Overpass API.
//
// ⚠️  KNOWN LIMITATION: Overpass is a volunteer-run OSM query service.
//     Coverage is excellent in Western Europe, patchy in Tier-2 Indian cities,
//     and often empty in smaller Indian towns. If this returns zero results
//     for your target cities, consider switching to:
//     - Google Places API (paid, excellent India coverage)
//     - HERE Places API (free tier available)
//     - Foursquare Places API (free tier available)
//
// Rate limit: ~10,000 requests/day per IP. Use the in-memory cache below
// to avoid redundant queries during a session.

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

// In-memory cache: key → { data, ts }
const _cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function cacheKey(lat, lon, radius, categoryId) {
  // Round to ~100m grid to improve cache hit rate
  const la = Math.round(lat * 100) / 100
  const lo = Math.round(lon * 100) / 100
  return `${la}:${lo}:${radius}:${categoryId}`
}

function fromCache(key) {
  const entry = _cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) {
    _cache.delete(key)
    return null
  }
  return entry.data
}

function toCache(key, data) {
  _cache.set(key, { data, ts: Date.now() })
  // Prevent unbounded growth
  if (_cache.size > 200) {
    const oldest = _cache.keys().next().value
    _cache.delete(oldest)
  }
}

/**
 * Build an Overpass QL query for nearby places.
 */
function buildQuery(lat, lon, radiusMeters, nodeType, osmValue) {
  const isRegex = osmValue.includes('|')
  const operator = isRegex ? '~' : '='
  const valueStr = isRegex ? `"${osmValue}"` : `"${osmValue}"`

  return `
[out:json][timeout:25];
(
  node["${nodeType}"${operator}${valueStr}](around:${radiusMeters},${lat},${lon});
  way["${nodeType}"${operator}${valueStr}](around:${radiusMeters},${lat},${lon});
);
out body center 40;
`.trim()
}

/**
 * Try each Overpass mirror in turn; return on first success.
 */
async function fetchWithFallback(query) {
  let lastError
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(20_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json
    } catch (err) {
      lastError = err
    }
  }
  throw lastError || new Error('All Overpass mirrors failed.')
}

/**
 * Normalise an OSM element to a flat place object.
 */
function normaliseElement(el, lat, lon, category) {
  const elLat = el.lat ?? el.center?.lat
  const elLon = el.lon ?? el.center?.lon
  const tags = el.tags || {}

  // Calculate distance if we have a reference point
  let distanceKm = null
  if (lat && lon && elLat && elLon) {
    const R = 6371
    const dLat = ((elLat - lat) * Math.PI) / 180
    const dLon = ((elLon - lon) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((elLat * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2
    distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  return {
    id: `${el.type}-${el.id}`,
    osmId: el.id,
    osmType: el.type,
    lat: elLat,
    lon: elLon,
    name:
      tags.name ||
      tags['name:en'] ||
      tags.brand ||
      tags.operator ||
      'Unnamed Place',
    tags,
    categoryId: category.id,
    distanceKm,
    // Derived fields
    address: [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'],
    ]
      .filter(Boolean)
      .join(', '),
    phone: tags.phone || tags['contact:phone'] || null,
    website: tags.website || tags['contact:website'] || null,
    openingHours: tags.opening_hours || null,
    cuisine: tags.cuisine?.replace(/_/g, ' ') || null,
  }
}

/**
 * Fetch nearby places for a single category.
 * @param {number} lat
 * @param {number} lon
 * @param {Object} category – from utils/categories.js
 * @param {number} [radiusMeters=3000]
 * @returns {Promise<Array>}
 */
export async function fetchNearbyCategory(lat, lon, category, radiusMeters = 3000) {
  const key = cacheKey(lat, lon, radiusMeters, category.id)
  const cached = fromCache(key)
  if (cached) return cached

  const query = buildQuery(lat, lon, radiusMeters, category.nodeType, category.osmValue)
  const json = await fetchWithFallback(query)

  const places = (json.elements || [])
    .filter((el) => el.lat != null || el.center?.lat != null)
    .map((el) => normaliseElement(el, lat, lon, category))
    .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    .slice(0, 30) // Cap at 30 per category for perf

  toCache(key, places)
  return places
}

/**
 * Fetch nearby places for ALL categories in parallel (with concurrency limit).
 * @param {number} lat
 * @param {number} lon
 * @param {Array} categories
 * @param {number} [radiusMeters=3000]
 * @returns {Promise<Object>} – { [categoryId]: places[] }
 */
export async function fetchAllCategories(lat, lon, categories, radiusMeters = 3000) {
  // Concurrency limit to be a good Overpass citizen
  const CONCURRENCY = 3
  const results = {}
  const queue = [...categories]

  async function worker() {
    while (queue.length > 0) {
      const cat = queue.shift()
      if (!cat) break
      try {
        results[cat.id] = await fetchNearbyCategory(lat, lon, cat, radiusMeters)
      } catch {
        results[cat.id] = [] // Graceful degradation
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, categories.length) }, () => worker())
  )

  return results
}
