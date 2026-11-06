import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getStudentRegisteredEvents, cancelEventRegistration } from '../services/eventService';

/**
 * Registered Events Page — Premium dark card layout with cancellation & print pass.
 */
function RegisteredEvents({ currentUser, events }) {
  const navigate = useNavigate();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadRegistrations();
  }, [currentUser]);

  const loadRegistrations = () => {
    const list = getStudentRegisteredEvents(currentUser?.email);
    setRegisteredEvents(list);
  };

  const handleCancelRegistration = (regId, eventTitle) => {
    cancelEventRegistration(regId);
    setRegisteredEvents((prev) => prev.filter((r) => r.registrationId !== regId));
    setCancellingId(null);
    setFeedbackMessage({ type: 'success', text: `Registration for "${eventTitle}" cancelled.` });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const filteredEvents = registeredEvents.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.registrationId).includes(searchQuery);
    const matchesCategory =
      selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(registeredEvents.map((r) => r.category).filter(Boolean))];

  const handlePrintPass = (event) => {
    const printWindow = window.open('', '_blank', 'width=650,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CampusConnect Pass #${event.registrationId}</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 30px; color: #0f172a; background: #fff; }
            .pass-card { border: 2px dashed #8B5CF6; border-radius: 12px; padding: 28px; max-width: 520px; margin: 0 auto; }
            .pass-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 14px; margin-bottom: 18px; }
            .brand { font-size: 20px; font-weight: 800; color: #8B5CF6; }
            .tag { background: #ecfdf5; color: #047857; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
            .event-title { font-size: 22px; font-weight: 800; margin: 10px 0 16px; color: #0f172a; }
            .row { display: flex; margin-bottom: 10px; font-size: 14px; }
            .label { width: 130px; font-weight: 600; color: #64748b; }
            .val { flex: 1; color: #1e293b; font-weight: 500; }
            .pass-footer { margin-top: 20px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="pass-card">
            <div class="pass-header">
              <span class="brand">🎓 CampusConnect</span>
              <span class="tag">✓ CONFIRMED PASS</span>
            </div>
            <div class="event-title">${event.title}</div>
            <div class="row"><span class="label">Pass Number:</span><span class="val">#REG-${event.registrationId}</span></div>
            <div class="row"><span class="label">Attendee:</span><span class="val">${event.studentName}</span></div>
            <div class="row"><span class="label">Email:</span><span class="val">${event.studentEmail}</span></div>
            <div class="row"><span class="label">Department:</span><span class="val">${event.studentDept || 'N/A'} (${event.studentYear || 'N/A'})</span></div>
            <div class="row"><span class="label">Date & Time:</span><span class="val">${event.date} at ${event.time}</span></div>
            <div class="row"><span class="label">Venue:</span><span class="val">${event.venue}</span></div>
            <div class="row"><span class="label">Category:</span><span class="val">${event.category}</span></div>
            <div class="pass-footer">Please present this pass or your Student ID at the entrance desk. — CampusConnect</div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="page registered-events-page">
      {/* Page Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="section-label">🎟️ Student Portal</div>
        <h1 className="page-title">My Registrations</h1>
        <p className="page-subtitle">
          View and manage your campus event registrations and ticket passes.
        </p>

        {currentUser && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'var(--surface)', border: '1px solid var(--border)',
            padding: '8px 18px', borderRadius: 'var(--radius-full)',
            fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 16
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--grad-violet)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: 'white'
            }}>
              {currentUser.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span><strong style={{ color: 'var(--text-primary)' }}>{currentUser.name}</strong></span>
            {currentUser.department && <span>• {currentUser.department}</span>}
            <span style={{
              background: 'var(--violet-soft)', color: '#A78BFA',
              fontWeight: 700, padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem',
              border: '1px solid rgba(139,92,246,0.2)'
            }}>
              {registeredEvents.length} {registeredEvents.length === 1 ? 'Booking' : 'Bookings'}
            </span>
          </div>
        )}
      </motion.div>

      {/* Feedback Banner */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            className={`alert-banner alert-${feedbackMessage.type}`}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{ maxWidth: 900, margin: '0 auto 20px' }}
          >
            <span>✅ {feedbackMessage.text}</span>
            <button className="alert-close" onClick={() => setFeedbackMessage(null)}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Bar */}
      {registeredEvents.length > 0 && (
        <motion.div
          className="filter-controls-container"
          style={{ maxWidth: 1000, margin: '0 auto 32px' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-bar-wrapper" style={{ flex: 1, minWidth: 220 }}>
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search by title, venue, or ticket ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="category-filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn${selectedCategory === cat ? ' active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {registeredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: 600, margin: '0 auto',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '56px 36px', textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎟️</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
            No Registrations Yet
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.6 }}>
            You haven't signed up for any events yet. Explore upcoming hackathons, workshops, and cultural festivals!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events" className="btn btn-primary btn-large">
              Browse Events →
            </Link>
            <Link to="/register" className="btn btn-outline btn-large">
              Register for Event
            </Link>
          </div>
        </motion.div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No matches found</h3>
          <p>No registrations match "{searchQuery}".</p>
          <button className="btn btn-outline" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            style={{ marginTop: 8 }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 24,
            maxWidth: 1200,
            margin: '0 auto'
          }}
          layout
        >
          <AnimatePresence>
            {filteredEvents.map((item, i) => (
              <motion.div
                key={item.registrationId}
                className="registered-event-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.07 }}
                layout
              >
                {/* Image Banner */}
                <div style={{ position: 'relative', height: 170, overflow: 'hidden' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'; }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(20,23,32,0.7) 0%, transparent 60%)'
                  }} />

                  {/* Category */}
                  <span className={`event-category-badge category-${(item.category || 'other').toLowerCase()}`}
                    style={{ position: 'absolute', top: 12, left: 12, backdropFilter: 'blur(8px)' }}>
                    {item.category}
                  </span>

                  {/* Confirmed Badge */}
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'var(--success)', color: '#fff',
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem', fontWeight: 700
                  }}>
                    ✓ Confirmed
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {item.title}
                  </h3>

                  <div className="event-meta">
                    <div className="meta-item">
                      <svg className="meta-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{item.date} at {item.time}</span>
                    </div>
                    <div className="meta-item">
                      <svg className="meta-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{item.venue}</span>
                    </div>
                  </div>

                  {/* Ticket Slip */}
                  <div style={{
                    background: 'var(--bg)', border: '1px dashed var(--border-hover)',
                    borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: '0.82rem'
                  }}>
                    {[
                      ['Pass ID', <span style={{ fontFamily: 'monospace', color: 'var(--violet)', fontWeight: 700 }}>#REG-{item.registrationId}</span>],
                      ['Attendee', <strong style={{ color: 'var(--text-primary)' }}>{item.studentName}</strong>],
                      item.studentDept && ['Dept / Year', `${item.studentDept} (${item.studentYear})`],
                    ].filter(Boolean).map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handlePrintPass(item)}
                    >
                      🖨️ Print Pass
                    </button>
                    <Link to="/events" className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                      View Events
                    </Link>

                    {cancellingId === item.registrationId ? (
                      <div style={{ width: '100%', display: 'flex', gap: 6, marginTop: 4 }}>
                        <button
                          className="btn btn-danger"
                          style={{ flex: 1, fontSize: '0.82rem' }}
                          onClick={() => handleCancelRegistration(item.registrationId, item.title)}
                        >
                          Confirm Cancel
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '0.82rem' }}
                          onClick={() => setCancellingId(null)}
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
                        onClick={() => setCancellingId(item.registrationId)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default RegisteredEvents;
