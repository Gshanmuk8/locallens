import React, { useState, useCallback, useRef } from 'react'
import SearchBar from '../components/SearchBar'
import MapView from '../components/MapView'
import CategoryFilter from '../components/CategoryFilter'
import CategoryGrid from '../components/CategoryGrid'
import { fetchNearbyCategory } from '../services/overpass'
import { CATEGORIES } from '../utils/categories'

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
]

export default function Explore() {
  const [selectedLocation, setSelectedLocation] = useState(null)  // { lat, lon, shortName }
  const [selectedCategories, setSelectedCategories] = useState([])
  const [radius, setRadius] = useState(3000)
  const [placesByCategory, setPlacesByCategory] = useState({})
  const [loadingCategories, setLoadingCategories] = useState({})
  const [allPlaces, setAllPlaces] = useState([])
  const [searchedPlace, setSearchedPlace] = useState(null)
  const abortRef = useRef(null)

  const loadPlaces = useCallback(async (loc, cats, rad) => {
    if (!loc) return

    // Abort any ongoing fetch
    abortRef.current?.abort?.()
    const controller = new AbortController()
    abortRef.current = controller

    const categoriesToLoad = cats.length > 0
      ? CATEGORIES.filter((c) => cats.includes(c.id))
      : CATEGORIES

    // Set all to loading
    const loadingState = {}
    categoriesToLoad.forEach((c) => { loadingState[c.id] = true })
    setLoadingCategories(loadingState)
    setPlacesByCategory({})
    setAllPlaces([])

    const allResults = {}

    await Promise.all(
      categoriesToLoad.map(async (cat) => {
        if (controller.signal.aborted) return
        try {
          const places = await fetchNearbyCategory(loc.lat, loc.lon, cat, rad)
          if (!controller.signal.aborted) {
            allResults[cat.id] = places
            setPlacesByCategory((prev) => ({ ...prev, [cat.id]: places }))
            setAllPlaces((prev) => [...prev.filter((p) => p.categoryId !== cat.id), ...places])
          }
        } catch (err) {
          if (!controller.signal.aborted) {
            allResults[cat.id] = []
            setPlacesByCategory((prev) => ({ ...prev, [cat.id]: [] }))
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoadingCategories((prev) => ({ ...prev, [cat.id]: false }))
          }
        }
      })
    )
  }, [])

  const handleLocationSelected = useCallback((result) => {
    setSelectedLocation(result)
    setSearchedPlace(result)
    setPlacesByCategory({})
    setAllPlaces([])
    loadPlaces(result, selectedCategories, radius)
  }, [selectedCategories, radius, loadPlaces])

  const handleCategoryChange = (cats) => {
    setSelectedCategories(cats)
    if (selectedLocation) {
      loadPlaces(selectedLocation, cats, radius)
    }
  }

  const handleRadiusChange = (r) => {
    setRadius(r)
    if (selectedLocation) {
      loadPlaces(selectedLocation, selectedCategories, r)
    }
  }

  const visibleCategories = selectedCategories.length > 0
    ? CATEGORIES.filter((c) => selectedCategories.includes(c.id))
    : CATEGORIES

  const isLoading = Object.values(loadingCategories).some(Boolean)

  return (
    <main style={{ background: 'var(--ivory)', minHeight: 'calc(100vh - 64px)' }}>
      {/* Search hero */}
      <div style={{
        background: 'linear-gradient(160deg, var(--parchment) 0%, var(--ivory) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--space-10) 0',
      }}>
        <div className="page-container">
          {/* Eyebrow */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-3)',
          }}>
            Explore the world
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: 'var(--ink)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 'var(--space-2)',
          }}>
            Search any place<br />
            <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>on Earth</em>
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--ink-soft)',
            marginBottom: 'var(--space-8)',
            maxWidth: '480px',
          }}>
            Type a city, landmark, or neighborhood. LocalLens finds what's nearby using OpenStreetMap data.
          </p>

          <div style={{ maxWidth: '640px' }}>
            <SearchBar
              onLocationSelected={handleLocationSelected}
              placeholder="Try: Visakhapatnam, Times Square, IIT Madras…"
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Controls bar */}
      {searchedPlace && (
        <div style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          padding: 'var(--space-4) 0',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: '64px',
          zIndex: 50,
        }}>
          <div className="page-container">
          <div className="controls-bar-inner">
              {/* Result label */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-md)',
                color: 'var(--ink)',
                flexShrink: 0,
              }}>
                {searchedPlace.shortName}
              </div>

              <div className="controls-divider" style={{ width: '1px', height: '24px', background: 'var(--border)', flexShrink: 0 }} />

              {/* Radius selector */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, flexWrap: 'wrap' }}>
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleRadiusChange(opt.value)}
                    className="radius-btn"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: radius === opt.value ? 700 : 500,
                      color: radius === opt.value ? 'var(--white)' : 'var(--ink-soft)',
                      background: radius === opt.value ? 'var(--ink)' : 'var(--parchment)',
                      border: `1px solid ${radius === opt.value ? 'var(--ink)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-full)',
                      padding: 'var(--space-1) var(--space-3)',
                      cursor: 'pointer',
                      transition: 'all var(--fast) var(--ease)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {isLoading && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink-muted)',
                  letterSpacing: '0.04em',
                }}>
                  Loading…
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="page-container" style={{ paddingTop: 'var(--space-8)' }}>
        {!searchedPlace ? (
          /* Empty state */
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-20) var(--space-8)',
          }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--space-6)' }}>🗺</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'var(--text-2xl)',
              color: 'var(--ink)',
              marginBottom: 'var(--space-4)',
            }}>
              The whole world is waiting
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--ink-soft)',
              maxWidth: '360px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              Search for any city, landmark, or neighborhood above to discover what's around it.
            </p>
          </div>
        ) : (
          <>
            {/* Map */}
            <MapView
              center={selectedLocation}
              places={allPlaces}
              zoom={14}
              height="420px"
              style={{ marginBottom: 'var(--space-8)' }}
            />

            {/* Category filters */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <CategoryFilter
                selected={selectedCategories}
                onChange={handleCategoryChange}
              />
            </div>

            {/* Results */}
            {visibleCategories.map((cat) => (
              <CategoryGrid
                key={cat.id}
                categoryId={cat.id}
                places={placesByCategory[cat.id]}
                loading={loadingCategories[cat.id] !== false && !placesByCategory[cat.id]}
                maxVisible={6}
              />
            ))}
          </>
        )}
      </div>

      <div style={{ height: 'var(--space-16)' }} />
    </main>
  )
}
