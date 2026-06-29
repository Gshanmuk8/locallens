import React from 'react'
import { Link } from 'react-router-dom'

const features = [
  {
    emoji: '📍',
    title: 'GPS-Powered Discovery',
    desc: 'Open the app and your phone\'s location does the thinking. No city typing, no searching. LocalLens reads your GPS coordinates and instantly surfaces everything interesting around you — from the restaurant two streets away to the park you never noticed.',
  },
  {
    emoji: '🔍',
    title: 'Search Any Place on Earth',
    desc: 'Traveling to Hyderabad next week? Curious about Times Square? Type any city, landmark, or neighborhood and LocalLens maps what\'s nearby — restaurants, hotels, theaters, cafes, parks, and attractions — before you even arrive.',
  },
  {
    emoji: '🗺',
    title: 'Live Interactive Map',
    desc: 'Every result is pinned on a real OpenStreetMap. Category-coloured markers let you see at a glance where restaurants cluster, where the parks are, how far the nearest hotel sits. The map moves with your search.',
  },
  {
    emoji: '🔄',
    title: 'Automatic Location Updates',
    desc: 'Step outside and start walking. When you move more than 500 metres, LocalLens silently re-fetches nearby places without you touching a button. Your dashboard stays relevant wherever you go.',
  },
  {
    emoji: '🎬',
    title: 'Seven Place Categories',
    desc: 'Restaurants, Hotels, Cafes, Theaters, Tourist Attractions, Parks, and Shopping — all fetched in parallel, all showing up progressively so you\'re never staring at a blank screen.',
  },
  {
    emoji: '🎯',
    title: 'Filter & Radius Control',
    desc: 'Too many results? Tap a category to isolate just theaters or just cafes. Adjust the search radius from 1 km to 10 km. The map and cards update instantly.',
  },
  {
    emoji: '🧭',
    title: 'One-Tap Directions',
    desc: 'Found your spot? Every place card has a Directions button that opens OpenStreetMap turn-by-turn navigation. No app install required, no sign-in needed.',
  },
  {
    emoji: '🔒',
    title: 'Zero Accounts, Zero Tracking',
    desc: 'Your location is used once, in your browser, to query public map data. Nothing is stored on any server. No profile, no history, no data selling. Just discovery.',
  },
]

const problems = [
  {
    problem: 'You land in an unfamiliar city at 9 PM, hungry, with no idea what\'s nearby.',
    solution: 'LocalLens shows you every open restaurant within walking distance in seconds.',
  },
  {
    problem: 'You\'re planning a trip and want to know what\'s actually around your hotel before booking.',
    solution: 'Search the hotel\'s address — see theaters, cafes, and attractions within 1 km instantly.',
  },
  {
    problem: 'You moved to a new neighbourhood and want to discover what\'s around you.',
    solution: 'Enable location once. Your personal discovery dashboard updates every time you go outside.',
  },
  {
    problem: 'Every map app wants an account, your email, your data, and a rating before it shows you anything.',
    solution: 'LocalLens requires nothing. Open → discover → go.',
  },
]

export default function About() {
  return (
    <main style={{ background: 'var(--ivory)', minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(145deg, var(--ink) 0%, #3D0830 100%)',
        padding: 'var(--space-16) 0 var(--space-12)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(181,18,74,0.2) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'var(--text-sm)',
            color: 'rgba(253,173,194,0.7)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-4)',
          }}>About the App</div>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: 'var(--white)',
            lineHeight: 1.1,
            letterSpacing: '0.04em',
            marginBottom: 'var(--space-6)',
          }}>
            LocalLens
          </h1>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.8,
            maxWidth: '620px',
          }}>
            The world is full of places worth finding. Most of them are three minutes from where you're standing right now. LocalLens makes sure you never miss them.
          </p>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>

        {/* ── The Problem ── */}
        <section style={{ marginBottom: 'var(--space-16)' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: 'var(--text-2xl)',
            color: 'var(--ink)',
            marginBottom: 'var(--space-3)',
            letterSpacing: '-0.02em',
          }}>The Problem We Solve</h2>
          <div style={{
            width: '60px', height: '3px',
            background: 'linear-gradient(90deg, var(--gold), var(--sage))',
            borderRadius: 'var(--radius-full)',
            marginBottom: 'var(--space-8)',
          }} />

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            color: 'var(--ink-soft)',
            lineHeight: 1.9,
            maxWidth: '720px',
            fontStyle: 'italic',
            marginBottom: 'var(--space-8)',
          }}>
            Every existing map app is built around navigation — getting you from Point A to Point B. But sometimes you don't have a destination. You just want to know: <em style={{ color: 'var(--gold)' }}>"What's around me right now?"</em>
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--ink-soft)',
            lineHeight: 1.9,
            maxWidth: '720px',
            marginBottom: 'var(--space-8)',
          }}>
            Existing tools make you sign up, rate places, follow people, and dig through layers of UI before you see a single result. LocalLens was built on a single principle: open the app, get the answer. No accounts. No social features. No AI chat. Just the places around you, right now.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--space-6)',
          }}>
            {problems.map((p, i) => (
              <div key={i} style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                borderLeft: '4px solid var(--gold)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink-soft)',
                  fontStyle: 'italic',
                  marginBottom: 'var(--space-3)',
                  lineHeight: 1.6,
                }}>
                  "{p.problem}"
                </p>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--gold)',
                  fontWeight: 600,
                  lineHeight: 1.6,
                }}>
                  ✦ {p.solution}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ marginBottom: 'var(--space-16)' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: 'var(--text-2xl)',
            color: 'var(--ink)',
            marginBottom: 'var(--space-3)',
            letterSpacing: '-0.02em',
          }}>What LocalLens Does</h2>
          <div style={{
            width: '60px', height: '3px',
            background: 'linear-gradient(90deg, var(--gold), var(--sage))',
            borderRadius: 'var(--radius-full)',
            marginBottom: 'var(--space-10)',
          }} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                transition: 'all var(--mid) var(--ease)',
                animation: `fadeUp var(--slow) var(--ease) ${i * 60}ms both`,
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: 'var(--space-4)', lineHeight: 1 }}>
                  {f.emoji}
                </div>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700,
                  fontSize: 'var(--text-lg)',
                  color: 'var(--ink)',
                  marginBottom: 'var(--space-3)',
                  lineHeight: 1.2,
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink-soft)',
                  lineHeight: 1.8,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech ── */}
        <section style={{
          background: 'linear-gradient(135deg, var(--parchment) 0%, var(--sage-pale) 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-10)',
          border: '1px solid var(--border)',
          marginBottom: 'var(--space-12)',
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: 'var(--text-xl)',
            color: 'var(--ink)',
            marginBottom: 'var(--space-6)',
          }}>
            Built on Open Data — 100% Free
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--ink-soft)',
            lineHeight: 1.9,
            maxWidth: '640px',
            marginBottom: 'var(--space-6)',
          }}>
            LocalLens runs entirely in your browser using free, open-source geographic data. There is no paid API, no subscription, no backend server. Every map tile, every place result, every geocoded address comes from the OpenStreetMap community — the world's largest collaborative map project.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {[
              { name: 'OpenStreetMap', role: 'Map tiles & place data' },
              { name: 'Nominatim', role: 'Location search' },
              { name: 'Overpass API', role: 'Nearby places' },
              { name: 'Leaflet.js', role: 'Map rendering' },
              { name: 'React + Vite', role: 'Frontend framework' },
            ].map((t) => (
              <div key={t.name} style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: 'var(--space-2) var(--space-5)',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'var(--text-sm)',
              }}>
                <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{t.name}</span>
                <span style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}> — {t.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4) var(--space-10)',
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
            📍 Start Discovering
          </Link>
        </div>

      </div>
    </main>
  )
}
