import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const baseNav = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'rgba(253,246,240,0.92)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderBottom: '1px solid var(--border)',
  transition: 'box-shadow var(--mid) var(--ease)',
}

const linkStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  padding: 'var(--space-2) var(--space-4)',
  borderRadius: 'var(--radius-full)',
  transition: 'all var(--fast) var(--ease)',
  letterSpacing: '0.01em',
}

const linkActiveStyle = {
  color: 'var(--ink)',
  background: 'var(--parchment)',
  fontWeight: 600,
}

const exploreBtnStyle = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  fontStyle: 'italic',
  color: 'var(--white)',
  textDecoration: 'none',
  padding: 'var(--space-2) var(--space-5)',
  borderRadius: 'var(--radius-full)',
  background: 'linear-gradient(135deg, var(--gold) 0%, var(--sage) 100%)',
  boxShadow: '0 2px 12px rgba(194,24,91,0.35)',
  transition: 'all var(--fast) var(--ease)',
  letterSpacing: '0.04em',
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '36px',
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      ...baseNav,
      boxShadow: scrolled ? '0 2px 20px rgba(45,27,46,0.12)' : 'none',
    }}>
      {/* ── Main bar ── */}
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--sage) 100%)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 2px 10px rgba(194,24,91,0.4)',
          }}>🔍</div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{
              fontFamily: "'Cinzel Decorative', 'Cormorant Garamond', serif",
              fontWeight: 700, fontSize: 'var(--text-md)',
              color: 'var(--ink)', letterSpacing: '0.05em',
            }}>LocalLens</span>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '10px', fontStyle: 'italic',
              color: 'var(--ink-muted)', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>Discover nearby</span>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="navbar-links" aria-label="Main navigation">
          <Link to="/" style={{ ...linkStyle, ...(isActive('/') ? linkActiveStyle : {}) }}>
            Home
          </Link>
          <Link to="/about" style={{ ...linkStyle, ...(isActive('/about') ? linkActiveStyle : {}) }}>
            About
          </Link>
          <Link to="/how-to-use" style={{ ...linkStyle, ...(isActive('/how-to-use') ? linkActiveStyle : {}) }}>
            How to Use
          </Link>
          <Link
            to="/explore"
            style={exploreBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(194,24,91,0.45)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(194,24,91,0.35)'
            }}
          >
            Explore →
          </Link>
        </nav>

        {/* Hamburger — mobile only (shown via CSS) */}
        <button
          className="nav-hamburger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <div className={`nav-drawer${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <Link to="/" style={{ ...linkStyle, fontSize: 'var(--text-base)', display: 'block', textAlign: 'center', ...(isActive('/') ? linkActiveStyle : {}) }}>
          🏠 Home
        </Link>
        <Link to="/about" style={{ ...linkStyle, fontSize: 'var(--text-base)', display: 'block', textAlign: 'center', ...(isActive('/about') ? linkActiveStyle : {}) }}>
          📖 About
        </Link>
        <Link to="/how-to-use" style={{ ...linkStyle, fontSize: 'var(--text-base)', display: 'block', textAlign: 'center', ...(isActive('/how-to-use') ? linkActiveStyle : {}) }}>
          💡 How to Use
        </Link>
        <Link to="/explore" style={{ ...exploreBtnStyle, width: '100%', justifyContent: 'center', fontSize: 'var(--text-base)', padding: 'var(--space-3) var(--space-5)' }}>
          🔍 Explore Anywhere →
        </Link>
      </div>
    </nav>
  )
}
