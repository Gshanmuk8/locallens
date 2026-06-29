import React from 'react'

export default function PremiumLoading({
  variant = 'cardGrid',
  title = 'Fetching nearby places…',
  subtitle = 'Curating locations from OpenStreetMap',
  count = 3,
}) {
  const shimmerBg = `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)`

  if (variant === 'center') {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8)',
          background: 'var(--ivory)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 520,
            textAlign: 'center',
            border: '1.5px solid var(--border)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(250,244,238,0.7) 100%)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: 'var(--space-7)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at 20% 10%, rgba(181,18,74,0.18) 0%, transparent 55%),
                           radial-gradient(ellipse at 80% 90%, rgba(106,27,122,0.16) 0%, transparent 55%)`,
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                margin: '0 auto var(--space-4)',
                background: 'linear-gradient(135deg, rgba(181,18,74,0.20) 0%, rgba(106,27,122,0.14) 100%)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 40px rgba(181,18,74,0.12)',
                fontSize: 28,
              }}
            >
              ✦
            </div>

            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'var(--text-lg)',
                color: 'var(--ink)',
                marginBottom: 'var(--space-2)',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontStyle: 'italic',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-soft)',
                lineHeight: 1.7,
                marginBottom: 'var(--space-6)',
              }}
            >
              {subtitle}
            </div>

            {/* Mini shimmering line */}
            <div
              style={{
                height: 12,
                borderRadius: 'var(--radius-full)',
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(224,200,208,0.8)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: shimmerBg,
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-sweep 1.8s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // cardGrid / panel skeleton
  const gridCount = Math.max(1, Math.min(6, count))
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(242,228,232,0.35) 100%)',
          boxShadow: 'var(--shadow-sm)',
          padding: 'var(--space-6)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 15% 15%, rgba(181,18,74,0.16) 0%, transparent 55%),
                         radial-gradient(ellipse at 85% 85%, rgba(106,27,122,0.14) 0%, transparent 55%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--ink-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-4)',
            }}
          >
            {subtitle}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: variant === 'panel' ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {Array.from({ length: gridCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(224,200,208,0.9)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-5)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: shimmerBg,
                    backgroundSize: '200% 100%',
                    animation: 'skeleton-sweep 1.8s ease-in-out infinite',
                    opacity: 0.9,
                  }}
                />
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        border: '1px solid rgba(224,200,208,0.9)',
                        background: 'rgba(0,0,0,0.04)',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          height: 12,
                          borderRadius: 4,
                          background: 'rgba(0,0,0,0.05)',
                          marginBottom: 8,
                          width: '45%',
                        }}
                      />
                      <div
                        style={{
                          height: 18,
                          borderRadius: 4,
                          background: 'rgba(0,0,0,0.05)',
                          marginBottom: 8,
                          width: '80%',
                        }}
                      />
                      <div
                        style={{
                          height: 13,
                          borderRadius: 4,
                          background: 'rgba(0,0,0,0.05)',
                          width: '55%',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ height: 11, borderRadius: 4, background: 'rgba(0,0,0,0.05)', width: '92%', marginBottom: 'var(--space-4)' }} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                      style={{
                        height: 14,
                        width: 96,
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(0,0,0,0.05)',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid rgba(181,18,74,${0.06 + i * 0.01})`,
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
