import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getRegistrations } from '../services/eventService';

/**
 * Admin Dashboard Page Component
 * 
 * Provides management capabilities:
 *  1. Role Access Barrier: Students cannot publish events without admin verification
 *  2. Create Event Form (title, description, date, time, venue, category, imageUrl)
 *  3. Existing Events Management Table with Delete functionality
 *  4. Live stats overview & toggle to view registered students
 *  5. Direct switch between Admin site and Student site
 */
function Admin({ events, onAddEvent, onDeleteEvent, isAdmin, onLoginAdmin, onSwitchToStudent }) {
  // Login form state for unauthenticated users
  const [loginEmail, setLoginEmail] = useState('admin@event.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active view tab ('events' | 'registrations')
  const [activeTab, setActiveTab] = useState('events');

  // Handle Admin Login submission
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

    if (!result.success) {
      setLoginError(result.error || 'Invalid credentials. Only administrators can publish events.');
    }
  };

  // New Event Form State
  const initialFormState = {
    title: '',
    description: '',
    date: '',
    time: '10:00 AM',
    venue: '',
    category: 'Technical',
    imageUrl: '',
    capacity: 100
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Retrieve current student registrations from storage
  const registrations = getRegistrations();

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date.trim()) errors.date = 'Date is required';
    if (!formData.time.trim()) errors.time = 'Time is required';
    if (!formData.venue.trim()) errors.venue = 'Venue / Location is required';
    if (!formData.category.trim()) errors.category = 'Category is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Event Creation Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Pass new event payload to parent App handler to update shared state
      onAddEvent({
        ...formData,
        imageUrl: formData.imageUrl.trim() || undefined
      });

      // Show notification
      setFeedbackMessage({
        type: 'success',
        text: `Event "${formData.title}" was successfully created and published!`
      });

      // Reset form
      setFormData(initialFormState);
      setFormErrors({});

      // Auto-clear feedback after 4 seconds
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 4000);
    }
  };

  // Handle Event Deletion
  const handleDelete = (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This cannot be undone.`
    );
    if (confirmed) {
      onDeleteEvent(id);
      setFeedbackMessage({
        type: 'info',
        text: `Event "${title}" has been deleted.`
      });
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 3000);
    }
  };

  // Access Barrier: Students cannot publish events or view admin controls
  if (!isAdmin) {
    return (
      <div className="page admin-page">
        <div className="page-header">
          <h1 className="page-title">Administrator Portal</h1>
          <p className="page-subtitle">
            Admin access is required to create, publish, and manage campus events.
          </p>
        </div>

        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div className="form-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '2.5rem' }}>🔒</span>
              <h2 className="form-title" style={{ marginTop: '8px' }}>Admin Verification</h2>
              <p className="form-instruction" style={{ marginBottom: '12px' }}>
                Students cannot publish events. Please sign in to access the event management panel.
              </p>
            </div>

            {loginError && (
              <div className="alert-banner alert-danger" style={{ marginBottom: '16px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="adminEmail">
                  Admin Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  className="form-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@event.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adminPassword">
                  Admin Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  className="form-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="admin123"
                  required
                />
                <span className="input-hint">Demo Admin: <code>admin@event.com</code> / <code>admin123</code></span>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-submit" disabled={isLoggingIn}>
                {isLoggingIn ? 'Verifying...' : 'Sign In as Admin'}
              </button>
            </form>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link to="/events" className="btn btn-secondary btn-block">
                ← Return to Student Site
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={onSwitchToStudent}
            className="btn btn-secondary"
            style={{ fontSize: '0.88rem', padding: '6px 14px' }}
            title="Switch back to student browsing mode"
          >
            👤 Switch to Student Site
          </button>
        </div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">
          Create new campus events, manage event listings, and view attendee registrations.
        </p>
      </div>

      {/* Admin Stats Overview */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-count">{events.length}</span>
            <span className="stat-label">Total Events</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-count">{registrations.length}</span>
            <span className="stat-label">Total Registrations</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <span className="stat-count">4</span>
            <span className="stat-label">Active Categories</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <span className="stat-count">Live</span>
            <span className="stat-label">Status</span>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className={`alert-banner alert-${feedbackMessage.type}`}>
          <span>{feedbackMessage.text}</span>
          <button
            className="alert-close"
            onClick={() => setFeedbackMessage(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Admin View Toggle */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Manage & Create Events ({events.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          View Registered Students ({registrations.length})
        </button>
      </div>

      {activeTab === 'events' ? (
        <div className="admin-content-grid">
          {/* Create Event Form Card */}
          <div className="admin-form-card">
            <h2 className="admin-card-title">Create New Event</h2>
            <p className="admin-card-subtitle">
              Fill in the form to publish an event immediately to Home and Events pages.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Event Title */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Event Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className={`form-input ${formErrors.title ? 'input-error' : ''}`}
                  placeholder="e.g. National Level Code Sprint 2026"
                  value={formData.title}
                  onChange={handleChange}
                />
                {formErrors.title && <p className="error-text">{formErrors.title}</p>}
              </div>

              {/* Category & Date Grid */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                  >
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
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className={`form-input ${formErrors.date ? 'input-error' : ''}`}
                    value={formData.date}
                    onChange={handleChange}
                  />
                  {formErrors.date && <p className="error-text">{formErrors.date}</p>}
                </div>
              </div>

              {/* Time & Venue Grid */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="time" className="form-label">
                    Time <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="time"
                    name="time"
                    className={`form-input ${formErrors.time ? 'input-error' : ''}`}
                    placeholder="e.g. 10:00 AM or 02:30 PM"
                    value={formData.time}
                    onChange={handleChange}
                  />
                  {formErrors.time && <p className="error-text">{formErrors.time}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="venue" className="form-label">
                    Venue / Location <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    className={`form-input ${formErrors.venue ? 'input-error' : ''}`}
                    placeholder="e.g. Auditorium / CS Lab 2"
                    value={formData.venue}
                    onChange={handleChange}
                  />
                  {formErrors.venue && <p className="error-text">{formErrors.venue}</p>}
                </div>
              </div>

              {/* Banner Image URL (Optional) */}
              <div className="form-group">
                <label htmlFor="imageUrl" className="form-label">
                  Banner Image URL <span className="optional-text">(Optional)</span>
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
                <span className="input-hint">Leave blank to use a stylish high-res default banner.</span>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Event Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className={`form-textarea ${formErrors.description ? 'input-error' : ''}`}
                  placeholder="Provide schedule details, eligibility, prerequisites, and prizes..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
                {formErrors.description && <p className="error-text">{formErrors.description}</p>}
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                + Publish Event
              </button>
            </form>
          </div>

          {/* Existing Events List / Table */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h2 className="admin-card-title">Existing Events</h2>
              <span className="badge-count">{events.length} Events</span>
            </div>

            {events.length > 0 ? (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date & Time</th>
                      <th>Venue</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <div className="table-event-cell">
                            <strong>{event.title}</strong>
                          </div>
                        </td>
                        <td>
                          <span className={`event-category-badge category-${(event.category || 'other').toLowerCase()}`}>
                            {event.category}
                          </span>
                        </td>
                        <td>
                          <div className="table-datetime">
                            <div>{event.date}</div>
                            <small className="text-muted">{event.time}</small>
                          </div>
                        </td>
                        <td>{event.venue || event.location}</td>
                        <td className="text-center">
                          <button
                            onClick={() => handleDelete(event.id, event.title)}
                            className="btn-delete"
                            title="Delete Event"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No events found. Use the form on the left to add one.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Registrations View Tab */
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h2 className="admin-card-title">Registered Students</h2>
            <span className="badge-count">{registrations.length} Registrations</span>
          </div>

          {registrations.length > 0 ? (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Registration ID</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Dept & Year</th>
                    <th>Registered For</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td><code>#{reg.id}</code></td>
                      <td><strong>{reg.fullName}</strong></td>
                      <td>{reg.email}</td>
                      <td>{reg.phone}</td>
                      <td>{reg.department} ({reg.yearOfStudy})</td>
                      <td>
                        <span className="reg-event-badge">{reg.eventTitle}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No students have registered for any events yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;
