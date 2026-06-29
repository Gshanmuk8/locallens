import React from 'react'
import PlaceCard from './PlaceCard'
import { getCategoryById } from '../utils/categories'

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
    }}>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: '18px', borderRadius: '4px', marginBottom: '8px', width: '80%' }} />
          <div className="skeleton" style={{ height: '12px', borderRadius: '4px', width: '50%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: '12px', borderRadius: '4px', marginBottom: '6px', width: '100%' }} />
      <div className="skeleton" style={{ height: '12px', borderRadius: '4px', width: '70%' }} />
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
            <SkeletonCard key={i} />
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
