import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { getCurrentLocation } from '../services/location'
import { geocode } from '../services/nominatim'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

// Free public OSRM routing — no API key needed
const OSRM = 'https://router.project-osrm.org/route/v1/driving'

function destIcon() {
  return L.divIcon({
    html: `<div style="width:32px;height:32px;background:#B5124A;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:14px">📍</span></div>`,
    className: '', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -36],
  })
}
function originIcon() {
  return L.divIcon({
    html: `<div style="width:22px;height:22px;background:#3A7CA5;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(58,124,165,0.3),0 2px 8px rgba(0,0,0,0.2);"></div>`,
    className: '', iconSize: [22, 22], iconAnchor: [11, 11],
  })
}

function fmtDuration(s) {
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}min`
}
function fmtDist(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`
}

export default function Directions() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const destLat = parseFloat(params.get('lat'))
  const destLon = parseFloat(params.get('lon'))
  const destName = params.get('name') || 'Destination'

  const isMobileOrTablet =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(max-width: 768px)').matches
      : false



  const [originLat, setOriginLat] = useState('')
  const [originLon, setOriginLon] = useState('')
  const [originLabel, setOriginLabel] = useState('')
  const [originSearch, setOriginSearch] = useState('')
  const [originSearchResults, setOriginSearchResults] = useState([])
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)

  const [routeInfo, setRouteInfo] = useState(null) // { distance, duration }
  const [routeStatus, setRouteStatus] = useState('idle') // idle | loading | done | error
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState(null)

  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const originMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)
  const routeLayerRef = useRef(null)
  const debounceRef = useRef(null)

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: [destLat, destLon],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    // Destination marker will be managed by the "dest" effect (so it updates on param changes)

    // Use ResizeObserver to invalidate size whenever the container is resized
    // (handles mobile layout shifts, CSS grid reflow, orientation changes)
    const observer = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.invalidateSize()
    })
    observer.observe(containerRef.current)

    // Also fire immediately after paint to catch initial mobile layout
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (mapRef.current) mapRef.current.invalidateSize()
      })
    })

    const t = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize()
    }, 500)

    return () => {
      clearTimeout(t)
      observer.disconnect()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update destination marker + (if possible) refresh route/polyline + fit bounds
  useEffect(() => {
    if (!mapRef.current) return

    // 1) Update destination marker
    if (destMarkerRef.current) {
      destMarkerRef.current.remove()
      destMarkerRef.current = null
    }

    destMarkerRef.current = L.marker([destLat, destLon], { icon: destIcon() })
      .addTo(mapRef.current)
      .bindPopup(`<strong>${destName}</strong>`)
      .openPopup()

    // Ensure Leaflet knows container dimensions after the destination change / layout shifts
    mapRef.current.invalidateSize()

    // 2) Smoothly bring map into view on mobile/tablet (Issue 1)
    if (isMobileOrTablet) {
      // Run after DOM paint + CSS layout stabilization
      requestAnimationFrame(() => {
        setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 50)
      })
    }

    // 3) If we already have an origin, route effect will handle recalculation automatically
    //    because its deps include destLat/destLon.
  }, [destLat, destLon, destName, isMobileOrTablet])


  // Auto-fetch GPS on mount
  useEffect(() => {
    handleUseMyLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUseMyLocation = async () => {
    setGpsLoading(true)
    setGpsError(null)
    try {
      const loc = await getCurrentLocation()
      applyOrigin(loc.lat, loc.lon, 'My Location')
    } catch (err) {
      setGpsError('Could not get your location. Enter a starting point manually.')
    } finally {
      setGpsLoading(false)
    }
  }

  const applyOrigin = useCallback((lat, lon, label) => {
    setOriginLat(lat)
    setOriginLon(lon)
    setOriginLabel(label)
    setOriginSearch(label)
    setShowOriginDropdown(false)

    if (mapRef.current) {
      if (originMarkerRef.current) originMarkerRef.current.remove()
      originMarkerRef.current = L.marker([lat, lon], { icon: originIcon() })
        .addTo(mapRef.current)
        .bindPopup('Start: ' + label)
      mapRef.current.fitBounds([[lat, lon], [destLat, destLon]], { padding: [48, 48] })
    }
  }, [destLat, destLon])

  // Fetch route whenever origin changes
  useEffect(() => {
    if (!originLat || !originLon) return
    setRouteStatus('loading')
    if (routeLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current)
      routeLayerRef.current = null
    }

    const url = `${OSRM}/${originLon},${originLat};${destLon},${destLat}?overview=full&geometries=geojson`
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('no route')
        const route = data.routes[0]
        setRouteInfo({ distance: route.distance, duration: route.duration })

        if (mapRef.current) {
          routeLayerRef.current = L.geoJSON(route.geometry, {
            style: {
              color: '#B5124A',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            },
          }).addTo(mapRef.current)
          mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [48, 48] })
        }
        setRouteStatus('done')
      })
      .catch(() => setRouteStatus('error'))
  }, [originLat, originLon, destLat, destLon])

  // Debounced origin search
  const handleOriginInput = (val) => {
    setOriginSearch(val)
    clearTimeout(debounceRef.current)
    if (val.length < 2) { setOriginSearchResults([]); setShowOriginDropdown(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await geocode(val)
        setOriginSearchResults(res.slice(0, 5))
        setShowOriginDropdown(true)
      } catch { setOriginSearchResults([]) }
    }, 500)
  }

  const valid = !isNaN(destLat) && !isNaN(destLon)

  if (!valid) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-16)', background: 'var(--ivory)', minHeight: 'calc(100vh - 64px)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)' }}>Invalid destination. <button onClick={() => navigate(-1)} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>Go back</button></p>
      </div>
    )
  }

  return (
    <main style={{ background: 'var(--ivory)', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, var(--white) 0%, var(--parchment) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--space-6) 0',
      }}>
        <div className="page-container">
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
            fontSize: 'var(--text-sm)', color: 'var(--ink-muted)',
            marginBottom: 'var(--space-3)', padding: 0,
          }}>← Back</button>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
            fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--ink)',
            letterSpacing: '-0.01em',
          }}>
            🧭 Directions to <em style={{ color: 'var(--gold)' }}>{destName}</em>
          </h1>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 320px',
          gap: 'var(--space-6)',
          alignItems: 'start',
        }}
          className="directions-layout"
        >
          {/* Map */}
          <div>
            <div
              ref={containerRef}
              className="directions-map-container"
              style={{
                height: '520px',
                minHeight: '280px',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                width: '100%',
              }}
            />
            {routeStatus === 'error' && (
              <p style={{
                marginTop: 'var(--space-3)',
                fontFamily: 'var(--font-body)', fontStyle: 'italic',
                fontSize: 'var(--text-sm)', color: 'var(--terracotta)',
              }}>
                ⚠ Could not find a driving route. OSRM may not cover this area.
              </p>
            )}
          </div>

          {/* Controls panel — shows above map on mobile via CSS order */}
          <div className="directions-panel directions-controls" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            {/* Route summary */}
            {routeStatus === 'loading' && (
              <div style={{ background: 'var(--parchment)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--ink-muted)' }}>Calculating route…</p>
              </div>
            )}
            {routeStatus === 'done' && routeInfo && (
              <div style={{
                background: 'linear-gradient(135deg, var(--white) 0%, var(--parchment) 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                borderLeft: '4px solid var(--gold)',
              }}>
                <div style={{ display: 'flex', gap: 'var(--space-6)', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'var(--text-xl)', color: 'var(--gold)', fontWeight: 700 }}>
                      {fmtDist(routeInfo.distance)}
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Distance</div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'var(--text-xl)', color: 'var(--sage)', fontWeight: 700 }}>
                      {fmtDuration(routeInfo.duration)}
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Drive time</div>
                  </div>
                </div>
              </div>
            )}

            {/* From */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <label style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)' }}>
                From
              </label>

              {gpsError && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--terracotta)', marginBottom: 'var(--space-3)', fontStyle: 'italic' }}>⚠ {gpsError}</p>}

              <button
                onClick={handleUseMyLocation}
                disabled={gpsLoading}
                style={{
                  width: '100%', marginBottom: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  background: originLabel === 'My Location' ? 'var(--sky-pale)' : 'var(--parchment)',
                  border: `1px solid ${originLabel === 'My Location' ? 'var(--sky)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
                  fontSize: 'var(--text-sm)', color: 'var(--sky)',
                  cursor: gpsLoading ? 'wait' : 'pointer',
                  transition: 'all var(--fast) var(--ease)',
                  textAlign: 'left',
                }}
              >
                {gpsLoading ? '⏳ Getting location…' : '📍 Use my current location'}
              </button>

              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textAlign: 'center', marginBottom: 'var(--space-3)', letterSpacing: '0.08em' }}>or type a starting point</div>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={originSearch}
                  onChange={(e) => handleOriginInput(e.target.value)}
                  placeholder="City, address, landmark…"
                  style={{
                    width: '100%', padding: 'var(--space-3) var(--space-4)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                    color: 'var(--ink)', background: 'var(--ivory)',
                    outline: 'none',
                  }}
                />
                {showOriginDropdown && originSearchResults.length > 0 && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: 'var(--white)', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                    zIndex: 200, overflow: 'hidden',
                  }}>
                    {originSearchResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => applyOrigin(r.lat, r.lon, r.shortName)}
                        style={{
                          width: '100%', padding: 'var(--space-3) var(--space-4)',
                          background: 'none', border: 'none',
                          borderBottom: i < originSearchResults.length - 1 ? '1px solid var(--border)' : 'none',
                          cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink)',
                          transition: 'background var(--fast) var(--ease)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--parchment)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        📍 {r.shortName}
                        <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', fontStyle: 'italic', marginTop: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{r.displayName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* To */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <label style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)' }}>
                To
              </label>
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--gold-pale)', border: '1px solid var(--gold)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                color: 'var(--ink)', fontWeight: 600,
              }}>
                📍 {destName}
              </div>
              <div style={{ marginTop: 'var(--space-2)', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
                {destLat.toFixed(5)}, {destLon.toFixed(5)}
              </div>
            </div>

            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
              fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.6,
            }}>
              Route calculated via OSRM using OpenStreetMap data.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
