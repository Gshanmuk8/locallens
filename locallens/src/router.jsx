import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Explore from './pages/Explore'
import PlaceDetails from './pages/PlaceDetails'
import About from './pages/About'
import HowToUse from './pages/HowToUse'
import Directions from './pages/Directions'

function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-6)',
      padding: 'var(--space-8)',
      textAlign: 'center',
      background: 'var(--ivory)',
    }}>
      <div style={{ fontSize: '64px' }}>🗺</div>
      <h2 style={{
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: 'var(--text-2xl)',
        color: 'var(--ink)',
      }}>
        Page not found
      </h2>
      <Link
        to="/"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 'var(--text-base)',
          color: 'var(--gold)',
          textDecoration: 'none',
          padding: 'var(--space-3) var(--space-6)',
          border: '1px solid var(--gold)',
          borderRadius: 'var(--radius-full)',
        }}
      >
        ← Back to Home
      </Link>
    </div>
  )
}

// Wraps every page with the footer
function PageLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </div>
  )
}

export default function Router() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<PageLayout><Home /></PageLayout>} />
        <Route path="/explore" element={<PageLayout><Explore /></PageLayout>} />
        <Route path="/place/:osmType/:osmId" element={<PageLayout><PlaceDetails /></PageLayout>} />
        <Route path="/about" element={<PageLayout><About /></PageLayout>} />
        <Route path="/how-to-use" element={<PageLayout><HowToUse /></PageLayout>} />
        <Route path="/directions" element={<PageLayout><Directions /></PageLayout>} />
        <Route path="*" element={<PageLayout><NotFound /></PageLayout>} />
      </Routes>
    </BrowserRouter>
  )
}
