import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { registerForEvent } from '../services/eventService';

/**
 * Register Page Component
 * 
 * Handles student registration for an event.
 *  - Displays selected event summary details at the top.
 *  - If no eventId is in URL, provides a dropdown to select from available events.
 *  - Form with full name, email, phone number, college/department, year of study.
 *  - Input validation with user-friendly error messages.
 *  - Calls registerForEvent() in eventService.js and shows a success confirmation banner.
 */
function Register({ events, currentUser }) {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Determine selected event directly from route param or fallback to first available event
  const selectedEvent = eventId
    ? events.find((e) => Number(e.id) === Number(eventId)) || null
    : (events.length > 0 ? events[0] : null);

  // Form input fields - pre-filled from logged in student details if available
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
    yearOfStudy: currentUser?.yearOfStudy || '1st Year'
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Submission state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Handle dropdown switch if visiting without ID
  const handleEventSelectChange = (e) => {
    const id = e.target.value;
    navigate(`/register/${id}`);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[-+\s()]/g, ''))) {
      newErrors.phone = 'Phone number must contain 10 digits';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'College / Department is required';
    }

    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = 'Please select your year of study';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedEvent) {
      alert('Please select an event to register.');
      return;
    }

    if (validateForm()) {
      // Package registration data
      const registrationPayload = {
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        ...formData
      };

      // Call service function (persists to localStorage or Spring Boot API)
      const savedRecord = registerForEvent(registrationPayload);

      setSubmittedData(savedRecord);
      setIsSubmitted(true);
    }
  };

  // Reset form to register for another event
  const handleRegisterAnother = () => {
    setIsSubmitted(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      department: '',
      yearOfStudy: '1st Year'
    });
    setErrors({});
  };

  return (
    <div className="page register-page">
      <div className="page-header">
        <h1 className="page-title">Event Registration</h1>
        <p className="page-subtitle">
          Secure your spot for upcoming campus activities and workshops.
        </p>
      </div>

      <div className="register-container">
        {/* If no event is found with the ID */}
        {!selectedEvent ? (
          <div className="empty-state">
            <h3>Event Not Found</h3>
            <p>The event you are looking for does not exist or has been removed.</p>
            <Link to="/events" className="btn btn-primary">
              Browse All Events
            </Link>
          </div>
        ) : isSubmitted ? (
          /* Success Screen */
          <div className="success-card">
            <div className="success-icon">🎉</div>
            <h2 className="success-title">Registration Successful!</h2>
            <p className="success-subtitle">
              You have successfully registered for <strong>{selectedEvent.title}</strong>.
            </p>

            <div className="registration-summary-box">
              <div className="summary-row">
                <span>Confirmation ID:</span>
                <strong>#{submittedData?.id || 'CONFIRMED'}</strong>
              </div>
              <div className="summary-row">
                <span>Participant:</span>
                <strong>{formData.fullName}</strong>
              </div>
              <div className="summary-row">
                <span>Email:</span>
                <strong>{formData.email}</strong>
              </div>
              <div className="summary-row">
                <span>Department / Year:</span>
                <strong>{formData.department} ({formData.yearOfStudy})</strong>
              </div>
              <div className="summary-row">
                <span>Event Date & Venue:</span>
                <strong>{selectedEvent.date} at {selectedEvent.venue}</strong>
              </div>
            </div>

            <p className="confirmation-notice">
              📧 A confirmation pass details notice has been saved. Please show your Student ID at the venue desk.
            </p>

            <div className="success-actions">
              <Link to="/registered-events" className="btn btn-primary">
                View Registered Events 🎟️
              </Link>
              <button onClick={handleRegisterAnother} className="btn btn-secondary">
                Register Another Student
              </button>
              <Link to="/events" className="btn btn-outline">
                Explore More Events
              </Link>
            </div>
          </div>
        ) : (
          /* Normal Registration Form View */
          <div className="register-layout">
            {/* Left: Selected Event Summary Card */}
            <div className="event-summary-card">
              <div className="summary-header">
                <span className="summary-tag">Selected Event</span>
                {events.length > 1 && (
                  <div className="event-picker">
                    <label htmlFor="event-select" className="picker-label">Switch Event:</label>
                    <select
                      id="event-select"
                      className="event-select-dropdown"
                      value={selectedEvent.id}
                      onChange={handleEventSelectChange}
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="summary-banner-image">
                <img
                  src={selectedEvent.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                  alt={selectedEvent.title}
                />
              </div>

              <div className="summary-details">
                <h2 className="summary-title">{selectedEvent.title}</h2>
                <div className="summary-meta-list">
                  <div className="summary-meta-row">
                    <span className="icon">🏷️</span>
                    <span><strong>Category:</strong> {selectedEvent.category}</span>
                  </div>
                  <div className="summary-meta-row">
                    <span className="icon">📅</span>
                    <span><strong>Date:</strong> {selectedEvent.date}</span>
                  </div>
                  <div className="summary-meta-row">
                    <span className="icon">⏰</span>
                    <span><strong>Time:</strong> {selectedEvent.time || '10:00 AM'}</span>
                  </div>
                  <div className="summary-meta-row">
                    <span className="icon">📍</span>
                    <span><strong>Venue:</strong> {selectedEvent.venue || selectedEvent.location}</span>
                  </div>
                </div>
                <p className="summary-description">{selectedEvent.description}</p>
              </div>
            </div>

            {/* Right: Registration Form */}
            <div className="form-card">
              <h2 className="form-title">Student Registration Form</h2>
              <p className="form-instruction">
                Please fill in all required fields accurately to receive event updates.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  {errors.fullName && <p className="error-text">{errors.fullName}</p>}
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    College / Personal Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="e.g. john.doe@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number (10 Digits) <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-input ${errors.phone ? 'input-error' : ''}`}
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <p className="error-text">{errors.phone}</p>}
                </div>

                {/* College / Department */}
                <div className="form-group">
                  <label htmlFor="department" className="form-label">
                    College / Department <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className={`form-input ${errors.department ? 'input-error' : ''}`}
                    placeholder="e.g. Computer Science & Engineering"
                    value={formData.department}
                    onChange={handleChange}
                  />
                  {errors.department && <p className="error-text">{errors.department}</p>}
                </div>

                {/* Year of Study */}
                <div className="form-group">
                  <label htmlFor="yearOfStudy" className="form-label">
                    Year of Study <span className="required">*</span>
                  </label>
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    className={`form-select ${errors.yearOfStudy ? 'input-error' : ''}`}
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Postgraduate">Postgraduate / Masters</option>
                  </select>
                  {errors.yearOfStudy && <p className="error-text">{errors.yearOfStudy}</p>}
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary btn-block btn-submit">
                  Confirm Registration
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
