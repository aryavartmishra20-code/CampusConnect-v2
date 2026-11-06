import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * EventCard — Premium dark SaaS event card with hover animations.
 */

const categoryImages = {
  technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  cultural: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  sports: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
  workshop: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
};

function EventCard({ event, index = 0 }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const catKey = (event.category || 'default').toLowerCase();
  const fallbackImage = categoryImages[catKey] || categoryImages.default;

  return (
    <motion.div
      className="event-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
      layout
    >
      {/* Image */}
      <div className="event-card-image-wrap">
        <img
          src={event.imageUrl || fallbackImage}
          alt={event.title}
          className="event-card-image"
          onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
        />
        <div className="event-card-image-overlay" />
        <span className={`event-category-badge category-${catKey}`}>
          {event.category || 'General'}
        </span>
      </div>

      {/* Body */}
      <div className="event-card-body">
        <h3 className="event-title">{event.title}</h3>

        <div className="event-meta">
          <div className="meta-item">
            <svg className="meta-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(event.date)}</span>
            {event.time && <span style={{ color: 'var(--text-muted)' }}>• {event.time}</span>}
          </div>
          <div className="meta-item">
            <svg className="meta-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{event.venue || event.location || 'Campus'}</span>
          </div>
        </div>

        <p className="event-description">
          {event.description && event.description.length > 110
            ? `${event.description.substring(0, 110)}…`
            : event.description || 'No description provided.'}
        </p>

        <div className="event-card-footer">
          <Link
            to={`/register/${event.id}`}
            className="btn btn-primary btn-block"
            style={{ marginTop: '4px' }}
          >
            Register Now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default EventCard;
