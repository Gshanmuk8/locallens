import React, { useEffect, useRef } from 'react'
import { getCategoryById } from '../utils/categories'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix Leaflet icon paths broken by Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function createCategoryIcon(category) {
  return L.divIcon({
    html: `<div style="width:38px;height:38px;background:${category?.color || '#E8A020'};border:2.5px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:16px;line-height:1">${category?.emoji || '📍'}</span></div>`,
    className: '',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40],
  })
}

function createUserIcon() {
  return L.divIcon({
    html: `<div style="width:20px;height:20px;background:#3A7CA5;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(58,124,165,0.25),0 2px 8px rgba(0,0,0,0.2);position:relative;"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

function createSearchIcon(label) {
  const safe = esc(label || 'Here').slice(0, 24)
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;"><div style="background:#B5124A;color:white;font-family:system-ui,sans-serif;font-size:11px;font-weight:700;padding:3px 10px;border-radius:12px;white-space:nowrap;box-shadow:0 2px 8px rgba(181,18,74,0.5);border:2px solid white;max-width:150px;overflow:hidden;text-overflow:ellipsis;">${safe}</div><div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #B5124A;margin-top:-1px;"></div></div>`,
    className: '',
    iconSize: [160, 44],
    iconAnchor: [80, 44],
    popupAnchor: [0, -48],
  })
}

export default function MapView({
  center,
  zoom = 14,
  places = [],
  userLocation,
  searchLocation,   // { lat, lon, shortName } — pin for the searched place
  onPlaceClick,
  height = '480px',
  style = {},
  className = '',
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const searchMarkerRef = useRef(null)

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: center ? [center.lat, center.lon] : [20.5937, 78.9629],
      zoom,
      zoomControl: true,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map

    // Force size recalculation after CSS media queries settle on mobile.
    // Without this, maps initialised inside CSS-height containers render blank.
    const t = setTimeout(() => { map.invalidateSize() }, 250)

    return () => {
      clearTimeout(t)
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pan when center changes
  useEffect(() => {
    if (!mapRef.current || !center) return
    mapRef.current.flyTo([center.lat, center.lon], zoom, { animate: true, duration: 1 })
  }, [center?.lat, center?.lon, zoom])

  // Place markers
  useEffect(() => {
    if (!mapRef.current) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    places.forEach((place) => {
      if (!place.lat || !place.lon) return
      const cat = getCategoryById(place.categoryId)
      const icon = createCategoryIcon(cat)
      const marker = L.marker([place.lat, place.lon], { icon })
        .addTo(mapRef.current)
        .bindPopup(
          `<div style="font-family:system-ui;min-width:160px">
            <div style="font-weight:700;font-size:14px;color:#1A0A12;margin-bottom:4px">${esc(place.name)}</div>
            ${place.address ? `<div style="font-size:12px;color:#6B3A52;margin-bottom:6px">${esc(place.address)}</div>` : ''}
            ${place.distanceKm != null ? `<div style="font-size:11px;color:#9E7088">${place.distanceKm < 1 ? Math.round(place.distanceKm * 1000) + ' m' : place.distanceKm.toFixed(1) + ' km'} away</div>` : ''}
          </div>`,
          { maxWidth: 280 }
        )
      if (onPlaceClick) marker.on('click', () => onPlaceClick(place))
      markersRef.current.push(marker)
    })
  }, [places, onPlaceClick])

  // GPS user dot
  useEffect(() => {
    if (!mapRef.current) return
    if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null }
    if (userLocation?.lat && userLocation?.lon) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon: createUserIcon() })
        .addTo(mapRef.current)
        .bindPopup('<strong>You are here</strong>')
    }
  }, [userLocation?.lat, userLocation?.lon])

  // Search location pin — labelled, prominent
  useEffect(() => {
    if (!mapRef.current) return
    if (searchMarkerRef.current) { searchMarkerRef.current.remove(); searchMarkerRef.current = null }
    if (searchLocation?.lat && searchLocation?.lon) {
      searchMarkerRef.current = L.marker(
        [searchLocation.lat, searchLocation.lon],
        { icon: createSearchIcon(searchLocation.shortName || searchLocation.name || 'Here'), zIndexOffset: 1000 }
      )
        .addTo(mapRef.current)
        .bindPopup(`<strong>📍 ${esc(searchLocation.shortName || 'Searched Location')}</strong>`)
        .openPopup()
    }
  }, [searchLocation?.lat, searchLocation?.lon, searchLocation?.shortName])

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
        minHeight: '200px',
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
