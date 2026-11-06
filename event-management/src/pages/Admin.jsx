import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRegistrations } from '../services/eventService';

/**
 * Admin Dashboard — Premium dark SaaS analytics dashboard with sidebar.
 */
function Admin({ events, onAddEvent, onDeleteEvent, isAdmin, onLoginAdmin, onSwitchToStudent }) {
  const [loginEmail, setLoginEmail] = useState('admin@event.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');

  const initialFormState = {
    title: '', description: '', date: '', time: '10:00 AM',
    venue: '', category: 'Technical', imageUrl: '', capacity: 100
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const registrations = getRegistrations();

  // Upcoming events (future dates)
  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter(e => e.date >= today);

  /* ── Admin Login Gate ── */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setIsLoggingIn(true);
    const result = await onLoginAdmin(loginEmail, loginPassword);
    setIsLoggingIn(false);
    if (!result.success) setLoginError(result.error || 'Invalid admin credentials.');
  };

  /* ── Form Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim())       errors.title       = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date.trim())        errors.date        = 'Date is required';
    if (!formData.time.trim())        errors.time        = 'Time is required';
    if (!formData.venue.trim())       errors.venue       = 'Venue is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddEvent({ ...formData, imageUrl: formData.imageUrl.trim() || undefined });
      setFeedbackMessage({ type: 'success', text: `"${formData.title}" published successfully!` });
      setFormData(initialFormState);
      setFormErrors({});
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      onDeleteEvent(id);
      setFeedbackMessage({ type: 'info', text: `"${title}" has been deleted.` });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  /* ── Sidebar Items ── */
  const sidebarItems = [
    { id: 'overview',       icon: '📊', label: 'Overview'          },
    { id: 'events',         icon: '📅', label: 'Manage Events'     },
    { id: 'registrations',  icon: '👥', label: 'Registrations'     },
    { id: 'create',         icon: '✨', label: 'Create Event'      },
  ];

  /* ── Login Gate for non-admin ── */
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 64px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative',
        background: 'var(--bg)'
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />

        <motion.div
          style={{
            position: 'relative', zIndex: 1,
            width: '100%', maxWidth: 440,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '36px 32px'
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, background: 'var(--violet-soft)',
              border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', margin: '0 auto 16px'
            }}>🔒</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Admin Verification
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Sign in with administrator credentials to manage events.
            </p>
          </div>

          <AnimatePresence>
            {loginError && (
              <motion.div className="alert-banner alert-danger" style={{ marginBottom: 16 }}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <span>⚠️ {loginError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLoginSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="adminEmail">
                Admin Email <span className="required">*</span>
              </label>
              <input type="email" id="adminEmail" className="form-input"
                value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@event.com" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="adminPassword">
                Password <span className="required">*</span>
              </label>
              <input type="password" id="adminPassword" className="form-input"
                value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter admin password" required />
              <span className="input-hint">Demo: admin@event.com / admin123</span>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={isLoggingIn}
              style={{ padding: '12px', marginTop: 4 }}>
              {isLoggingIn ? 'Verifying…' : 'Sign In as Administrator'}
            </button>
          </form>

          <div style={{ marginTop: 16 }}>
            <Link to="/events" className="btn btn-secondary btn-block" style={{ textAlign: 'center' }}>
              ← Back to Student Site
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Full Admin Dashboard ── */
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ marginBottom: 20, padding: '0 12px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
            Admin
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard</div>
        </div>

        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 16 }}>
          <button className="sidebar-item" onClick={onSwitchToStudent} style={{ color: 'var(--text-secondary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Student Site
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Feedback Banner */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              className={`alert-banner alert-${feedbackMessage.type}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginBottom: 24 }}
            >
              <span>{feedbackMessage.text}</span>
              <button className="alert-close" onClick={() => setFeedbackMessage(null)}>×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                Dashboard Overview
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Monitor campus events and student registrations.
              </p>
            </div>

            <div className="admin-stats-grid">
              {[
                { icon: '📅', label: 'Total Events',       value: events.length,         cls: 'stat-icon-violet' },
                { icon: '👥', label: 'Total Registrations', value: registrations.length,  cls: 'stat-icon-blue'   },
                { icon: '⚡', label: 'Upcoming Events',    value: upcomingEvents.length,  cls: 'stat-icon-green'  },
                { icon: '🏷️', label: 'Categories',         value: 4,                     cls: 'stat-icon-amber'  },
              ].map((stat) => (
                <motion.div key={stat.label} className="stat-card"
                  whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <div className={`stat-icon-wrap ${stat.cls}`}>
                    <span style={{ fontSize: '1.2rem' }}>{stat.icon}</span>
                  </div>
                  <div className="stat-info">
                    <span className="stat-count">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Events Quick View */}
            <div className="admin-table-card" style={{ marginTop: 24 }}>
              <div className="admin-table-header">
                <h2 className="admin-card-title">Recent Events</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('events')}>
                  View All
                </button>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th><th>Category</th><th>Date</th><th>Venue</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 5).map((ev) => (
                      <tr key={ev.id}>
                        <td><strong>{ev.title}</strong></td>
                        <td><span className={`event-category-badge category-${(ev.category||'other').toLowerCase()}`}>{ev.category}</span></td>
                        <td>{ev.date}</td>
                        <td>{ev.venue || ev.location}</td>
                        <td>
                          <button className="btn-delete btn-sm" onClick={() => handleDelete(ev.id, ev.title)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No events yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Registrations */}
            {registrations.length > 0 && (
              <div className="admin-table-card" style={{ marginTop: 20 }}>
                <div className="admin-table-header">
                  <h2 className="admin-card-title">Recent Registrations</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('registrations')}>
                    View All
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Event</th><th>Department</th></tr>
                    </thead>
                    <tbody>
                      {registrations.slice(0, 5).map((reg) => (
                        <tr key={reg.id}>
                          <td><strong>{reg.fullName}</strong></td>
                          <td>{reg.email}</td>
                          <td><span className="reg-event-badge">{reg.eventTitle}</span></td>
                          <td>{reg.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Manage Events Tab ── */}
        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Manage Events</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>View, manage and delete existing campus events.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setActiveTab('create')}>
                + Create Event
              </button>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-header">
                <h2 className="admin-card-title">All Events</h2>
                <span className="badge-count">{events.length} Events</span>
              </div>
              {events.length > 0 ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Title</th><th>Category</th><th>Date & Time</th><th>Venue</th><th className="text-center">Action</th></tr>
                    </thead>
                    <tbody>
                      {events.map((ev) => (
                        <motion.tr key={ev.id} layout>
                          <td className="table-event-cell"><strong>{ev.title}</strong></td>
                          <td><span className={`event-category-badge category-${(ev.category||'other').toLowerCase()}`}>{ev.category}</span></td>
                          <td>
                            <div className="table-datetime">
                              <div>{ev.date}</div>
                              <small className="text-muted">{ev.time}</small>
                            </div>
                          </td>
                          <td>{ev.venue || ev.location}</td>
                          <td className="text-center">
                            <button className="btn-delete" onClick={() => handleDelete(ev.id, ev.title)}>Delete</button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '48px 24px' }}>
                  <div className="empty-icon">📅</div>
                  <h3>No Events Yet</h3>
                  <p>Create your first event using the Create Event tab.</p>
                  <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setActiveTab('create')}>
                    + Create Event
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Registrations Tab ── */}
        {activeTab === 'registrations' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Registrations</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All student event registrations.</p>
            </div>

            <div className="admin-table-card">
              <div className="admin-table-header">
                <h2 className="admin-card-title">Registered Students</h2>
                <span className="badge-count">{registrations.length} Registrations</span>
              </div>

              {registrations.length > 0 ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr><th>ID</th><th>Student Name</th><th>Email</th><th>Phone</th><th>Dept & Year</th><th>Event</th></tr>
                    </thead>
                    <tbody>
                      {registrations.map((reg) => (
                        <tr key={reg.id}>
                          <td><code style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--violet)' }}>#{reg.id}</code></td>
                          <td><strong>{reg.fullName}</strong></td>
                          <td>{reg.email}</td>
                          <td>{reg.phone}</td>
                          <td>{reg.department} ({reg.yearOfStudy})</td>
                          <td><span className="reg-event-badge">{reg.eventTitle}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '48px 24px' }}>
                  <div className="empty-icon">👥</div>
                  <h3>No Registrations Yet</h3>
                  <p>No students have registered for any events yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Create Event Tab ── */}
        {activeTab === 'create' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Create New Event</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Fill in the form to publish an event immediately to the student portal.
              </p>
            </div>

            <div style={{ maxWidth: 720 }}>
              <div className="admin-form-card">
                <form onSubmit={handleSubmit} noValidate>
                  {/* Title */}
                  <div className="form-group">
                    <label htmlFor="title" className="form-label">
                      Event Title <span className="required">*</span>
                    </label>
                    <input type="text" id="title" name="title"
                      className={`form-input${formErrors.title ? ' input-error' : ''}`}
                      placeholder="e.g. National Level Code Sprint 2026"
                      value={formData.title} onChange={handleChange} />
                    {formErrors.title && <p className="error-text">⚠ {formErrors.title}</p>}
                  </div>

                  {/* Category & Date */}
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="category" className="form-label">
                        Category <span className="required">*</span>
                      </label>
                      <select id="category" name="category" className="form-select"
                        value={formData.category} onChange={handleChange}>
                        <option value="Technical">Technical</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Sports">Sports</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="date" className="form-label">
                        Event Date <span className="required">*</span>
                      </label>
                      <input type="date" id="date" name="date"
                        className={`form-input${formErrors.date ? ' input-error' : ''}`}
                        value={formData.date} onChange={handleChange} />
                      {formErrors.date && <p className="error-text">⚠ {formErrors.date}</p>}
                    </div>
                  </div>

                  {/* Time & Venue */}
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="time" className="form-label">
                        Time <span className="required">*</span>
                      </label>
                      <input type="text" id="time" name="time"
                        className={`form-input${formErrors.time ? ' input-error' : ''}`}
                        placeholder="e.g. 10:00 AM"
                        value={formData.time} onChange={handleChange} />
                      {formErrors.time && <p className="error-text">⚠ {formErrors.time}</p>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="venue" className="form-label">
                        Venue / Location <span className="required">*</span>
                      </label>
                      <input type="text" id="venue" name="venue"
                        className={`form-input${formErrors.venue ? ' input-error' : ''}`}
                        placeholder="e.g. Auditorium / CS Lab 2"
                        value={formData.venue} onChange={handleChange} />
                      {formErrors.venue && <p className="error-text">⚠ {formErrors.venue}</p>}
                    </div>
                  </div>

                  {/* Capacity & Image */}
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="capacity" className="form-label">
                        Capacity <span className="optional-text">(optional)</span>
                      </label>
                      <input type="number" id="capacity" name="capacity" className="form-input"
                        placeholder="e.g. 100" min="1"
                        value={formData.capacity} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="imageUrl" className="form-label">
                        Banner Image URL <span className="optional-text">(optional)</span>
                      </label>
                      <input type="url" id="imageUrl" name="imageUrl" className="form-input"
                        placeholder="https://images.unsplash.com/…"
                        value={formData.imageUrl} onChange={handleChange} />
                      <span className="input-hint">Leave blank to use a default banner.</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      Description <span className="required">*</span>
                    </label>
                    <textarea id="description" name="description" rows={4}
                      className={`form-textarea${formErrors.description ? ' input-error' : ''}`}
                      placeholder="Provide schedule details, eligibility, prerequisites, and prizes…"
                      value={formData.description} onChange={handleChange} />
                    {formErrors.description && <p className="error-text">⚠ {formErrors.description}</p>}
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Publish Event
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default Admin;
