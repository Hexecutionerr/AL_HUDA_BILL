import React, { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'

const NavBar = () => {
  const location = useLocation()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')))
  const [open, setOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('profile')))
  }, [location])

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!user) return null

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
        </svg>
      ),
    },
    {
      to: '/invoice',
      label: 'New Invoice',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
    },
    {
      to: '/invoices',
      label: 'Invoices',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
        </svg>
      ),
    },
    {
      to: '/customers',
      label: 'Customers',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9"/>
        </svg>
      ),
    },
  ]

  const activeRoute = location.pathname

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          top: '50%',
          left: open ? '16rem' : '0',
          transform: 'translateY(-50%)',
          zIndex: 1100,
          background: '#0f766e',
          border: 'none',
          borderRadius: '0 10px 10px 0',
          width: '28px',
          height: '56px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '3px 0 12px rgba(0,0,0,0.25)',
          transition: 'left 300ms ease',
          color: '#fff',
          fontSize: '16px',
          padding: 0,
        }}
        title={open ? 'Close menu' : 'Open menu'}
      >
        {open ? '‹' : '›'}
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 900,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Slide-in Drawer ── */}
      <nav
        ref={navRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '16rem',
          background: '#1a1a2e',
          zIndex: 1000,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: open ? '4px 0 24px rgba(0,0,0,0.35)' : 'none',
          overflowY: 'auto',
        }}
      >
        {/* Logo / Brand */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #0f766e, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: '800', color: '#fff', flexShrink: 0,
          }}>A</div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '15px', lineHeight: 1 }}>AL Huda</div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>Invoice Manager</div>
          </div>
        </div>

        {/* Nav Links */}
        <ul style={{ listStyle: 'none', padding: '12px 10px', margin: 0, flex: 1 }}>
          {navLinks.map(({ to, label, icon }) => {
            const isActive = activeRoute === to || (to !== '/' && activeRoute.startsWith(to) && to !== '/invoice')
            return (
              <li key={to} style={{ marginBottom: '4px' }}>
                <Link
                  to={to}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: isActive ? '#fff' : '#94a3b8',
                    background: isActive ? 'linear-gradient(135deg, #0f766e22, #0d948822)' : 'transparent',
                    borderLeft: isActive ? '3px solid #0f766e' : '3px solid transparent',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e2e8f0' }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' } }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{icon}</span>
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          color: '#475569',
          fontSize: '11px',
        }}>
          AL Huda © {new Date().getFullYear()}
        </div>
      </nav>
    </>
  )
}

export default NavBar
