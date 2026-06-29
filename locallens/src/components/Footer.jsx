import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(145deg, var(--ink) 0%, #3D0830 100%)',
      color: 'var(--white)',
      marginTop: 'auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative top border */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, var(--gold), var(--sage), var(--gold))',
      }} />

      {/* Atmospheric glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 100%, rgba(181,18,74,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Main footer grid ── */}
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--space-8)',
            padding: 'var(--space-10) 0 var(--space-8)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >

          {/* Brand */}
          <div>
            <div style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontWeight: 900,
              fontSize: 'var(--text-lg)',
              color: 'var(--white)',
              letterSpacing: '0.08em',
              marginBottom: 'var(--space-3)',
            }}>
              LocalLens
            </div>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'var(--text-sm)',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.8,
              maxWidth: '220px',
            }}>
              Every street holds a story. What's waiting around the corner?
            </p>
          </div>

          {/* Navigate */}
          <div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'var(--text-xs)',
              color: 'rgba(253,173,194,0.6)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-5)',
            }}>
              Navigate
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { to: '/', label: '🏠 Home' },
                { to: '/explore', label: '🔍 Explore' },
              ].map((l) => (
                <Link key={l.to} to={l.to} style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'var(--text-base)',
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  transition: 'color var(--fast) var(--ease)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold-pale)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Learn */}
          <div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'var(--text-xs)',
              color: 'rgba(253,173,194,0.6)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-5)',
            }}>
              Learn
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { to: '/about', label: '📖 About the App' },
                { to: '/how-to-use', label: '💡 How to Use' },
              ].map((l) => (
                <Link key={l.to} to={l.to} style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'var(--text-base)',
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  transition: 'color var(--fast) var(--ease)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold-pale)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Powered by */}
          <div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'var(--text-xs)',
              color: 'rgba(253,173,194,0.6)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-5)',
            }}>
              Open Data
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                'OpenStreetMap',
                'Nominatim',
                'Overpass API',
                'Leaflet.js',
              ].map((t) => (
                <span key={t} style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: 'var(--text-sm)',
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.02em',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="footer-bottom"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            padding: 'var(--space-5) 0',
          }}
        >
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'var(--text-sm)',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.04em',
          }}>
            © 2026 LocalLens. All rights reserved.
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'var(--text-sm)',
            color: 'rgba(253,173,194,0.5)',
            letterSpacing: '0.06em',
          }}>
            ✦ Enjoy the app ✦
          </p>
        </div>

      </div>
    </footer>
  )
}
