import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Navbar — Premium dark SaaS navigation with avatar dropdown.
 */
function Navbar({ isAdmin, onSwitchToStudent, currentUser, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getNavLinkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
          <div className="brand-icon-wrap">
            <span style={{ fontSize: '1rem' }}>🎓</span>
          </div>
          <span className="brand-title">CampusConnect</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className={`nav-menu${mobileMenuOpen ? ' open' : ''}`}>
          <li>
            <NavLink to="/" className={getNavLinkClass} onClick={closeMobileMenu} end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/events" className={getNavLinkClass} onClick={closeMobileMenu}>
              Explore Events
            </NavLink>
          </li>
          {!isAdmin && (
            <li>
              <NavLink to="/registered-events" className={getNavLinkClass} onClick={closeMobileMenu}>
                My Registrations
              </NavLink>
            </li>
          )}
          {isAdmin && (
            <li>
              <NavLink to="/admin" className={getNavLinkClass} onClick={closeMobileMenu}>
                Admin Dashboard
              </NavLink>
            </li>
          )}

          {/* Mobile-only user section */}
          <li style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'none' }}
              className="mobile-only-user">
            {currentUser && (
              <>
                <div style={{ padding: '8px 16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Signed in as <strong style={{ color: 'var(--text-primary)' }}>{currentUser.name}</strong>
                </div>
                {isAdmin && (
                  <button className="btn btn-secondary" style={{ width: '100%', marginTop: '8px' }}
                    onClick={() => { closeMobileMenu(); onSwitchToStudent(); }}>
                    Switch to Student Site
                  </button>
                )}
                <button className="btn btn-danger" style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => { closeMobileMenu(); if (onLogout) onLogout(); }}>
                  Sign Out
                </button>
              </>
            )}
          </li>
        </ul>

        {/* Right: Nav Actions */}
        <div className="nav-actions">
          {currentUser ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                className="nav-user-btn"
                onClick={() => setDropdownOpen(prev => !prev)}
                aria-label="User menu"
              >
                <div className="nav-avatar">
                  {getInitials(currentUser.name)}
                </div>
                <span className="nav-username">{currentUser.name?.split(' ')[0]}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="nav-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <div className="nav-dropdown-header">
                      <div className="nav-dropdown-name">{currentUser.name}</div>
                      <div className="nav-dropdown-email">{currentUser.email}</div>
                      {currentUser.role && (
                        <div style={{ marginTop: '4px' }}>
                          <span className="badge-count" style={{ fontSize: '0.7rem' }}>
                            {currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN' ? 'Administrator' : 'Student'}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      to="/registered-events"
                      className="nav-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      My Registrations
                    </Link>

                    {isAdmin && (
                      <>
                        <Link to="/admin" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                          </svg>
                          Admin Dashboard
                        </Link>
                        <button className="nav-dropdown-item" onClick={() => { setDropdownOpen(false); onSwitchToStudent(); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          Switch to Student
                        </button>
                      </>
                    )}

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />

                    <button
                      className="nav-dropdown-item danger"
                      onClick={() => { setDropdownOpen(false); if (onLogout) onLogout(); }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}

          {/* Mobile Toggle */}
          <button
            className="mobile-toggle-btn"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            <span className="hamburger-bar" style={mobileMenuOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
            <span className="hamburger-bar" style={mobileMenuOpen ? { opacity: 0 } : {}} />
            <span className="hamburger-bar" style={mobileMenuOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
