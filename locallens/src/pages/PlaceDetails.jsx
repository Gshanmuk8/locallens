import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MapView from '../components/MapView'
import { getCategoryById, formatDistance } from '../utils/categories'
import { safeLoad } from '../utils/storage'

function DetailRow({ icon, label, value, href }) {
  if (!value) return null

  const content = (
    <div style={{
      display: 'flex',
      gap: 'var(--space-4)',
      padding: 'var(--space-4) 0',
      borderBottom: '1px solid var(--border)',
      alignItems: 'flex-start',
    }}>
      <span style={{
        fontSize: '20px',
        flexShrink: 0,
        width: '28px',
        textAlign: 'center',
        marginTop: '1px',
      }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--ink-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '3px',
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: href ? 'var(--sky)' : 'var(--ink)',
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}>
          {value}
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        {content}
      </a>
    )
  }

  return content
}

export default function PlaceDetails() {
  const { osmType, osmId } = useParams()
  const navigate = useNavigate()
  const [place, setPlace] = useState(null)
  const [category, setCategory] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const key = `place-${osmType}-${osmId}`
    const stored = safeLoad(key)
    if (stored) {
      try {
        const { place: p, category: c } = stored
        if (!p?.name) throw new Error('invalid')
        setPlace(p)
        setCategory(getCategoryById(c?.id) || c)
      } catch {
        setNotFound(true)
      }
    } else {
      setNotFound(true)
    }
  }, [osmType, osmId])

  if (notFound) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        padding: 'var(--space-8)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px' }}>🗺</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'var(--text-2xl)',
          color: 'var(--ink)',
        }}>
          Place not found
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--ink-soft)',
          maxWidth: '360px',
          lineHeight: 1.7,
        }}>
          This place detail may have expired. Go back and click a place card again.
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            color: 'var(--white)',
            background: 'var(--ink)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: 'var(--space-3) var(--space-6)',
            cursor: 'pointer',
          }}
        >
          ← Go Back
        </button>
      </div>
    )
  }

  if (!place) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--ink-muted)',
          fontSize: 'var(--text-base)',
        }}>
          Loading…
        </div>
      </div>
    )
  }

  const osmUrl = `https://www.openstreetmap.org/${osmType}/${osmId}`
  const hasCoords = place.lat && place.lon
  const directionsPath = hasCoords
    ? `/directions?lat=${place.lat}&lon=${place.lon}&name=${encodeURIComponent(place.name)}`
    : null

  return (
    <main style={{ background: 'var(--ivory)', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, var(--white) 0%, var(--parchment) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--space-10) 0 var(--space-8)',
      }}>
        <div className="page-container">
          {/* Breadcrumb */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-6)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-muted)',
          }}>
            <Link to="/" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ink-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                padding: 0,
              }}
            >
              Back
            </button>
            <span>›</span>
            <span style={{ color: 'var(--ink-soft)' }}>{place.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)' }}>
            {/* Category badge */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius-lg)',
              background: category?.paleBg || 'var(--parchment)',
              border: `2px solid ${category?.color || 'var(--border)'}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)',
            }}>
              {category?.emoji || '📍'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Category label */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: category?.color || 'var(--gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 'var(--space-2)',
              }}>
                {category?.plural || 'Place'}
                {place.cuisine && ` · ${place.cuisine}`}
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                color: 'var(--ink)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: 'var(--space-3)',
              }}>
                {place.name}
              </h1>

              {/* Distance */}
              {place.distanceKm != null && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--parchment)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink-soft)',
                  letterSpacing: '0.04em',
                }}>
                  📍 {formatDistance(place.distanceKm)} from search point
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="details-grid">
          {/* Left: details */}
          <div>
            {/* Details card */}
            <div style={{
              background: 'var(--white)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              marginBottom: 'var(--space-6)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'var(--text-lg)',
                color: 'var(--ink)',
                marginBottom: 'var(--space-4)',
              }}>
                Details
              </h2>

              <DetailRow icon="📍" label="Address" value={place.address || place.tags?.['addr:place'] || null} />
              <DetailRow icon="🕐" label="Opening Hours" value={place.openingHours} />
              <DetailRow icon="📞" label="Phone" value={place.phone} href={place.phone ? `tel:${place.phone}` : null} />
              <DetailRow icon="🌐" label="Website" value={place.website} href={place.website} />
              <DetailRow icon="🍽" label="Cuisine" value={place.cuisine} />
              <DetailRow
                icon="🗺"
                label="OpenStreetMap"
                value="View on OpenStreetMap"
                href={osmUrl}
              />

              {/* All raw tags (collapsed) */}
              {Object.keys(place.tags || {}).length > 0 && (
                <details style={{ marginTop: 'var(--space-4)' }}>
                  <summary style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--ink-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: 'var(--space-2) 0',
                  }}>
                    All OSM tags
                  </summary>
                  <div style={{
                    marginTop: 'var(--space-3)',
                    background: 'var(--parchment)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--ink-soft)',
                    lineHeight: 1.8,
                    maxHeight: '240px',
                    overflowY: 'auto',
                  }}>
                    {Object.entries(place.tags).map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: 'var(--terracotta)' }}>{k}</span>
                        {' = '}
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>

            {/* Directions button — in-app, never leaves LocalLens */}
            {directionsPath && (
              <Link
                to={directionsPath}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 'var(--space-3)', width: '100%', padding: 'var(--space-4)',
                  background: 'linear-gradient(135deg, var(--gold) 0%, var(--sage) 100%)',
                  color: 'var(--white)', borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none', fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic', fontWeight: 700, fontSize: 'var(--text-base)',
                  boxShadow: 'var(--shadow-gold)', transition: 'all var(--mid) var(--ease)',
                  letterSpacing: '0.04em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(181,18,74,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-gold)'
                }}
              >
                🧭 Get Directions
              </Link>
            )}
          </div>

          {/* Right: map */}
          <div>
            {place.lat && place.lon && (
              <MapView
                center={{ lat: place.lat, lon: place.lon }}
                places={[place]}
                zoom={16}
                height="320px"
                style={{ marginBottom: 'var(--space-4)' }}
              />
            )}

            {/* Coordinates */}
            {place.lat && place.lon && (
              <div style={{
                background: 'var(--parchment)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--ink-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 'var(--space-2)',
                }}>
                  Coordinates
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink)',
                  lineHeight: 1.6,
                }}>
                  {place.lat.toFixed(6)}, {place.lon.toFixed(6)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: 'var(--space-16)' }} />
    </main>
  )
}
