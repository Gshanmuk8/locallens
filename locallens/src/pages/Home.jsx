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

// ── Landing screen ────────────────────────────────────────────────────────────
function Landing({ onEnable, requesting, error }) {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(160deg, var(--ink) 0%, #3D0830 55%, #1A0520 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-10) var(--space-6)',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Atmospheric glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(181,18,74,0.18) 0%, transparent 60%)',
      }} />
      <div style={{
        position: 'absolute', top: '10%', right: '8%',
        fontSize: '1.8rem', color: 'rgba(181,18,74,0.2)',
        animation: 'spin-slow 24s linear infinite',
        pointerEvents: 'none',
      }}>✦</div>
      <div style={{
        position: 'absolute', bottom: '12%', left: '6%',
        fontSize: '1.2rem', color: 'rgba(106,27,122,0.2)',
        animation: 'spin-slow 18s linear infinite reverse',
        pointerEvents: 'none',
      }}>✦</div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '600px' }}>

        {/* Eyebrow */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
          color: 'rgba(253,173,194,0.7)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-4)',
        }}>
          🗺 Discover the World
        </p>

        {/* Big title */}
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontWeight: 900,
          fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
          color: 'var(--white)',
          letterSpacing: '0.06em',
          lineHeight: 1.0,
          marginBottom: 'var(--space-6)',
        }}>
          LocalLens
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(1.05rem, 2.5vw, 1.35rem)',
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.8,
          marginBottom: 'clamp(2rem, 5vw, 3.5rem)',
          maxWidth: '440px',
          margin: '0 auto clamp(2rem, 5vw, 3.5rem)',
        }}>
          Every street holds a story.<br />
          What's waiting around the corner?
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(124,60,47,0.25)',
            border: '1px solid rgba(253,173,194,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-5)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'rgba(253,173,194,0.9)',
            textAlign: 'left',
          }}>
            ⚠ {error}
            <button onClick={() => navigate('/explore')} style={{
              display: 'block', marginTop: 'var(--space-2)',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
              fontWeight: 600, color: 'rgba(253,173,194,0.9)', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline',
            }}>
              Search a location instead →
            </button>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button
            onClick={onEnable}
            disabled={requesting}
            style={{
              width: '100%', maxWidth: '380px',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, var(--gold) 0%, #8B0B3A 100%)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.1rem', fontWeight: 700, fontStyle: 'italic',
              letterSpacing: '0.06em',
              cursor: requesting ? 'wait' : 'pointer',
              opacity: requesting ? 0.8 : 1,
              boxShadow: '0 4px 24px rgba(181,18,74,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              transition: 'all var(--mid) var(--ease)',
            }}
            onMouseEnter={(e) => { if (!requesting) e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {requesting ? '⏳ Getting location…' : '📍 Enable Location'}
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
            width: '100%', maxWidth: '380px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
          </div>

          <Link
            to="/explore"
            style={{
              width: '100%', maxWidth: '380px',
              padding: '14px 32px',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 'var(--radius-full)',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.05rem', fontWeight: 500, fontStyle: 'italic',
              letterSpacing: '0.06em',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--mid) var(--ease)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.borderColor = 'rgba(253,173,194,0.4)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
          >
            🔍 Explore Anywhere
          </Link>
        </div>

        <p style={{
          marginTop: 'var(--space-6)',
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 'var(--text-xs)',
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.04em',
        }}>
          Your location is never stored or shared.
        </p>
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: 'var(--space-3)',
      marginBottom: 'var(--space-10)',
    }}>
      {CATEGORIES.map((cat) => {
        const count = placesByCategory[cat.id]?.length || 0
        return (
          <div key={cat.id} style={{
            background: 'var(--white)',
            border: `1.5px solid ${cat.color}30`,
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-1)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {/* Subtle top accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: cat.color, opacity: count > 0 ? 0.7 : 0.15,
            }} />
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{cat.emoji}</span>
            <span style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: count > 0 ? 'var(--text-lg)' : 'var(--text-base)',
              fontWeight: 700,
              color: count > 0 ? cat.color : 'var(--ink-muted)',
              lineHeight: 1,
            }}>{count}</span>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-muted)',
              textAlign: 'center',
              letterSpacing: '0.02em',
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
