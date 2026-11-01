import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

/**
 * Navbar Component
 * 
 * Top navigation bar featuring brand identity and route links.
 * Highlights the current active page link automatically using React Router NavLink.
 */
function Navbar({ isAdmin, onSwitchToStudent, currentUser, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper function to apply active link styles
  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link';

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand / Logo */}
        <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
          <span className="brand-icon">🎓</span>
          <span className="brand-title">CampusConnect</span>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-toggle-btn"
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        {/* Navigation Links */}
        <ul className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <li className="nav-item">
            <NavLink to="/" className={getNavLinkClass} onClick={closeMobileMenu} end>
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/events" className={getNavLinkClass} onClick={closeMobileMenu}>
              Events
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/register" className={getNavLinkClass} onClick={closeMobileMenu}>
              Register
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/registered-events" className={getNavLinkClass} onClick={closeMobileMenu}>
              Registered Events
            </NavLink>
          </li>

          {isAdmin ? (
            <>
              <li className="nav-item">
                <NavLink to="/admin" className={getNavLinkClass} onClick={closeMobileMenu}>
                  Admin Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  onClick={() => {
                    closeMobileMenu();
                    onSwitchToStudent();
                  }}
                  title="Switch to Student Site"
                >
                  Switch to Student Site 👤
                </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <NavLink
                to="/admin"
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                onClick={closeMobileMenu}
                title="Switch to Admin Site"
              >
                Admin Portal 🔒
              </NavLink>
            </li>
          )}

          {/* User Account & Logout */}
          {currentUser ? (
            <li className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
              <span
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: '#f1f5f9',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
                title={currentUser.email}
              >
                👤 {currentUser.name?.split(' ')[0]}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                onClick={() => {
                  closeMobileMenu();
                  if (onLogout) onLogout();
                }}
                title="Sign out of your account"
              >
                Logout
              </button>
            </li>
          ) : (
            <li className="nav-item" style={{ marginLeft: '6px' }}>
              <NavLink
                to="/login"
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                onClick={closeMobileMenu}
              >
                Sign In
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
