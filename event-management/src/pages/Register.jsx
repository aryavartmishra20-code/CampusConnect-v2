import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { registerForEvent } from '../services/eventService';

/**
 * Register Page — Premium dark event registration form with event summary.
 */
function Register({ events, currentUser }) {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const selectedEvent = eventId
    ? events.find((e) => Number(e.id) === Number(eventId)) || null
    : (events.length > 0 ? events[0] : null);

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
    yearOfStudy: currentUser?.yearOfStudy || '1st Year'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleEventSelectChange = (e) => navigate(`/register/${e.target.value}`);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    else if (formData.fullName.trim().length < 3) newErrors.fullName = 'Min. 3 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      newErrors.email = 'Enter a valid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/[-+\s()]/g, '')))
      newErrors.phone = 'Must be 10 digits';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.yearOfStudy) newErrors.yearOfStudy = 'Year of study is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEvent) { alert('Please select an event.'); return; }
    if (validateForm()) {
      const saved = registerForEvent({
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        ...formData
      });
      setSubmittedData(saved);
      setIsSubmitted(true);
    }
  };

  const handleRegisterAnother = () => {
    setIsSubmitted(false);
    setFormData({ fullName: '', email: '', phone: '', department: '', yearOfStudy: '1st Year' });
    setErrors({});
  };

  const catKey = (selectedEvent?.category || 'default').toLowerCase();
  const fallbacks = {
    technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    cultural:  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    sports:    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    workshop:  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    default:   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  };

  return (
    <div className="page register-page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-label">📋 Registration</div>
        <h1 className="page-title">Event Registration</h1>
        <p className="page-subtitle">Secure your spot for upcoming campus events and workshops.</p>
      </motion.div>

      <div className="register-container">
        {!selectedEvent ? (
          <div className="empty-state">
            <div className="empty-icon">❓</div>
            <h3>Event Not Found</h3>
            <p>The event you're looking for doesn't exist or has been removed.</p>
            <Link to="/events" className="btn btn-primary" style={{ marginTop: 12 }}>Browse All Events</Link>
          </div>

        ) : isSubmitted ? (
          /* ── Success Screen ── */
          <motion.div className="success-card"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <div className="success-icon">🎉</div>
            <h2 className="success-title">Registration Successful!</h2>
            <p className="success-subtitle">
              You have successfully registered for <strong>{selectedEvent.title}</strong>.
            </p>

            <div className="registration-summary-box">
              {[
                ['Confirmation ID', `#${submittedData?.id || 'CONFIRMED'}`],
                ['Participant', formData.fullName],
                ['Email', formData.email],
                ['Dept / Year', `${formData.department} (${formData.yearOfStudy})`],
                ['Date & Venue', `${selectedEvent.date} at ${selectedEvent.venue}`],
              ].map(([label, val]) => (
                <div key={label} className="summary-row">
                  <span>{label}:</span>
                  <strong>{val}</strong>
                </div>
              ))}
            </div>

            <p className="confirmation-notice">
              📧 Please show your Student ID at the venue entrance on the event day.
            </p>

            <div className="success-actions">
              <Link to="/registered-events" className="btn btn-primary">
                View My Registrations 🎟️
              </Link>
              <button onClick={handleRegisterAnother} className="btn btn-secondary">
                Register Another
              </button>
              <Link to="/events" className="btn btn-outline">
                Explore More Events
              </Link>
            </div>
          </motion.div>

        ) : (
          /* ── Registration Form ── */
          <motion.div className="register-layout"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            {/* Event Summary */}
            <div className="event-summary-card">
              <div className="summary-header">
                <span className="summary-tag">Selected Event</span>
                {events.length > 1 && (
                  <div className="event-picker">
                    <label htmlFor="event-select" className="picker-label">Switch:</label>
                    <select id="event-select" className="event-select-dropdown"
                      value={selectedEvent.id} onChange={handleEventSelectChange}>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="summary-banner-image">
                <img
                  src={selectedEvent.imageUrl || fallbacks[catKey] || fallbacks.default}
                  alt={selectedEvent.title}
                  onError={(e) => { e.target.src = fallbacks.default; }}
                />
              </div>

              <div className="summary-details">
                <h2 className="summary-title">{selectedEvent.title}</h2>
                <div className="summary-meta-list">
                  {[
                    ['🏷️', 'Category', selectedEvent.category],
                    ['📅', 'Date',     selectedEvent.date],
                    ['⏰', 'Time',     selectedEvent.time || '10:00 AM'],
                    ['📍', 'Venue',    selectedEvent.venue || selectedEvent.location],
                  ].map(([icon, label, val]) => (
                    <div key={label} className="summary-meta-row">
                      <span>{icon}</span>
                      <span><strong>{label}:</strong> {val}</span>
                    </div>
                  ))}
                </div>
                <p className="summary-description">{selectedEvent.description}</p>
              </div>
            </div>

            {/* Registration Form */}
            <div className="form-card">
              <h2 className="form-title">Student Registration Form</h2>
              <p className="form-instruction">Fill in all required fields accurately to register.</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input type="text" id="fullName" name="fullName"
                    className={`form-input${errors.fullName ? ' input-error' : ''}`}
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName} onChange={handleChange} />
                  {errors.fullName && <p className="error-text">⚠ {errors.fullName}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="regEmail" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input type="email" id="regEmail" name="email"
                    className={`form-input${errors.email ? ' input-error' : ''}`}
                    placeholder="e.g. rahul@college.edu"
                    value={formData.email} onChange={handleChange} />
                  {errors.email && <p className="error-text">⚠ {errors.email}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input type="tel" id="phone" name="phone"
                    className={`form-input${errors.phone ? ' input-error' : ''}`}
                    placeholder="10-digit mobile number"
                    value={formData.phone} onChange={handleChange} />
                  {errors.phone && <p className="error-text">⚠ {errors.phone}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="department" className="form-label">
                    Department <span className="required">*</span>
                  </label>
                  <input type="text" id="department" name="department"
                    className={`form-input${errors.department ? ' input-error' : ''}`}
                    placeholder="e.g. Computer Science & Engineering"
                    value={formData.department} onChange={handleChange} />
                  {errors.department && <p className="error-text">⚠ {errors.department}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="yearOfStudy" className="form-label">
                    Year of Study <span className="required">*</span>
                  </label>
                  <select id="yearOfStudy" name="yearOfStudy"
                    className={`form-select${errors.yearOfStudy ? ' input-error' : ''}`}
                    value={formData.yearOfStudy} onChange={handleChange}>
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Postgraduate">Postgraduate / Masters</option>
                  </select>
                  {errors.yearOfStudy && <p className="error-text">⚠ {errors.yearOfStudy}</p>}
                </div>

                <button type="submit" className="btn btn-primary btn-block" style={{ padding: 13, marginTop: 8 }}>
                  Confirm Registration
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Register;
