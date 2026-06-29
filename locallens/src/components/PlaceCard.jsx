import React from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistance } from '../utils/categories'
import { safeSave } from '../utils/storage'

export default function PlaceCard({ place, category, style = {} }) {
  const navigate = useNavigate()

  const handleClick = () => {
    safeSave(`place-${place.osmType}-${place.osmId}`, { place, category })
    navigate(`/place/${place.osmType}/${place.osmId}`)
  }

  const handleDirections = (e) => {
    // Prevent the parent card navigation from firing
    e?.stopPropagation?.()
    e?.preventDefault?.()

    if (place.lat && place.lon) {
      const params = new URLSearchParams({
        lat: place.lat,
        lon: place.lon,
        name: place.name,
      })
      navigate(`/directions?${params.toString()}`)
    }
  }


  return (

    <article
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="place-card"
      style={{ '--card-accent': category?.color || 'var(--gold)', ...style }}
    >
      {/* Top row: emoji + name + distance */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', paddingLeft: 'var(--space-2)' }}>
        {/* Emoji badge */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${category?.paleBg || 'var(--parchment)'} 0%, var(--white) 100%)`,
          border: `2px solid ${category?.color || 'var(--border)'}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px',
          boxShadow: `0 2px 8px ${category?.color || 'var(--gold)'}20`,
        }}>
          {category?.emoji || '📍'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
            fontSize: 'var(--text-xs)', color: category?.color || 'var(--gold)',
            letterSpacing: '0.08em', marginBottom: '2px', textTransform: 'lowercase',
          }}>
            {place.cuisine || category?.label || 'Place'}
          </div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
            fontSize: 'var(--text-md)', color: 'var(--ink)', lineHeight: 1.2,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', letterSpacing: '-0.01em',
          }}>
            {place.name}
          </h3>
        </div>

        {place.distanceKm != null && (
          <div style={{
            flexShrink: 0,
            fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
            fontSize: 'var(--text-xs)', color: 'var(--ink-muted)',
            background: 'var(--parchment)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)', padding: '2px var(--space-3)', whiteSpace: 'nowrap',
          }}>
            {formatDistance(place.distanceKm)}
          </div>
        )}
      </div>

      {place.address && (
        <p style={{
          fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 'var(--text-sm)',
          color: 'var(--ink-soft)', lineHeight: 1.5, paddingLeft: 'var(--space-2)',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
        }}>
          {place.address}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: 'var(--space-2)', marginTop: 'auto' }}>
        <button
          onPointerDown={handleDirections}
          onClick={handleDirections}
          aria-label={`Directions to ${place.name}`}

          style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
            fontSize: 'var(--text-sm)', fontWeight: 600,
            color: category?.color || 'var(--gold)', background: 'none', border: 'none',
            cursor: 'pointer', transition: 'all var(--fast) var(--ease)',
            letterSpacing: '0.04em', padding: 'var(--space-1) 0',
            display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          🧭 Directions
        </button>
      </div>
    </article>
  )
}
