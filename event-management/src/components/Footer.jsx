import React from 'react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Footer — Premium dark SaaS footer.
 */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <div style={{
              width: 28, height: 28, background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
              borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
            }}>🎓</div>
            <span>CampusConnect</span>
          </div>
          <p className="footer-tagline">
            The all-in-one portal for campus events, hackathons, cultural fests, and skill workshops.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/events">Explore Events</Link></li>
            <li><Link to="/registered-events">My Registrations</Link></li>
            <li><Link to="/admin">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="footer-col">
          <h4 className="footer-heading">Categories</h4>
          <ul className="footer-links">
            <li><Link to="/events">Technical & Hackathons</Link></li>
            <li><Link to="/events">Cultural & Arts</Link></li>
            <li><Link to="/events">Sports & Tournaments</Link></li>
            <li><Link to="/events">Skill Workshops</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4 className="footer-heading">Contact & Support</h4>
          <p className="footer-contact">Student Activities Council</p>
          <p className="footer-contact">aryavartmishra20@gmail.com</p>
          <p className="footer-contact">+91 8767983457</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {CURRENT_YEAR} CampusConnect — College Event Management System. Built with React & Spring Boot.</p>
      </div>
    </footer>
  );
}

export default Footer;
