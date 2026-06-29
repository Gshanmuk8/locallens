import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentLocation, watchLocation } from '../services/location'
import { reverseGeocode } from '../services/nominatim'
import { fetchNearbyCategory } from '../services/overpass'
import { CATEGORIES } from '../utils/categories'
import CategoryGrid from '../components/CategoryGrid'
import MapView from '../components/MapView'

// ── Haversine distance in metres between two coords ───────────────────────────
function distanceMetres(lat1, lon1, lat2, lon2) {
  const R = 6_371_000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Landing screen (before any GPS decision) ──────────────────────────────────
function Landing({ onEnable, requesting, error }) {
  const navigate = useNavigate()

  // Generate dot grid
  const dots = Array.from({ length: 25 })

  return (
    <div className="landing-root">
      {/* ── Left panel — dark atmospheric ── */}
      <div className="landing-left">
        <span className="landing-ornament">🗺</span>

        <span className="landing-title-accent">Discover the world</span>
        <h1 className="landing-title">
          Local<br />Lens
        </h1>
        <p className="landing-tagline">
          Every street holds a story.<br />
          What's waiting around the corner?
        </p>

        {/* Dot grid ornament */}
        <div className="landing-dots">
          {dots.map((_, i) => <span key={i} />)}
        </div>
      </div>

      {/* ── Right panel — actions ── */}
      <div className="landing-right">
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            color: 'var(--ink)',
            lineHeight: 1.2,
            marginBottom: 'var(--space-3)',
            letterSpacing: '-0.01em',
          }}>
            What's near you<br />
            <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>right now?</em>
          </h2>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--ink-soft)',
            lineHeight: 1.8,
            marginBottom: 'var(--space-8)',
            fontStyle: 'italic',
          }}>
            Restaurants, cafes, theaters, parks — discovered instantly using your GPS. No account, no signup.
          </p>

          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--terra-pale)',
              border: '1px solid rgba(124,60,47,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-5)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--terracotta)',
            }}>
              ⚠ {error}
              <button
                onClick={() => navigate('/explore')}
                style={{
                  display: 'block', marginTop: 'var(--space-2)',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                  fontWeight: 600, color: 'var(--sky)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline',
                }}
              >
                Search a location instead →
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <button
              onClick={onEnable}
              disabled={requesting}
              className="landing-cta-btn landing-cta-primary"
              onMouseEnter={(e) => {
                if (!requesting) e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {requesting ? '⏳ Getting location…' : '📍 Enable Location'}
            </button>

            <div className="landing-cta-divider">or</div>

            <Link
              to="/explore"
              className="landing-cta-btn landing-cta-secondary"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)'
                e.currentTarget.style.boxShadow = 'var(--shadow-gold)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              🔍 Explore Anywhere
            </Link>
          </div>

          <p style={{
            marginTop: 'var(--space-6)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-muted)',
            fontStyle: 'italic',
            textAlign: 'center',
          }}>
            Your location is never stored or shared.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Denied state — location was blocked ──────────────────────────────────────
function LocationDenied() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8)',
      background: 'var(--ivory)',
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        textAlign: 'center',
        animation: 'fadeUp var(--slow) var(--ease) both',
      }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--space-6)' }}>🔒</div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'var(--text-2xl)',
          color: 'var(--ink)',
          marginBottom: 'var(--space-4)',
        }}>
          Location access denied.
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--ink-soft)',
          lineHeight: 1.7,
          marginBottom: 'var(--space-8)',
        }}>
          Search any city or place instead.
        </p>
        <Link
          to="/explore"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4) var(--space-8)',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--terracotta) 100%)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 'var(--text-base)',
            textDecoration: 'none',
            boxShadow: 'var(--shadow-gold)',
            letterSpacing: '0.01em',
          }}
        >
          🔍 Search Location
        </Link>
      </div>
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ placesByCategory }) {
  return (
    <div className="stats-bar">
      {CATEGORIES.map((cat) => {
        const count = placesByCategory[cat.id]?.length || 0
        return (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '16px' }}>{cat.emoji}</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: cat.color,
            }}>{count}</span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-soft)',
            }}>{cat.plural}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Home page ────────────────────────────────────────────────────────────
export default function Home() {
  // 'landing' | 'denied' | 'dashboard'
  const [screen, setScreen] = useState('landing')
  const [requesting, setRequesting] = useState(false)
  const [gpsError, setGpsError] = useState(null)

  const [location, setLocation] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [placesByCategory, setPlacesByCategory] = useState({})
  const [loadingCategories, setLoadingCategories] = useState({})
  const [allPlaces, setAllPlaces] = useState([])

  // Track previous position so we only re-fetch after 500 m movement
  const prevLocationRef = useRef(null)

  const loadDashboard = useCallback(async (loc) => {
    setLocation(loc)

    // Reverse geocode
    try {
      const info = await reverseGeocode(loc.lat, loc.lon)
      setLocationName(info.city + (info.state ? `, ${info.state}` : ''))
    } catch {
      setLocationName('Your Location')
    }

    // Start all categories loading
    const loadingState = {}
    CATEGORIES.forEach((c) => { loadingState[c.id] = true })
    setLoadingCategories(loadingState)
    setPlacesByCategory({})
    setAllPlaces([])

    const results = {}
    await Promise.all(
      CATEGORIES.map(async (cat) => {
        try {
          const places = await fetchNearbyCategory(loc.lat, loc.lon, cat, 3000)
          results[cat.id] = places
        } catch {
          results[cat.id] = []
        }
        setPlacesByCategory((prev) => ({ ...prev, [cat.id]: results[cat.id] }))
        setLoadingCategories((prev) => ({ ...prev, [cat.id]: false }))
      })
    )

    setAllPlaces(Object.values(results).flat())
    prevLocationRef.current = loc
  }, [])

  const handleEnable = async () => {
    setRequesting(true)
    setGpsError(null)
    try {
      const loc = await getCurrentLocation()
      setScreen('dashboard')
      await loadDashboard(loc)
    } catch (err) {
      // Check if it was a denial
      if (
        err.message.includes('denied') ||
        err.message.includes('not supported')
      ) {
        setScreen('denied')
      } else {
        setGpsError(err.message)
      }
    } finally {
      setRequesting(false)
    }
  }

  // ── Watch position — only re-fetch after 500 m movement ──────────────────
  useEffect(() => {
    if (screen !== 'dashboard' || !location) return

    const cleanup = watchLocation(
      (newLoc) => {
        const prev = prevLocationRef.current
        if (!prev) {
          prevLocationRef.current = newLoc
          return
        }
        const moved = distanceMetres(prev.lat, prev.lon, newLoc.lat, newLoc.lon)
        if (moved >= 500) {
          loadDashboard(newLoc)
        }
      },
      () => {} // silent watch errors — dashboard stays with last known data
    )
    return cleanup
  }, [screen, location, loadDashboard])

  // ── Render ────────────────────────────────────────────────────────────────
  if (screen === 'landing') {
    return (
      <Landing
        onEnable={handleEnable}
        requesting={requesting}
        error={gpsError}
      />
    )
  }

  if (screen === 'denied') {
    return <LocationDenied />
  }

  // Dashboard
  const allLoaded =
    Object.keys(loadingCategories).length === CATEGORIES.length &&
    Object.values(loadingCategories).every((v) => v === false)

  return (
    <main style={{ background: 'var(--ivory)', minHeight: 'calc(100vh - 64px)' }}>
      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(160deg, var(--white) 0%, var(--parchment) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--space-10) 0 var(--space-8)',
      }}>
        <div className="page-container">
          <div className="dashboard-hero-row">
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--gold)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-2)',
              }}>
                📍 Near You
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                color: 'var(--ink)',
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
              }}>
                {locationName || 'Your Area'}
              </h1>
              {location?.accuracy != null && (
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--ink-soft)',
                  marginTop: 'var(--space-2)',
                }}>
                  {location.accuracy < 100
                    ? `Accurate to ~${Math.round(location.accuracy)} m`
                    : 'Approximate location'}
                </p>
              )}
            </div>

            <Link
              to="/explore"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                color: 'var(--ink)',
                textDecoration: 'none',
                padding: 'var(--space-3) var(--space-5)',
                background: 'var(--white)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--fast) var(--ease)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)'
                e.currentTarget.style.boxShadow = 'var(--shadow-gold)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              🔍 Search any place
            </Link>
          </div>
        </div>
      </div>

      {/* Map + results */}
      <div className="page-container" style={{ paddingTop: 'var(--space-8)' }}>
        <MapView
          center={location}
          userLocation={location}
          places={allPlaces}
          zoom={14}
          height="360px"
          style={{ marginBottom: 'var(--space-8)' }}
          className="map-home"
        />

        {/* Stats bar — shown once all fetches finish */}
        {allLoaded && <StatsBar placesByCategory={placesByCategory} />}

        {/* Category grids */}
        {CATEGORIES.map((cat) => (
          <CategoryGrid
            key={cat.id}
            categoryId={cat.id}
            places={placesByCategory[cat.id]}
            loading={loadingCategories[cat.id] !== false}
            maxVisible={6}
          />
        ))}
      </div>

      <div style={{ height: 'var(--space-16)' }} />
    </main>
  )
}
