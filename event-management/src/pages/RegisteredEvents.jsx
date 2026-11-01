import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getStudentRegisteredEvents,
  cancelEventRegistration
} from '../services/eventService';

/**
 * Registered Events Page Component
 * 
 * Allows students to view, search, and manage all events they have registered for.
 * Displays:
 *  - Event details (Title, Date, Time, Venue, Category)
 *  - Official registration pass metadata (Registration ID, Name, Dept, Timestamp)
 *  - Live filtering by search keyword and category
 *  - Cancellation capability with confirmation
 *  - Print ticket pass capability
 */
function RegisteredEvents({ currentUser, events }) {
  const navigate = useNavigate();

  // Load registered events for the current student
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Sync registrations whenever currentUser changes
  useEffect(() => {
    loadRegistrations();
  }, [currentUser]);

  const loadRegistrations = () => {
    const list = getStudentRegisteredEvents(currentUser?.email);
    setRegisteredEvents(list);
  };

  // Handle cancellation of a registered event
  const handleCancelRegistration = (regId, eventTitle) => {
    cancelEventRegistration(regId);
    setRegisteredEvents((prev) => prev.filter((r) => r.registrationId !== regId));
    setCancellingId(null);
    setFeedbackMessage({
      type: 'success',
      text: `Your registration for "${eventTitle}" has been cancelled.`
    });

    // Auto dismiss feedback after 4 seconds
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Filter registrations based on search query and category
  const filteredEvents = registeredEvents.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.registrationId).includes(searchQuery);

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter pills
  const categories = ['All', ...new Set(registeredEvents.map((r) => r.category).filter(Boolean))];

  // Helper to trigger print dialog for a pass
  const handlePrintPass = (event) => {
    const printWindow = window.open('', '_blank', 'width=650,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CampusConnect Registration Pass - #${event.registrationId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
            .pass-card { border: 2px dashed #2563eb; border-radius: 12px; padding: 24px; max-width: 520px; margin: 0 auto; }
            .pass-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eff6ff; padding-bottom: 12px; margin-bottom: 16px; }
            .brand { font-size: 20px; font-weight: bold; color: #2563eb; }
            .tag { background: #ecfdf5; color: #047857; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .event-title { font-size: 22px; font-weight: 700; margin: 8px 0; color: #0f172a; }
            .row { display: flex; margin-bottom: 8px; font-size: 14px; }
            .label { width: 120px; font-weight: 600; color: #64748b; }
            .val { flex: 1; color: #1e293b; }
            .pass-footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="pass-card">
            <div class="pass-header">
              <span class="brand">🎓 CampusConnect</span>
              <span class="tag">CONFIRMED PASS</span>
            </div>
            <div class="event-title">${event.title}</div>
            <div class="row"><span class="label">Pass Number:</span><span class="val">#REG-${event.registrationId}</span></div>
            <div class="row"><span class="label">Attendee:</span><span class="val">${event.studentName}</span></div>
            <div class="row"><span class="label">Email:</span><span class="val">${event.studentEmail}</span></div>
            <div class="row"><span class="label">Department:</span><span class="val">${event.studentDept || 'N/A'} (${event.studentYear || 'N/A'})</span></div>
            <div class="row"><span class="label">Date & Time:</span><span class="val">${event.date} at ${event.time}</span></div>
            <div class="row"><span class="label">Venue:</span><span class="val">${event.venue}</span></div>
            <div class="row"><span class="label">Category:</span><span class="val">${event.category}</span></div>
            <div class="pass-footer">Please present this pass or your student ID at the entrance desk.</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="page registered-events-page">
      {/* Page Header */}
      <div className="page-header">
        <span className="hero-pill" style={{ display: 'inline-block', marginBottom: '10px' }}>
          🎟️ Student Portal
        </span>
        <h1 className="page-title">Registered Events</h1>
        <p className="page-subtitle">
          View all the campus activities, workshops, and hackathons you have signed up for.
        </p>

        {/* Quick User Metadata Badge */}
        {currentUser && (
          <div
            style={{
              marginTop: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '8px 18px',
              borderRadius: '30px',
              fontSize: '0.9rem',
              color: '#475569'
            }}
          >
            <span>👤 <strong>{currentUser.name}</strong></span>
            {currentUser.department && <span>• {currentUser.department}</span>}
            <span
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.8rem'
              }}
            >
              {registeredEvents.length} {registeredEvents.length === 1 ? 'Booking' : 'Bookings'}
            </span>
          </div>
        )}
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div
          className={`feedback-banner ${feedbackMessage.type === 'success' ? 'feedback-success' : 'feedback-error'}`}
          style={{
            maxWidth: '800px',
            margin: '0 auto 24px auto',
            padding: '12px 18px',
            borderRadius: '8px',
            background: feedbackMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${feedbackMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: feedbackMessage.type === 'success' ? '#065f46' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>✅ {feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar (Only shown if student has registrations) */}
      {registeredEvents.length > 0 && (
        <div
          className="search-filter-card"
          style={{
            maxWidth: '1000px',
            margin: '0 auto 32px auto',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{ flex: '1', minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search registered events by title, venue, or ticket ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? '#2563eb' : '#e2e8f0',
                    backgroundColor: selectedCategory === cat ? '#2563eb' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#475569',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Registered Events Cards List */}
      {registeredEvents.length === 0 ? (
        /* Empty State */
        <div
          className="empty-state-card"
          style={{
            maxWidth: '650px',
            margin: '40px auto',
            textAlign: 'center',
            padding: '48px 24px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎟️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            No Registered Events Yet
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '440px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
            You haven't signed up for any events yet. Explore upcoming hackathons, tech talks, and cultural festivals!
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/events" className="btn btn-primary" style={{ padding: '10px 22px' }}>
              Browse Upcoming Events &rarr;
            </Link>
            <Link to="/register" className="btn btn-outline" style={{ padding: '10px 22px' }}>
              Register for an Event
            </Link>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        /* No Search Matches */
        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '12px' }}>No registrations match your search filter "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem' }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Registered Events Grid */
        <div
          className="registered-events-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          {filteredEvents.map((item) => (
            <div
              key={item.registrationId}
              className="registered-event-card"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              {/* Event Image Banner */}
              <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Category Pill */}
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}
                >
                  {item.category}
                </span>

                {/* Confirmed Status Pill */}
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Confirmed ✓
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', flex: '1', display: 'flex', flexDirection: 'column' }}>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '10px',
                    lineHeight: '1.3'
                  }}
                >
                  {item.title}
                </h3>

                {/* Event Schedule Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', fontSize: '0.88rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>📅</span>
                    <span><strong>Date:</strong> {item.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>⏰</span>
                    <span><strong>Time:</strong> {item.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>📍</span>
                    <span><strong>Venue:</strong> {item.venue}</span>
                  </div>
                </div>

                {/* Ticket Pass Slip Box */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '18px',
                    fontSize: '0.82rem',
                    color: '#334155'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Pass ID:</span>
                    <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>#REG-{item.registrationId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Attendee:</span>
                    <strong>{item.studentName}</strong>
                  </div>
                  {item.studentDept && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Dept/Year:</span>
                      <span>{item.studentDept} ({item.studentYear})</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handlePrintPass(item)}
                    className="btn btn-outline"
                    style={{ flex: '1', minWidth: '100px', fontSize: '0.82rem', padding: '8px 12px' }}
                    title="Print or save your event ticket pass"
                  >
                    🖨️ Pass
                  </button>

                  <Link
                    to="/events"
                    className="btn btn-primary"
                    style={{ flex: '1', minWidth: '100px', fontSize: '0.82rem', padding: '8px 12px', textAlign: 'center' }}
                  >
                    Details
                  </Link>

                  {cancellingId === item.registrationId ? (
                    <div style={{ width: '100%', marginTop: '8px', display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleCancelRegistration(item.registrationId, item.title)}
                        style={{
                          flex: '1',
                          padding: '6px 10px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Confirm Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancellingId(null)}
                        style={{
                          padding: '6px 10px',
                          background: '#e2e8f0',
                          color: '#334155',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCancellingId(item.registrationId)}
                      style={{
                        background: 'none',
                        border: '1px solid #fecaca',
                        color: '#ef4444',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                      title="Cancel your attendance registration"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RegisteredEvents;
