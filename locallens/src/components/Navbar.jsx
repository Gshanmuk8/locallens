import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const isActive = (p) => location.pathname === p

  const navLink = (to, label) => (
    <Link
      key={to}
      to={to}
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '0.95rem',
        fontWeight: isActive(to) ? 700 : 400,
        fontStyle: 'italic',
        color: isActive(to) ? 'var(--gold)' : 'var(--ink-soft)',
        textDecoration: 'none',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        background: isActive(to) ? 'var(--gold-pale)' : 'transparent',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        transition: 'color var(--fast) var(--ease)',
      }}
      onMouseEnter={(e) => { if (!isActive(to)) e.currentTarget.style.color = 'var(--gold)' }}
      onMouseLeave={(e) => { if (!isActive(to)) e.currentTarget.style.color = 'var(--ink-soft)' }}
    >
      {label}
    </Link>
  )

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(253,246,240,0.96)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: scrolled ? '0 2px 16px rgba(45,27,46,0.09)' : 'none',
      transition: 'box-shadow var(--mid) var(--ease)',
    }}>
      {/* ── Main bar ── */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0 var(--space-6)', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative',
      }}>

        {/* Logo — left */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--sage) 100%)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '17px', boxShadow: '0 2px 8px rgba(181,18,74,0.3)',
          }}>🗺</div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontWeight: 700, fontSize: '0.9rem',
              color: 'var(--ink)', letterSpacing: '0.06em',
            }}>LocalLens</span>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '9px', fontStyle: 'italic',
              color: 'var(--ink-muted)', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>Discover nearby</span>
          </div>
        </Link>

        {/* Nav links — right (desktop) */}
        <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navLink('/', '🏠 Home')}
          {navLink('/about', '📖 About')}
          {navLink('/how-to-use', '💡 How to Use')}

          <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 8px' }} />

          <Link
            to="/explore"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '0.95rem', fontWeight: 600, fontStyle: 'italic',
              color: 'var(--white)', textDecoration: 'none',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--sage) 100%)',
              boxShadow: '0 2px 10px rgba(181,18,74,0.28)',
              letterSpacing: '0.04em', whiteSpace: 'nowrap',
              transition: 'all var(--fast) var(--ease)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(181,18,74,0.4)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(181,18,74,0.28)' }}
          >
            Explore →
          </Link>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="nav-hamburger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
          style={{ flexShrink: 0 }}
        >
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '64px', left: 0, right: 0,
          background: 'rgba(253,246,240,0.98)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(45,27,46,0.12)',
          zIndex: 99,
          animation: 'fadeUp 180ms var(--ease) both',
          padding: 'var(--space-3) var(--space-4) var(--space-4)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-1)',
        }}>
          {[
            { to: '/', label: '🏠 Home' },
            { to: '/about', label: '📖 About' },
            { to: '/how-to-use', label: '💡 How to Use' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.05rem', fontStyle: 'italic',
              fontWeight: isActive(to) ? 700 : 400,
              color: isActive(to) ? 'var(--gold)' : 'var(--ink)',
              textDecoration: 'none',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: isActive(to) ? 'var(--gold-pale)' : 'transparent',
              display: 'flex', alignItems: 'center',
              letterSpacing: '0.02em',
            }}>
              {label}
            </Link>
          ))}
          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
          <Link to="/explore" style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.05rem', fontWeight: 600, fontStyle: 'italic',
            color: 'var(--white)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '13px 20px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--sage) 100%)',
            boxShadow: '0 2px 10px rgba(181,18,74,0.3)',
            letterSpacing: '0.04em',
          }}>
            🔍 Explore Anywhere →
          </Link>
        </div>
      )}
    </nav>
  )
}
