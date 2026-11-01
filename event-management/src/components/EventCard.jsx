import React from 'react';
import { Link } from 'react-router-dom';

/**
 * EventCard Component
 * 
 * Reusable card displaying summary details for an individual event.
 * Props:
 *  - event: Event object with id, title, description, date, time, venue, category, imageUrl
 */
function EventCard({ event }) {
  // Format readable date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="event-card">
      {/* Event Image Banner */}
      <div className="event-card-image-wrap">
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          className="event-card-image"
          onError={(e) => {
            // Fallback image if custom URL fails to load
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <span className={`event-category-badge category-${(event.category || 'other').toLowerCase()}`}>
          {event.category || 'General'}
        </span>
      </div>

      {/* Card Content Details */}
      <div className="event-card-body">
        <h3 className="event-title">{event.title}</h3>

        <div className="event-meta">
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">⏰</span>
            <span>{event.time || 'TBA'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📍</span>
            <span>{event.venue || event.location || 'Campus'}</span>
          </div>
        </div>

        <p className="event-description">
          {event.description && event.description.length > 120
            ? `${event.description.substring(0, 120)}...`
            : event.description || 'No description provided.'}
        </p>

        {/* Action Button */}
        <div className="event-card-footer">
          <Link to={`/register/${event.id}`} className="btn btn-primary btn-block">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
