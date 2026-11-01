import React, { useState } from 'react';
import EventCard from '../components/EventCard';

/**
 * Events Page Component
 * 
 * Displays full catalog of events with:
 *  - Real-time search by title
 *  - Category filter pills (All, Technical, Cultural, Sports, Workshop)
 *  - Responsive grid layout of EventCard components
 */
function Events({ events }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories list for filter buttons
  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop'];

  // Filter events based on active category and search term
  const filteredEvents = events.filter((event) => {
    // 1. Check title search match (case-insensitive)
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());

    // 2. Check category filter match
    const matchesCategory =
      selectedCategory === 'All' ||
      event.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page events-page">
      <div className="page-header">
        <h1 className="page-title">Explore Campus Events</h1>
        <p className="page-subtitle">
          Browse upcoming technical symposiums, sports leagues, cultural fests, and workshops.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="filter-controls-container">
        {/* Search Input Bar */}
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Events Count Indicator */}
      <div className="events-count-bar">
        <span>Showing <strong>{filteredEvents.length}</strong> of {events.length} events</span>
        {(searchTerm || selectedCategory !== 'All') && (
          <button
            className="btn-reset-filters"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Responsive Event Grid */}
      {filteredEvents.length > 0 ? (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No matching events found</h3>
          <p>Try searching for a different keyword or reset your category filters.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
          >
            Show All Events
          </button>
        </div>
      )}
    </div>
  );
}

export default Events;
