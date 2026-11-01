import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, signupStudent } from '../services/eventService';

/**
 * Login & Student Registration Page Component
 * 
 * Provides an entry authentication gateway for CampusConnect:
 * - Tab 1: Universal Sign In (for both Students and Administrators)
 * - Tab 2: Student Account Registration (collects student details and stores them in database)
 */
function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Active tab: 'login' or 'signup'
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Student Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    department: 'Computer Science & Engineering',
    yearOfStudy: '1st Year',
    phone: ''
  });
  const [signupErrors, setSignupErrors] = useState({});
  const [signupGeneralError, setSignupGeneralError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = await loginUser(loginEmail, loginPassword);
      if (result.success) {
        if (onLoginSuccess) {
          onLoginSuccess(result.user, result.isAdmin);
        }
        // Redirect to intended destination or /admin or /
        const destination = result.isAdmin ? '/admin' : (location.state?.from || '/');
        navigate(destination, { replace: true });
      } else {
        setLoginError(result.error || 'Invalid email or password.');
      }
    } catch (err) {
      setLoginError('An unexpected connection error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Quick fill demo administrator credentials
  const fillAdminCredentials = () => {
    setLoginEmail('admin@event.com');
    setLoginPassword('admin123');
    setLoginError('');
  };

  // Handle Signup inputs
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (signupErrors[name]) {
      setSignupErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate signup form
  const validateSignup = () => {
    const errors = {};
    if (!signupData.name.trim()) errors.name = 'Full name is required.';
    if (!signupData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      errors.email = 'Please provide a valid email format.';
    }
    if (!signupData.studentId.trim()) errors.studentId = 'Student ID / Roll No is required.';
    if (!signupData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(signupData.phone.replace(/[-()\s]/g, ''))) {
      errors.phone = 'Please provide a valid 10-digit phone number.';
    }
    if (!signupData.password) {
      errors.password = 'Password is required.';
    } else if (signupData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Signup submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupGeneralError('');

    if (!validateSignup()) return;

    setIsSigningUp(true);
    try {
      const result = await signupStudent(signupData);
      if (result.success) {
        if (onLoginSuccess) {
          onLoginSuccess(result.user, false);
        }
        navigate('/', { replace: true });
      } else {
        setSignupGeneralError(result.error || 'Failed to create student account.');
      }
    } catch (err) {
      setSignupGeneralError('An unexpected server error occurred.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="page" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
      {/* Brand Header */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', fontSize: '2rem', marginBottom: '12px' }}>
          🎓
        </div>
        <h1 className="page-title" style={{ fontSize: '2.1rem', marginBottom: '6px' }}>
          Welcome to CampusConnect
        </h1>
        <p className="page-subtitle" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1rem', color: '#64748b' }}>
          Your gateway to campus workshops, hackathons, and student cultural events.
        </p>
      </div>

      <div style={{ maxWidth: activeTab === 'signup' ? '680px' : '460px', margin: '0 auto', transition: 'max-width 0.2s ease' }}>
        <div className="form-card" style={{ padding: '28px 32px' }}>
          {/* Tab Navigation Switcher */}
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
              }}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                fontWeight: activeTab === 'login' ? '700' : '500',
                fontSize: '1rem',
                color: activeTab === 'login' ? 'var(--primary-color)' : '#64748b',
                borderBottom: activeTab === 'login' ? '3px solid var(--primary-color)' : '3px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🔑 Student & Admin Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setSignupGeneralError('');
              }}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                fontWeight: activeTab === 'signup' ? '700' : '500',
                fontSize: '1rem',
                color: activeTab === 'signup' ? 'var(--primary-color)' : '#64748b',
                borderBottom: activeTab === 'signup' ? '3px solid var(--primary-color)' : '3px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              📝 Student Registration
            </button>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <h2 className="form-title" style={{ fontSize: '1.25rem' }}>Sign In to Your Account</h2>
                <p className="form-instruction" style={{ marginBottom: '14px', fontSize: '0.88rem' }}>
                  Students sign in to view events and register. Admins sign in to manage and post events.
                </p>
              </div>

              {loginError && (
                <div style={{ padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', fontSize: '0.9rem' }}>
                  ⚠️ {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="loginEmail">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="loginEmail"
                    className="form-input"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@college.edu or admin@event.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="loginPassword">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="loginPassword"
                    className="form-input"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-submit"
                  disabled={isLoggingIn}
                  style={{ marginTop: '8px', padding: '12px' }}
                >
                  {isLoggingIn ? 'Signing In...' : 'Sign In to CampusConnect'}
                </button>
              </form>

              {/* Quick Fill Helper for Demo / Evaluators */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0', textAlign: 'center' }}>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '8px' }}>
                  Demonstration Administrator Credentials:
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={fillAdminCredentials}
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  ⚡ Auto-fill Admin (admin@event.com / admin123)
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT SIGNUP */}
          {activeTab === 'signup' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <h2 className="form-title" style={{ fontSize: '1.25rem' }}>Create Student Account</h2>
                <p className="form-instruction" style={{ marginBottom: '14px', fontSize: '0.88rem' }}>
                  Register with your campus details to participate in college events, workshops, and competitions.
                </p>
              </div>

              {signupGeneralError && (
                <div style={{ padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', fontSize: '0.9rem' }}>
                  ⚠️ {signupGeneralError}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} noValidate>
                {/* Name & Student Roll Number */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-input ${signupErrors.name ? 'input-error' : ''}`}
                      value={signupData.name}
                      onChange={handleSignupChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                    {signupErrors.name && <p className="error-text">{signupErrors.name}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="studentId">
                      Student ID / Roll No <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      className={`form-input ${signupErrors.studentId ? 'input-error' : ''}`}
                      value={signupData.studentId}
                      onChange={handleSignupChange}
                      placeholder="e.g. CS2026-042"
                      required
                    />
                    {signupErrors.studentId && <p className="error-text">{signupErrors.studentId}</p>}
                  </div>
                </div>

                {/* Department & Year of Study */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="department">
                      Department / Branch <span className="required">*</span>
                    </label>
                    <select
                      id="department"
                      name="department"
                      className="form-select"
                      value={signupData.department}
                      onChange={handleSignupChange}
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Management & MBA">Management & MBA</option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Basic Sciences">Basic Sciences</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="yearOfStudy">
                      Year of Study <span className="required">*</span>
                    </label>
                    <select
                      id="yearOfStudy"
                      name="yearOfStudy"
                      className="form-select"
                      value={signupData.yearOfStudy}
                      onChange={handleSignupChange}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Student Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-input ${signupErrors.email ? 'input-error' : ''}`}
                      value={signupData.email}
                      onChange={handleSignupChange}
                      placeholder="e.g. rahul@college.edu"
                      required
                    />
                    {signupErrors.email && <p className="error-text">{signupErrors.email}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">
                      Phone Number <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`form-input ${signupErrors.phone ? 'input-error' : ''}`}
                      value={signupData.phone}
                      onChange={handleSignupChange}
                      placeholder="10-digit mobile number"
                      required
                    />
                    {signupErrors.phone && <p className="error-text">{signupErrors.phone}</p>}
                  </div>
                </div>

                {/* Passwords */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="password">
                      Password (min 6 chars) <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className={`form-input ${signupErrors.password ? 'input-error' : ''}`}
                      value={signupData.password}
                      onChange={handleSignupChange}
                      placeholder="Create password"
                      required
                    />
                    {signupErrors.password && <p className="error-text">{signupErrors.password}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">
                      Confirm Password <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`form-input ${signupErrors.confirmPassword ? 'input-error' : ''}`}
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      placeholder="Repeat password"
                      required
                    />
                    {signupErrors.confirmPassword && <p className="error-text">{signupErrors.confirmPassword}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-submit"
                  disabled={isSigningUp}
                  style={{ marginTop: '12px', padding: '12px' }}
                >
                  {isSigningUp ? 'Creating Account & Storing Details...' : 'Complete Registration & Sign In'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
