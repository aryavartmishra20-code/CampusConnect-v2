import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer Component
 * 
 * Clean, modern footer providing quick links, branding, and copyright details.
 */
const CURRENT_YEAR = new Date().getFullYear();

/**
 * Footer Component
 * 
 * Clean, modern footer providing quick links, branding, and copyright details.
 */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <span className="brand-icon">🎓</span>
            <span className="brand-title">CampusConnect</span>
          </div>
          <p className="footer-tagline">
            The all-in-one portal for college events, technical symposiums, cultural fests, and workshops.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/events">All Events</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/admin">Admin Portal</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Event Categories</h4>
          <ul className="footer-links">
            <li><Link to="/events">Technical & Hackathons</Link></li>
            <li><Link to="/events">Cultural & Arts</Link></li>
            <li><Link to="/events">Sports & Tournaments</Link></li>
            <li><Link to="/events">Skill Workshops</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Contact & Support</h4>
          <p className="footer-contact">Student Activities Council</p>
          <p className="footer-contact">Email: aryavartmishra20@gmail.com</p>
          <p className="footer-contact">Phone: 8767983457</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {CURRENT_YEAR} CampusConnect - College Event Management System. Built with React.</p>
      </div>
    </footer>
  );
}

export default Footer;
