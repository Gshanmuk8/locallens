import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { getCurrentLocation } from '../services/location'
import { geocode } from '../services/nominatim'
import PremiumLoading from '../components/PremiumLoading'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

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

  const [originLat, setOriginLat] = useState('')
  const [originLon, setOriginLon] = useState('')
  const [originLabel, setOriginLabel] = useState('')
  const [originSearch, setOriginSearch] = useState('')
  const [originSearchResults, setOriginSearchResults] = useState([])
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeStatus, setRouteStatus] = useState('idle')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState(null)

  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const originMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)
  const routeLayerRef = useRef(null)
  const debounceRef = useRef(null)

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: [destLat, destLon], zoom: 13,
      zoomControl: true, attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map

    destMarkerRef.current = L.marker([destLat, destLon], { icon: destIcon() })
      .addTo(map).bindPopup(`<strong>${destName}</strong>`).openPopup()

    // Multiple invalidateSize calls at staggered intervals handles all mobile layout cases
    const t1 = setTimeout(() => map.invalidateSize(), 100)
    const t2 = setTimeout(() => map.invalidateSize(), 400)
    const t3 = setTimeout(() => map.invalidateSize(), 900)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      map.remove(); mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { handleUseMyLocation() }, []) // eslint-disable-line

  const handleUseMyLocation = async () => {
    setGpsLoading(true); setGpsError(null)
    try {
      const loc = await getCurrentLocation()
      applyOrigin(loc.lat, loc.lon, 'My Location')
    } catch {
      setGpsError('Could not get your location. Enter a starting point manually.')
    } finally { setGpsLoading(false) }
  }

  const applyOrigin = useCallback((lat, lon, label) => {
    setOriginLat(lat); setOriginLon(lon); setOriginLabel(label)
    setOriginSearch(label); setShowOriginDropdown(false)
    if (mapRef.current) {
      if (originMarkerRef.current) originMarkerRef.current.remove()
      originMarkerRef.current = L.marker([lat, lon], { icon: originIcon() })
        .addTo(mapRef.current).bindPopup('Start: ' + label)
      mapRef.current.fitBounds([[lat, lon], [destLat, destLon]], { padding: [48, 48] })
      setTimeout(() => mapRef.current?.invalidateSize(), 200)
    }
  }, [destLat, destLon])

  useEffect(() => {
    if (!originLat || !originLon) return
    setRouteStatus('loading')
    if (routeLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current); routeLayerRef.current = null
    }
    fetch(`${OSRM}/${originLon},${originLat};${destLon},${destLat}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => {
        if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('no route')
        const route = data.routes[0]
        setRouteInfo({ distance: route.distance, duration: route.duration })
        if (mapRef.current) {
          routeLayerRef.current = L.geoJSON(route.geometry, {
            style: { color: '#B5124A', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' },
          }).addTo(mapRef.current)
          mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [48, 48] })
          setTimeout(() => mapRef.current?.invalidateSize(), 150)
        }
        setRouteStatus('done')
      })
      .catch(() => setRouteStatus('error'))
  }, [originLat, originLon, destLat, destLon])

  const handleOriginInput = (val) => {
    setOriginSearch(val); clearTimeout(debounceRef.current)
    if (val.length < 2) { setOriginSearchResults([]); setShowOriginDropdown(false); return }
    debounceRef.current = setTimeout(async () => {
      try { const res = await geocode(val); setOriginSearchResults(res.slice(0, 5)); setShowOriginDropdown(true) }
      catch { setOriginSearchResults([]) }
    }, 500)
  }

  if (isNaN(destLat) || isNaN(destLon)) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-16)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--gold)', background: 'none', border: '1px solid var(--gold)', borderRadius: 'var(--radius-full)', padding: 'var(--space-3) var(--space-6)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>← Go Back</button>
      </div>
    )
  }

  const panelStyle = {
    background: 'var(--white)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-5)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
  }

  return (
    <main style={{ background: 'var(--ivory)', minHeight: 'calc(100vh - 64px)' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, var(--white) 0%, var(--parchment) 100%)', borderBottom: '1px solid var(--border)', padding: 'var(--space-5) 0' }}>
        <div className="page-container">
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginBottom: 'var(--space-2)', padding: 0 }}>← Back</button>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: 'var(--ink)' }}>
            🧭 Directions to <em style={{ color: 'var(--gold)' }}>{destName}</em>
          </h1>
        </div>
      </div>

      {/* ── MOBILE: map first (full width, fixed height), controls below ── */}
      {/* ── DESKTOP: side by side via CSS grid ── */}
      <div className="page-container" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
        <div className="dir-layout">

          {/* Map */}
          <div className="dir-map-col">
            <div
              ref={containerRef}
              style={{
                height: '360px',
                width: '100%',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
              }}
            />
            {routeStatus === 'error' && (
              <p style={{ marginTop: 'var(--space-3)', fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 'var(--text-sm)', color: 'var(--terracotta)' }}>
                ⚠ Could not find a driving route. OSRM may not cover this area.
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="dir-controls-col" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            {routeStatus === 'loading' && (
              <PremiumLoading
                variant="panel"
                title="Calculating route…"
                subtitle="Curating drive path and timing"
                count={1}
              />
            )}

            {routeStatus === 'done' && routeInfo && (
              <div style={{ ...panelStyle, borderLeft: '4px solid var(--gold)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-6)', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'var(--text-xl)', color: 'var(--gold)', fontWeight: 700 }}>{fmtDist(routeInfo.distance)}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Distance</div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'var(--text-xl)', color: 'var(--sage)', fontWeight: 700 }}>{fmtDuration(routeInfo.duration)}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Drive time</div>
                  </div>
                </div>
              </div>
            )}

            {/* FROM */}
            <div style={panelStyle}>
              <label style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)' }}>From</label>
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
                  cursor: gpsLoading ? 'wait' : 'pointer', textAlign: 'left',
                  transition: 'all var(--fast) var(--ease)',
                }}
              >
                {gpsLoading ? '⏳ Getting location…' : '📍 Use my current location'}
              </button>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textAlign: 'center', marginBottom: 'var(--space-3)' }}>or type a starting point</div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={originSearch}
                  onChange={(e) => handleOriginInput(e.target.value)}
                  placeholder="City, address, landmark…"
                  style={{ width: '100%', padding: 'var(--space-3) var(--space-4)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--ink)', background: 'var(--ivory)', outline: 'none' }}
                />
                {showOriginDropdown && originSearchResults.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden' }}>
                    {originSearchResults.map((r, i) => (
                      <button key={i} onClick={() => applyOrigin(r.lat, r.lon, r.shortName)}
                        style={{ width: '100%', padding: 'var(--space-3) var(--space-4)', background: 'none', border: 'none', borderBottom: i < originSearchResults.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink)' }}
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

            {/* TO */}
            <div style={panelStyle}>
              <label style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)' }}>To</label>
              <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--gold-pale)', border: '1px solid var(--gold)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink)', fontWeight: 600 }}>
                📍 {destName}
              </div>
              <div style={{ marginTop: 'var(--space-2)', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>{destLat.toFixed(5)}, {destLon.toFixed(5)}</div>
            </div>

            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.6 }}>Route via OSRM · OpenStreetMap data</p>
          </div>
        </div>
      </div>
    </main>
  )
}
