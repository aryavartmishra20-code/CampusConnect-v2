import React from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { getStudentRegisteredEvents } from '../services/eventService';

/**
 * Home Page Component
 * 
 * Landing page with:
 *  - Hero banner with title, tagline, and CTA button.
 *  - Quick feature highlights.
 *  - Registered Events section showing events the student has signed up for.
 *  - Upcoming events section dynamically rendered from shared events state.
 */
function Home({ events, isAdmin, currentUser }) {
  // Take the first 3 or 4 upcoming events for the home preview
  const upcomingEvents = events.slice(0, 3);

  // Retrieve events registered by the current logged-in student
  const studentRegistrations = getStudentRegisteredEvents(currentUser?.email);

  return (
    <div className="page home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-pill">🔥 Happening on Campus</span>
          <h1 className="hero-title">CampusConnect Event Portal</h1>
          <p className="hero-tagline">
            Discover hackathons, cultural festivals, sports tournaments, and technical workshops all in one place. Never miss a moment of college life!
          </p>
          <div className="hero-actions">
            <Link to="/events" className="btn btn-primary btn-large">
              View All Events
            </Link>
            {isAdmin ? (
              <Link to="/admin" className="btn btn-outline btn-large">
                Admin Dashboard
              </Link>
            ) : (
              <Link to="/registered-events" className="btn btn-outline btn-large">
                Registered Events 🎟️
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Highlights / Quick Stats Bar */}
      <section className="highlights-bar">
        <div className="highlight-item">
          <div className="highlight-number">{events.length}+</div>
          <div className="highlight-label">Active Events</div>
        </div>
        <div className="highlight-item">
          <div className="highlight-number">4</div>
          <div className="highlight-label">Categories</div>
        </div>
        <div className="highlight-item">
          <div className="highlight-number">
            {studentRegistrations.length > 0 ? studentRegistrations.length : '100%'}
          </div>
          <div className="highlight-label">
            {studentRegistrations.length > 0 ? 'Your Bookings' : 'Free Registration'}
          </div>
        </div>
        <div className="highlight-item">
          <div className="highlight-number">24/7</div>
          <div className="highlight-label">Campus Access</div>
        </div>
      </section>

      {/* Registered Events Section (Prominent when student has registered events) */}
      {studentRegistrations.length > 0 && (
        <section
          className="section registered-events-home-section"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '28px 24px',
            border: '1px solid #e2e8f0',
            marginBottom: '40px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)'
          }}
        >
          <div className="section-header" style={{ marginBottom: '20px' }}>
            <div>
              <span
                style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  padding: '3px 10px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-block',
                  marginBottom: '6px'
                }}
              >
                🎟️ Confirmed Passes
              </span>
              <h2 className="section-title">Registered Events</h2>
              <p className="section-subtitle">
                Events you are officially registered to attend.
              </p>
            </div>
            <Link to="/registered-events" className="section-link">
              View All Passes ({studentRegistrations.length}) &rarr;
            </Link>
          </div>

          <div className="events-grid">
            {studentRegistrations.slice(0, 3).map((reg) => (
              <div
                key={reg.registrationId}
                className="event-card"
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                  <img
                    src={reg.imageUrl}
                    alt={reg.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px'
                    }}
                  >
                    Confirmed ✓
                  </span>
                </div>
                <div style={{ padding: '16px', flex: '1', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                    #REG-{reg.registrationId}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0', color: '#0f172a' }}>
                    {reg.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div>📅 {reg.date} at {reg.time}</div>
                    <div>📍 {reg.venue}</div>
                  </div>
                  <Link
                    to="/registered-events"
                    className="btn btn-outline"
                    style={{ marginTop: 'auto', fontSize: '0.8rem', padding: '6px 12px', textAlign: 'center' }}
                  >
                    View Ticket Pass 🎫
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured / Upcoming Events Section */}
      <section className="section upcoming-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">
              Hand-picked featured events scheduled for this semester.
            </p>
          </div>
          <Link to="/events" className="section-link">
            See All Events &rarr;
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="events-grid">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No upcoming events available at this moment. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Why Join Section */}
      <section className="section why-join-section">
        <h2 className="section-title text-center">Why Participate?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Skill Enhancement</h3>
            <p>Learn cutting-edge skills through hands-on technical workshops and bootcamps led by industry leaders.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Networking</h3>
            <p>Connect with fellow students, alumni, faculty, and industry leaders from across different departments.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Prizes & Certificates</h3>
            <p>Earn official college certificates, cash prizes, medals, and recognition for your resume and portfolio.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
