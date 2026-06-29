import React, { useState, useCallback, useRef, useEffect } from 'react'
import { geocode } from '../services/nominatim'

const SUGGESTIONS = [
  'Visakhapatnam',
  'Hyderabad',
  'Mumbai',
  'Times Square',
  'IIT Madras',
  'Goa Beach',
  'Bengaluru',
  'Delhi',
]

export default function SearchBar({ onLocationSelected, placeholder = 'Search any place…', autoFocus = false }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await geocode(q)
      setResults(res.slice(0, 6))
      setShowDropdown(true)
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setError(null)
    clearTimeout(debounceRef.current)
    if (val.length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(val), 500)
    } else {
      setResults([])
      setShowDropdown(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    doSearch(query)
  }

  const handleSelect = (result) => {
    setQuery(result.shortName)
    setShowDropdown(false)
    setResults([])
    onLocationSelected?.(result)
  }

  const handleSuggestion = (s) => {
    setQuery(s)
    doSearch(s)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setShowDropdown(false)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Form */}
      <form onSubmit={handleSubmit} role="search" style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--white)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          transition: 'border-color var(--fast) var(--ease), box-shadow var(--fast) var(--ease)',
        }}
          onFocus={() => {}}
        >
          {/* Search icon */}
          <span style={{
            padding: '0 var(--space-4) 0 var(--space-5)',
            fontSize: '20px',
            opacity: 0.5,
            flexShrink: 0,
          }}>
            🔍
          </span>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder={placeholder}
            autoComplete="off"
            aria-label="Search for a place"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--ink)',
              padding: 'var(--space-4) 0',
              minWidth: 0,
            }}
          />

          {/* Loading spinner */}
          {loading && (
            <span style={{
              padding: '0 var(--space-4)',
              fontSize: '18px',
              animation: 'spin 1s linear infinite',
            }}>
              ⏳
            </span>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              margin: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-5)',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--terracotta) 100%)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 'var(--radius-xl)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !query.trim() ? 0.6 : 1,
              whiteSpace: 'nowrap',
              transition: 'all var(--fast) var(--ease)',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => { if (!loading && query.trim()) e.target.style.transform = 'scale(1.03)' }}
            onMouseLeave={(e) => { e.target.style.transform = 'scale(1)' }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <p style={{
          marginTop: 'var(--space-3)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--terracotta)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--terra-pale)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(196,87,42,0.2)',
        }}>
          ⚠ {error}
        </p>
      )}

      {/* Dropdown results */}
      {showDropdown && results.length > 0 && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Search results"
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-2))',
            left: 0,
            right: 0,
            background: 'var(--white)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 200,
            overflow: 'hidden',
            animation: 'fadeUp 180ms var(--ease) both',
          }}
        >
          {results.map((r, i) => (
            <button
              key={i}
              role="option"
              onClick={() => handleSelect(r)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'none',
                border: 'none',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background var(--fast) var(--ease)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--parchment)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: '16px', marginTop: '2px', flexShrink: 0 }}>📍</span>
              <div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink)',
                  lineHeight: 1.3,
                }}>
                  {r.shortName}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink-muted)',
                  lineHeight: 1.4,
                  marginTop: '2px',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {r.displayName}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick suggestions */}
      {!query && (
        <div style={{
          marginTop: 'var(--space-4)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}>
          <span style={{
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--ink-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            alignSelf: 'center',
            marginRight: 'var(--space-1)',
          }}>
            Try:
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                color: 'var(--ink-soft)',
                background: 'var(--parchment)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: 'var(--space-1) var(--space-3)',
                cursor: 'pointer',
                transition: 'all var(--fast) var(--ease)',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--gold-pale)'
                e.target.style.borderColor = 'var(--gold)'
                e.target.style.color = 'var(--ink)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--parchment)'
                e.target.style.borderColor = 'var(--border)'
                e.target.style.color = 'var(--ink-soft)'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
