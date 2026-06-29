import React, { useEffect, useRef } from 'react'
import { getCategoryById } from '../utils/categories'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix Leaflet's default icon path issue with Vite builds
// (Vite mangles the internal PNG paths that Leaflet relies on)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

function createCategoryIcon(category) {
  return L.divIcon({
    html: `
      <div style="
        width:38px;height:38px;
        background:${category?.color || '#E8A020'};
        border:2.5px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 3px 12px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);font-size:16px;line-height:1">
          ${category?.emoji || '📍'}
        </span>
      </div>
    `,
    className: '',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40],
  })
}

function createUserIcon() {
  return L.divIcon({
    html: `
      <div style="
        width:20px;height:20px;
        background:#3A7CA5;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 0 4px rgba(58,124,165,0.25),0 2px 8px rgba(0,0,0,0.2);
        position:relative;
      "></div>
    `,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export default function MapView({
  center,           // { lat, lon }
  zoom = 14,
  places = [],      // flat array of place objects
  userLocation,     // { lat, lon } or null
  onPlaceClick,     // (place) => void
  height = '480px',
  style = {},
  className = '',
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: center ? [center.lat, center.lon] : [20.5937, 78.9629], // India fallback
      zoom,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pan/zoom when center changes
  useEffect(() => {
    if (!mapRef.current || !center) return
    mapRef.current.flyTo([center.lat, center.lon], zoom, { animate: true, duration: 1 })
  }, [center?.lat, center?.lon, zoom])

  // Update place markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    places.forEach((place) => {
      if (!place.lat || !place.lon) return
      const cat = getCategoryById(place.categoryId)
      const icon = createCategoryIcon(cat)

      const marker = L.marker([place.lat, place.lon], { icon })
        .addTo(mapRef.current)
        .bindPopup(
          `<div style="font-family:var(--font-body,system-ui);min-width:180px">
            <div style="font-weight:700;font-size:14px;color:#1C1A16;margin-bottom:4px;line-height:1.3">
              ${escapeHtml(place.name)}
            </div>
            ${place.address ? `<div style="font-size:12px;color:#6B6560;margin-bottom:8px">${escapeHtml(place.address)}</div>` : ''}
            ${place.distanceKm != null
              ? `<div style="font-size:11px;font-family:monospace;color:#9E9890">${place.distanceKm < 1 ? Math.round(place.distanceKm * 1000) + ' m' : place.distanceKm.toFixed(1) + ' km'} away</div>`
              : ''}
          </div>`,
          { maxWidth: 280 }
        )

      if (onPlaceClick) {
        marker.on('click', () => onPlaceClick(place))
      }

      markersRef.current.push(marker)
    })
  }, [places, onPlaceClick])

  // User location marker
  useEffect(() => {
    if (!mapRef.current) return

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    if (userLocation?.lat && userLocation?.lon) {
      const icon = createUserIcon()
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon })
        .addTo(mapRef.current)
        .bindPopup('<strong>You are here</strong>')
    }
  }, [userLocation?.lat, userLocation?.lon])

  return (
    <div
      role="region"
      aria-label="Interactive map"
      className={className}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        height,
        minHeight: '200px', // Prevent Leaflet collapsing to 0 on some mobile browsers
        width: '100%',
        ...style,
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
