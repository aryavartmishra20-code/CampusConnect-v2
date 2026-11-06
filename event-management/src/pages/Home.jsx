import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import EventCard from '../components/EventCard';
import { getStudentRegisteredEvents } from '../services/eventService';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] },
  }),
};

const CATEGORIES = [
  { label: 'Technology', icon: '💻', value: 'Technical' },
  { label: 'Cultural',   icon: '🎭', value: 'Cultural'  },
  { label: 'Sports',     icon: '⚽', value: 'Sports'    },
  { label: 'Workshops',  icon: '🛠️', value: 'Workshop'  },
  { label: 'Entrepreneur', icon: '🚀', value: 'Technical' },
];

function Home({ events, isAdmin, currentUser }) {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');

  const upcomingEvents = events.slice(0, 3);
  const studentRegistrations = getStudentRegisteredEvents(currentUser?.email);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/events?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="page home-page">

      {/* ── Hero Section ── */}
      <motion.section className="hero-section" initial="hidden" animate="visible">
        <div className="hero-bg-gradient" />
        <div className="hero-bg-orb-1" />
        <div className="hero-bg-orb-2" />

        <div className="hero-content">
          <motion.div variants={fadeUp} custom={0}>
            <span className="hero-pill">
              <span>🔥</span> Happening on Campus
            </span>
          </motion.div>

          <motion.h1 className="hero-title" variants={fadeUp} custom={1}>
            Discover what's{' '}
            <span className="hero-title-gradient">happening on campus.</span>
          </motion.h1>

          <motion.p className="hero-tagline" variants={fadeUp} custom={2}>
            Your all-in-one platform for hackathons, cultural festivals, sports tournaments,
            and skill workshops. Never miss a moment of campus life.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            className="hero-search-bar"
            onSubmit={handleHeroSearch}
            variants={fadeUp}
            custom={3}
          >
            <div className="hero-search-wrap">
              <svg className="hero-search-icon" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search events, workshops, hackathons…"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: '0 10px 10px 0', flexShrink: 0 }}
            >
              Search
            </button>
          </motion.form>

          <motion.div className="hero-actions" variants={fadeUp} custom={4}>
            <Link to="/events" className="btn btn-primary btn-large">
              Explore Events
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            {isAdmin ? (
              <Link to="/admin" className="btn btn-outline btn-large">
                Admin Dashboard
              </Link>
            ) : (
              <Link to="/registered-events" className="btn btn-outline btn-large">
                My Registrations 🎟️
              </Link>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Stats Bar ── */}
      <motion.section
        className="highlights-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="highlight-item">
          <div className="highlight-number">{events.length}+</div>
          <div className="highlight-label">Active Events</div>
        </div>
        <div className="highlight-item">
          <div className="highlight-number">5</div>
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
      </motion.section>

      {/* ── Registered Events (shown when student has bookings) ── */}
      {studentRegistrations.length > 0 && (
        <motion.section
          className="section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-header">
            <div>
              <div className="section-label">🎟️ Confirmed Passes</div>
              <h2 className="section-title">Your Registered Events</h2>
              <p className="section-subtitle">Events you are officially signed up for.</p>
            </div>
            <Link to="/registered-events" className="section-link">
              View All ({studentRegistrations.length}) →
            </Link>
          </div>

          <div className="events-grid">
            {studentRegistrations.slice(0, 3).map((reg, i) => (
              <motion.div
                key={reg.registrationId}
                className="event-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <div className="event-card-image-wrap">
                  <img src={reg.imageUrl} alt={reg.title} className="event-card-image"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'; }} />
                  <div className="event-card-image-overlay" />
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'var(--success)', color: '#fff',
                    fontSize: '0.72rem', fontWeight: 700,
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    ✓ Confirmed
                  </span>
                </div>
                <div className="event-card-body">
                  <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--violet)', fontWeight: 700 }}>
                    #REG-{reg.registrationId}
                  </span>
                  <h3 className="event-title">{reg.title}</h3>
                  <div className="event-meta">
                    <div className="meta-item">
                      <svg className="meta-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{reg.date} at {reg.time}</span>
                    </div>
                    <div className="meta-item">
                      <svg className="meta-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{reg.venue}</span>
                    </div>
                  </div>
                  <div className="event-card-footer">
                    <Link to="/registered-events" className="btn btn-outline btn-block" style={{ fontSize: '0.84rem' }}>
                      View Ticket Pass 🎫
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Featured Events ── */}
      <motion.section
        className="section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-header">
          <div>
            <div className="section-label">⚡ Featured</div>
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">Hand-picked events scheduled for this semester.</p>
          </div>
          <Link to="/events" className="section-link">See All Events →</Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="events-grid">
            {upcomingEvents.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No Upcoming Events</h3>
            <p>No events available at the moment. Check back soon!</p>
          </div>
        )}
      </motion.section>

      {/* ── Categories ── */}
      <motion.section
        className="section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ marginBottom: 24 }}>
          <div className="section-label">🏷️ Browse By Type</div>
          <h2 className="section-title">Event Categories</h2>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
            >
              <Link to="/events" className="category-pill-card">
                <span className="category-pill-icon">{cat.icon}</span>
                <span className="category-pill-label">{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Why Join ── */}
      <motion.section
        className="section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>✨ Benefits</div>
          <h2 className="section-title">Why Participate?</h2>
        </div>
        <div className="features-grid">
          {[
            { icon: '🚀', title: 'Skill Enhancement', desc: 'Learn cutting-edge skills through hands-on technical workshops and bootcamps led by industry leaders.' },
            { icon: '🤝', title: 'Networking',        desc: 'Connect with fellow students, alumni, faculty, and industry leaders from across different departments.' },
            { icon: '🏆', title: 'Prizes & Certificates', desc: 'Earn official certificates, cash prizes, medals, and recognition for your resume and portfolio.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <div className="feature-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

export default Home;
