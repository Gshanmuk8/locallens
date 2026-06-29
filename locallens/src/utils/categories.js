// ── Category definitions ──────────────────────────────────────────────────────
// Each entry maps a UI concept to:
//   • emoji  – display icon
//   • label  – human-readable singular
//   • plural – human-readable plural
//   • color  – accent hex from design system
//   • overpassTag – Overpass QL amenity/tourism/etc. filter clause
//   • fallbackNote – what to show when Overpass returns nothing (common in small towns)

export const CATEGORIES = [
  {
    id: 'restaurants',
    emoji: '🍽',
    label: 'Restaurant',
    plural: 'Restaurants',
    color: '#C4572A',
    paleBg: '#FAEEE8',
    overpassTag: `node["amenity"~"restaurant|food_court|fast_food"]({{bbox}});
                  way["amenity"~"restaurant|food_court|fast_food"]({{bbox}});`,
    nodeType: 'amenity',
    osmValue: 'restaurant|food_court|fast_food',
  },
  {
    id: 'hotels',
    emoji: '🏨',
    label: 'Hotel',
    plural: 'Hotels',
    color: '#3A7CA5',
    paleBg: '#E8F3FA',
    overpassTag: `node["tourism"~"hotel|motel|guest_house|hostel"]({{bbox}});
                  way["tourism"~"hotel|motel|guest_house|hostel"]({{bbox}});`,
    nodeType: 'tourism',
    osmValue: 'hotel|motel|guest_house|hostel',
  },
  {
    id: 'cafes',
    emoji: '☕',
    label: 'Cafe',
    plural: 'Cafes',
    color: '#7B5B3A',
    paleBg: '#F5EDE3',
    overpassTag: `node["amenity"="cafe"]({{bbox}});
                  way["amenity"="cafe"]({{bbox}});`,
    nodeType: 'amenity',
    osmValue: 'cafe',
  },
  {
    id: 'theaters',
    emoji: '🎬',
    label: 'Theater',
    plural: 'Theaters',
    color: '#6B3FA0',
    paleBg: '#F2EBF9',
    overpassTag: `node["amenity"="cinema"]({{bbox}});
                  way["amenity"="cinema"]({{bbox}});`,
    nodeType: 'amenity',
    osmValue: 'cinema',
  },
  {
    id: 'attractions',
    emoji: '📍',
    label: 'Attraction',
    plural: 'Attractions',
    color: '#E8A020',
    paleBg: '#FDF0CC',
    overpassTag: `node["tourism"~"attraction|museum|monument|viewpoint|artwork"]({{bbox}});
                  way["tourism"~"attraction|museum|monument|viewpoint|artwork"]({{bbox}});`,
    nodeType: 'tourism',
    osmValue: 'attraction|museum|monument|viewpoint|artwork',
  },
  {
    id: 'parks',
    emoji: '🌳',
    label: 'Park',
    plural: 'Parks',
    color: '#5C7A5E',
    paleBg: '#EBF2EB',
    overpassTag: `node["leisure"~"park|garden|nature_reserve"]({{bbox}});
                  way["leisure"~"park|garden|nature_reserve"]({{bbox}});`,
    nodeType: 'leisure',
    osmValue: 'park|garden|nature_reserve',
  },
  {
    id: 'shopping',
    emoji: '🛒',
    label: 'Mall',
    plural: 'Shopping',
    color: '#C47A3A',
    paleBg: '#FBF0E4',
    overpassTag: `node["shop"~"mall|supermarket|department_store|clothes|electronics"]({{bbox}});
                  way["shop"~"mall|supermarket|department_store|clothes|electronics"]({{bbox}});`,
    nodeType: 'shop',
    osmValue: 'mall|supermarket|department_store|clothes|electronics',
  },
]

export const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id)

// ── Distance helpers ─────────────────────────────────────────────────────────

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(km) {
  if (km <= 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

// ── Name helpers ─────────────────────────────────────────────────────────────

export function placeName(tags) {
  return (
    tags?.name ||
    tags?.['name:en'] ||
    tags?.['brand'] ||
    tags?.['operator'] ||
    'Unnamed Place'
  )
}

export function placeSubtitle(tags, category) {
  const parts = []
  if (tags?.cuisine) parts.push(tags.cuisine.replace(/_/g, ' '))
  if (tags?.['addr:street']) parts.push(tags['addr:street'])
  if (tags?.['addr:city']) parts.push(tags['addr:city'])
  if (parts.length) return parts.join(', ')
  return category?.label || ''
}
