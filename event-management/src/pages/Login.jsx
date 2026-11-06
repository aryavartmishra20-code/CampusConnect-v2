import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, signupStudent } from '../services/eventService';

/**
 * Login & Signup Page — Premium dark authentication gateway.
 */
function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Signup form
  const [signupData, setSignupData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    studentId: '', department: 'Computer Science & Engineering',
    yearOfStudy: '1st Year', phone: ''
  });
  const [signupErrors, setSignupErrors] = useState({});
  const [signupGeneralError, setSignupGeneralError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  /* ── Login ── */
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
        if (onLoginSuccess) onLoginSuccess(result.user, result.isAdmin);
        navigate(result.isAdmin ? '/admin' : (location.state?.from || '/'), { replace: true });
      } else {
        setLoginError(result.error || 'Invalid email or password.');
      }
    } catch {
      setLoginError('Connection error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fillAdminCredentials = () => {
    setLoginEmail('admin@event.com');
    setLoginPassword('admin123');
    setLoginError('');
  };

  /* ── Signup ── */
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    if (signupErrors[name]) setSignupErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateSignup = () => {
    const errors = {};
    if (!signupData.name.trim()) errors.name = 'Full name is required.';
    if (!signupData.email.trim()) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) errors.email = 'Enter a valid email.';
    if (!signupData.studentId.trim()) errors.studentId = 'Student ID is required.';
    if (!signupData.phone.trim()) errors.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(signupData.phone.replace(/[-()\s]/g, '')))
      errors.phone = 'Enter a valid 10-digit number.';
    if (!signupData.password) errors.password = 'Password is required.';
    else if (signupData.password.length < 6) errors.password = 'Minimum 6 characters.';
    if (signupData.password !== signupData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match.';
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupGeneralError('');
    if (!validateSignup()) return;
    setIsSigningUp(true);
    try {
      const result = await signupStudent(signupData);
      if (result.success) {
        if (onLoginSuccess) onLoginSuccess(result.user, false);
        navigate('/', { replace: true });
      } else {
        setSignupGeneralError(result.error || 'Failed to create account.');
      }
    } catch {
      setSignupGeneralError('An unexpected error occurred.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="login-page-wrap">
      <div className="login-bg-gradient" />

      <motion.div
        className="login-container"
        style={{ maxWidth: activeTab === 'signup' ? 680 : 460 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">🎓</div>
          <h1>Welcome to CampusConnect</h1>
          <p>Your gateway to campus workshops, hackathons, and cultural events.</p>
        </div>

        {/* Card */}
        <div className="form-card">
          {/* Tab Navigation */}
          <div className="tab-nav">
            <button
              className={`tab-nav-btn${activeTab === 'login' ? ' active' : ''}`}
              onClick={() => { setActiveTab('login'); setLoginError(''); }}
            >
              🔑 Sign In
            </button>
            <button
              className={`tab-nav-btn${activeTab === 'signup' ? ' active' : ''}`}
              onClick={() => { setActiveTab('signup'); setSignupGeneralError(''); }}
            >
              📝 Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* ── LOGIN TAB ── */}
            {activeTab === 'login' && (
              <motion.div key="login"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
                <div style={{ marginBottom: 20 }}>
                  <h2 className="form-title">Sign In to Your Account</h2>
                  <p className="form-instruction">
                    Students browse and register. Admins manage and publish events.
                  </p>
                </div>

                {loginError && (
                  <div className="alert-banner alert-danger" style={{ marginBottom: 16 }}>
                    <span>⚠️ {loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} noValidate>
                  <div className="form-group">
                    <label className="form-label" htmlFor="loginEmail">
                      Email Address <span className="required">*</span>
                    </label>
                    <input type="email" id="loginEmail" className="form-input"
                      value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="student@college.edu or admin@event.com" required />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="loginPassword">
                      Password <span className="required">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input type={showLoginPw ? 'text' : 'password'} id="loginPassword"
                        className="form-input" style={{ paddingRight: 42 }}
                        value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password" required />
                      <button type="button" onClick={() => setShowLoginPw(p => !p)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>
                        {showLoginPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block"
                    disabled={isLoggingIn} style={{ padding: 13, marginTop: 4 }}>
                    {isLoggingIn ? 'Signing in…' : 'Sign In to CampusConnect'}
                  </button>
                </form>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    Demo administrator credentials:
                  </p>
                  <button className="btn btn-secondary btn-sm" onClick={fillAdminCredentials}>
                    ⚡ Auto-fill Admin (admin@event.com / admin123)
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── SIGNUP TAB ── */}
            {activeTab === 'signup' && (
              <motion.div key="signup"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                <div style={{ marginBottom: 20 }}>
                  <h2 className="form-title">Create Student Account</h2>
                  <p className="form-instruction">
                    Register with your campus details to participate in college events.
                  </p>
                </div>

                {signupGeneralError && (
                  <div className="alert-banner alert-danger" style={{ marginBottom: 16 }}>
                    <span>⚠️ {signupGeneralError}</span>
                  </div>
                )}

                <form onSubmit={handleSignupSubmit} noValidate>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">
                        Full Name <span className="required">*</span>
                      </label>
                      <input type="text" id="name" name="name"
                        className={`form-input${signupErrors.name ? ' input-error' : ''}`}
                        value={signupData.name} onChange={handleSignupChange}
                        placeholder="e.g. Rahul Sharma" />
                      {signupErrors.name && <p className="error-text">{signupErrors.name}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="studentId">
                        Student ID <span className="required">*</span>
                      </label>
                      <input type="text" id="studentId" name="studentId"
                        className={`form-input${signupErrors.studentId ? ' input-error' : ''}`}
                        value={signupData.studentId} onChange={handleSignupChange}
                        placeholder="e.g. CS2026-042" />
                      {signupErrors.studentId && <p className="error-text">{signupErrors.studentId}</p>}
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="department">
                        Department <span className="required">*</span>
                      </label>
                      <select id="department" name="department" className="form-select"
                        value={signupData.department} onChange={handleSignupChange}>
                        <option>Computer Science &amp; Engineering</option>
                        <option>Information Technology</option>
                        <option>Electronics &amp; Communication</option>
                        <option>Mechanical Engineering</option>
                        <option>Civil Engineering</option>
                        <option>Management &amp; MBA</option>
                        <option>Biotechnology</option>
                        <option>Basic Sciences</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="yearOfStudy">
                        Year of Study <span className="required">*</span>
                      </label>
                      <select id="yearOfStudy" name="yearOfStudy" className="form-select"
                        value={signupData.yearOfStudy} onChange={handleSignupChange}>
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>Post Graduate</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="signupEmail">
                        Email <span className="required">*</span>
                      </label>
                      <input type="email" id="signupEmail" name="email"
                        className={`form-input${signupErrors.email ? ' input-error' : ''}`}
                        value={signupData.email} onChange={handleSignupChange}
                        placeholder="e.g. rahul@college.edu" />
                      {signupErrors.email && <p className="error-text">{signupErrors.email}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">
                        Phone Number <span className="required">*</span>
                      </label>
                      <input type="tel" id="phone" name="phone"
                        className={`form-input${signupErrors.phone ? ' input-error' : ''}`}
                        value={signupData.phone} onChange={handleSignupChange}
                        placeholder="10-digit mobile number" />
                      {signupErrors.phone && <p className="error-text">{signupErrors.phone}</p>}
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="password">
                        Password <span className="required">*</span>
                      </label>
                      <input type="password" id="password" name="password"
                        className={`form-input${signupErrors.password ? ' input-error' : ''}`}
                        value={signupData.password} onChange={handleSignupChange}
                        placeholder="Min. 6 characters" />
                      {signupErrors.password && <p className="error-text">{signupErrors.password}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="confirmPassword">
                        Confirm Password <span className="required">*</span>
                      </label>
                      <input type="password" id="confirmPassword" name="confirmPassword"
                        className={`form-input${signupErrors.confirmPassword ? ' input-error' : ''}`}
                        value={signupData.confirmPassword} onChange={handleSignupChange}
                        placeholder="Repeat password" />
                      {signupErrors.confirmPassword && <p className="error-text">{signupErrors.confirmPassword}</p>}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block"
                    disabled={isSigningUp} style={{ padding: 13, marginTop: 4 }}>
                    {isSigningUp ? 'Creating Account…' : 'Create Account & Sign In'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
