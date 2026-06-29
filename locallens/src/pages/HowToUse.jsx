import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const scenarios = [
  {
    emoji: '✈️',
    title: 'You just landed in a new city',
    tag: 'Traveler',
    tagColor: '#B5124A',
    steps: [
      'Open LocalLens on your phone.',
      'Tap "Enable Location" — your GPS does the rest.',
      'Your dashboard shows every restaurant, hotel, cafe, and attraction within 3 km.',
      'Tap any place card for the address and opening hours.',
      'Hit "Get Directions" to navigate there via OpenStreetMap.',
    ],
    insight: 'No WiFi needed for the directions. No signup needed for the results. You\'re eating a good meal within 10 minutes of landing.',
  },
  {
    emoji: '🏘️',
    title: 'You just moved to a new neighbourhood',
    tag: 'New Resident',
    tagColor: '#6A1B7A',
    steps: [
      'Open LocalLens from your home.',
      'Enable location — your dashboard populates automatically.',
      'Browse restaurants, parks, cafes and theaters near you.',
      'Go for a walk. When you move more than 500 metres, the dashboard quietly updates.',
      'Discover places in your new area one walk at a time.',
    ],
    insight: 'The app refreshes automatically as you explore. No manual searching. Within a week you\'ll know your neighbourhood better than people who\'ve lived there for years.',
  },
  {
    emoji: '🗓️',
    title: 'Planning a trip before you leave',
    tag: 'Planner',
    tagColor: '#7C3C2F',
    steps: [
      'Go to the Explore page.',
      'Type your destination — "Goa Beach", "IIT Madras", "Times Square".',
      'LocalLens geocodes the name and shows everything nearby on a map.',
      'Filter by category — tap 🏨 to see only hotels, tap 🍽 for restaurants.',
      'Adjust the radius to 5 km or 10 km to see the broader area.',
    ],
    insight: 'You can scout every destination before arriving. No app install on the destination side, no account needed — just bookmark LocalLens and you have a research tool everywhere.',
  },
  {
    emoji: '☕',
    title: 'Quick break — find something nearby',
    tag: 'Daily Use',
    tagColor: '#B5124A',
    steps: [
      'Open LocalLens.',
      'Enable location (or it\'s already active from last time).',
      'Tap ☕ Cafes in the category filter.',
      'See only cafes on the map — closest first.',
      'Pick one, tap Directions, walk there.',
    ],
    insight: 'The whole flow from opening to walking out the door takes under 30 seconds. No app loading times, no recommendations engine trying to show you sponsored results.',
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Family outing — what\'s here?',
    tag: 'Family',
    tagColor: '#6A1B7A',
    steps: [
      'Open LocalLens wherever you are.',
      'Check 🌳 Parks and 📍 Tourist Attractions in the filter.',
      'See what\'s within 5 km on the map.',
      'Tap any attraction for address, opening hours, and phone if available.',
      'Navigate directly from the app.',
    ],
    insight: 'Works in any city, any country — because it uses OpenStreetMap data which covers the entire world, including smaller towns that Google Maps often misses.',
  },
  {
    emoji: '🚶',
    title: 'Walking around — live discovery',
    tag: 'Explorer',
    tagColor: '#7C3C2F',
    steps: [
      'Enable location and start walking.',
      'Keep LocalLens open in your browser tab.',
      'Every time you move 500 metres or more, the dashboard automatically refreshes.',
      'New places appear as you enter different zones.',
      'No manual refresh needed — ever.',
    ],
    insight: 'This is the strongest feature. Most apps require you to trigger a new search. LocalLens watches your movement and keeps your discovery feed current without any interaction.',
  },
]

const tips = [
  { tip: 'Use the search radius slider to control information density. 1 km for walkable results, 10 km when you\'re driving.' },
  { tip: 'The map and cards are always in sync — click a map marker to see the popup, click a card to see full details.' },
  { tip: 'If you denied location permission, go to Explore and search any place manually. The full app still works.' },
  { tip: 'On mobile, add LocalLens to your home screen via browser "Add to Home Screen" for instant access — no app store needed.' },
  { tip: 'Place details show opening hours, phone number, website, and GPS coordinates when available from OpenStreetMap.' },
  { tip: 'The search remembers nothing between sessions. Every visit starts fresh — your privacy is structurally protected.' },
]

export default function HowToUse() {
  const [open, setOpen] = useState(null)

  return (
    <main style={{ background: 'var(--ivory)', minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(145deg, #2D0A3A 0%, var(--ink) 100%)',
        padding: 'var(--space-16) 0 var(--space-12)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 70% 40%, rgba(106,27,122,0.3) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'var(--text-sm)',
            color: 'rgba(224,196,240,0.7)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-4)',
          }}>How to Use</div>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontWeight: 900,
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            color: 'var(--white)',
            lineHeight: 1.1,
            letterSpacing: '0.03em',
            marginBottom: 'var(--space-6)',
          }}>
            LocalLens in the Real World
          </h1>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.8,
            maxWidth: '580px',
          }}>
            Six real scenarios. Six times the app gets you there faster than any alternative.
          </p>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>

        {/* ── Quick Start ── */}
        <section style={{ marginBottom: 'var(--space-16)' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: 'var(--text-2xl)',
            color: 'var(--ink)',
            marginBottom: 'var(--space-3)',
          }}>The 30-Second Start</h2>
          <div style={{
            width: '60px', height: '3px',
            background: 'linear-gradient(90deg, var(--gold), var(--sage))',
            borderRadius: 'var(--radius-full)',
            marginBottom: 'var(--space-8)',
          }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {[
              { n: '1', text: 'Open LocalLens in any browser' },
              { n: '2', text: 'Tap "Enable Location"' },
              { n: '3', text: 'Allow GPS in the browser prompt' },
              { n: '4', text: 'Your dashboard loads automatically' },
              { n: '5', text: 'Tap any place to explore it' },
            ].map((s) => (
              <div key={s.n} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-4)',
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--gold), var(--sage))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--white)',
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {s.n}
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--ink)',
                  lineHeight: 1.5,
                  paddingTop: '4px',
                }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Scenarios ── */}
        <section style={{ marginBottom: 'var(--space-16)' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: 'var(--text-2xl)',
            color: 'var(--ink)',
            marginBottom: 'var(--space-3)',
          }}>Real Scenarios</h2>
          <div style={{
            width: '60px', height: '3px',
            background: 'linear-gradient(90deg, var(--gold), var(--sage))',
            borderRadius: 'var(--radius-full)',
            marginBottom: 'var(--space-8)',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {scenarios.map((s, i) => (
              <div key={i} style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                borderLeft: `4px solid ${s.tagColor}`,
              }}>
                {/* Header — always visible, clickable */}
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-5) var(--space-6)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      fontSize: 'var(--text-xs)',
                      color: s.tagColor,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '2px',
                    }}>
                      {s.tag}
                    </div>
                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 700,
                      fontSize: 'var(--text-lg)',
                      color: 'var(--ink)',
                      lineHeight: 1.2,
                    }}>
                      {s.title}
                    </h3>
                  </div>
                  <span style={{
                    color: 'var(--ink-muted)',
                    fontSize: '1.2rem',
                    transition: 'transform var(--mid) var(--ease)',
                    transform: open === i ? 'rotate(180deg)' : 'none',
                    flexShrink: 0,
                  }}>
                    ↓
                  </span>
                </button>

                {/* Expandable body */}
                {open === i && (
                  <div style={{
                    padding: 'var(--space-2) var(--space-6) var(--space-6)',
                    borderTop: '1px solid var(--border)',
                    animation: 'fadeUp 200ms var(--ease) both',
                  }}>
                    <ol style={{
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-6)',
                      marginTop: 'var(--space-4)',
                    }}>
                      {s.steps.map((step, j) => (
                        <li key={j} style={{
                          display: 'flex',
                          gap: 'var(--space-3)',
                          alignItems: 'flex-start',
                        }}>
                          <span style={{
                            width: '22px', height: '22px',
                            borderRadius: '50%',
                            background: `${s.tagColor}18`,
                            border: `1px solid ${s.tagColor}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 700,
                            color: s.tagColor,
                            flexShrink: 0,
                            marginTop: '2px',
                          }}>
                            {j + 1}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-base)',
                            color: 'var(--ink-soft)',
                            lineHeight: 1.6,
                          }}>
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                    <div style={{
                      background: `${s.tagColor}0C`,
                      border: `1px solid ${s.tagColor}30`,
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                    }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic',
                        fontSize: 'var(--text-base)',
                        color: 'var(--ink-soft)',
                        lineHeight: 1.7,
                      }}>
                        ✦ {s.insight}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Tips ── */}
        <section style={{ marginBottom: 'var(--space-16)' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: 'var(--text-2xl)',
            color: 'var(--ink)',
            marginBottom: 'var(--space-3)',
          }}>Power User Tips</h2>
          <div style={{
            width: '60px', height: '3px',
            background: 'linear-gradient(90deg, var(--gold), var(--sage))',
            borderRadius: 'var(--radius-full)',
            marginBottom: 'var(--space-8)',
          }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {tips.map((t, i) => (
              <div key={i} style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                display: 'flex',
                gap: 'var(--space-3)',
              }}>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem', flexShrink: 0, marginTop: '2px' }}>✦</span>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink-soft)',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                }}>
                  {t.tip}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4) var(--space-8)',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--sage) 100%)',
            color: 'var(--white)',
            borderRadius: 'var(--radius-full)',
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: 'var(--text-lg)',
            textDecoration: 'none',
            letterSpacing: '0.04em',
            boxShadow: 'var(--shadow-gold)',
          }}>
            📍 Try it now
          </Link>
          <Link to="/explore" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4) var(--space-8)',
            background: 'var(--white)',
            color: 'var(--ink)',
            borderRadius: 'var(--radius-full)',
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: 'var(--text-lg)',
            textDecoration: 'none',
            letterSpacing: '0.04em',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            🔍 Explore a place
          </Link>
        </div>

      </div>
    </main>
  )
}
