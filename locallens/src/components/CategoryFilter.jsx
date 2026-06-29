import React from 'react'
import { CATEGORIES } from '../utils/categories'

export default function CategoryFilter({ selected, onChange }) {
  const allSelected = !selected || selected.length === 0

  const toggle = (id) => {
    if (selected?.includes(id)) {
      const next = selected.filter((s) => s !== id)
      onChange(next.length === 0 ? [] : next)
    } else {
      onChange([...(selected || []), id])
    }
  }

  const selectAll = () => onChange([])

  return (
    <div
      role="group"
      aria-label="Filter by category"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
      }}
    >
      {/* All pill */}
      <button
        onClick={selectAll}
        aria-pressed={allSelected}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: allSelected ? 700 : 500,
          color: allSelected ? 'var(--white)' : 'var(--ink-soft)',
          background: allSelected
            ? 'linear-gradient(135deg, var(--gold) 0%, var(--terracotta) 100%)'
            : 'var(--parchment)',
          border: `1.5px solid ${allSelected ? 'transparent' : 'var(--border)'}`,
          borderRadius: 'var(--radius-full)',
          padding: 'var(--space-2) var(--space-4)',
          cursor: 'pointer',
          transition: 'all var(--fast) var(--ease)',
          boxShadow: allSelected ? 'var(--shadow-gold)' : 'none',
          letterSpacing: '0.01em',
        }}
      >
        All
      </button>

      {CATEGORIES.map((cat) => {
        const active = selected?.includes(cat.id)
        return (
          <button
            key={cat.id}
            onClick={() => toggle(cat.id)}
            aria-pressed={active}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: active ? 700 : 500,
              color: active ? 'var(--white)' : 'var(--ink-soft)',
              background: active ? cat.color : 'var(--parchment)',
              border: `1.5px solid ${active ? cat.color : 'var(--border)'}`,
              borderRadius: 'var(--radius-full)',
              padding: 'var(--space-2) var(--space-4)',
              cursor: 'pointer',
              transition: 'all var(--fast) var(--ease)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = cat.color
                e.currentTarget.style.color = cat.color
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--ink-soft)'
              }
            }}
          >
            <span style={{ fontSize: '14px' }}>{cat.emoji}</span>
            {cat.plural}
          </button>
        )
      })}
    </div>
  )
}
