import React from 'react'
import PlaceCard from './PlaceCard'
import { getCategoryById } from '../utils/categories'

function SkeletonCard({ color = '#B5124A' }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '130px',
    }}>
      {/* Left accent stripe matching category */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
        background: color, opacity: 0.35, borderRadius: '20px 0 0 20px',
      }} />

      {/* Sweeping shimmer */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)',
        backgroundSize: '250% 100%',
        animation: 'skeleton-sweep 2s ease-in-out infinite',
      }} />

      <div style={{ paddingLeft: 'var(--space-2)' }}>
        {/* Top row: circle + lines */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', alignItems: 'flex-start' }}>
          <div className="skeleton" style={{ width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1, paddingTop: '4px' }}>
            <div className="skeleton" style={{ height: '9px', borderRadius: '4px', marginBottom: '8px', width: '35%' }} />
            <div className="skeleton" style={{ height: '17px', borderRadius: '5px', marginBottom: '7px', width: '80%' }} />
          </div>
          <div className="skeleton" style={{ width: '48px', height: '20px', borderRadius: '20px', flexShrink: 0, marginTop: '4px' }} />
        </div>
        {/* Address line */}
        <div className="skeleton" style={{ height: '11px', borderRadius: '4px', marginBottom: '16px', width: '65%' }} />
        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="skeleton" style={{ height: '13px', borderRadius: '4px', width: '22%' }} />
        </div>
      </div>
    </div>
  )
}

export default function CategoryGrid({
  categoryId,
  places,
  loading,
  emptyMessage,
  maxVisible = 6,
  onShowMore,
}) {
  const category = getCategoryById(categoryId)

  if (!category) return null

  const visiblePlaces = places?.slice(0, maxVisible) || []
  const hasMore = places && places.length > maxVisible

  return (
    <section style={{ marginBottom: 'var(--space-12)' }}>
      {/* Magazine-style section header */}
      <div
        className="category-section-header"
        style={{ '--cat-color': category.color }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '28px', lineHeight: 1 }}>{category.emoji}</span>
          <h2 className="category-section-title">{category.plural}</h2>
        </div>
        {!loading && places && (
          <span className="category-section-count">
            {places.length === 0 ? 'none found' : `${places.length} found`}
          </span>
        )}
        {hasMore && onShowMore && (
          <button
            onClick={onShowMore}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: category.color,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              padding: 'var(--space-1) 0',
              letterSpacing: '0.04em',
              transition: 'opacity var(--fast) var(--ease)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            View all {places.length} →
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="category-cards-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} color={category.color} />
          ))}
        </div>
      ) : visiblePlaces.length === 0 ? (
        <div style={{
          padding: 'var(--space-10)',
          textAlign: 'center',
          background: 'var(--parchment)',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px dashed var(--border)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: 'var(--space-3)' }}>
            {category.emoji}
          </div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-soft)',
            maxWidth: '300px',
            margin: '0 auto',
          }}>
            {emptyMessage || `No ${category.plural.toLowerCase()} found nearby. Try increasing the search radius.`}
          </p>
        </div>
      ) : (
        <div className="category-cards-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          {visiblePlaces.map((place, i) => (
            <div
              key={place.id}
              style={{
                animation: `fadeUp var(--slow) var(--ease) ${i * 60}ms both`,
              }}
            >
              <PlaceCard place={place} category={category} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
