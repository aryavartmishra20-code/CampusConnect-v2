import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EventCard from '../components/EventCard';

/**
 * Events Catalog Page — Premium event discovery with search and filters.
 */
function Events({ events }) {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop'];

  // Read search param from hero search redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) setSearchTerm(q);
  }, [location.search]);

  // Simulate a brief loading state on mount
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesCategory =
      selectedCategory === 'All' ||
      event.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page events-page">
      {/* Page Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="section-label">🗓️ Catalog</div>
        <h1 className="page-title">Explore Campus Events</h1>
        <p className="page-subtitle">
          Browse hackathons, cultural festivals, sports tournaments, and skill workshops — all in one place.
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        className="filter-controls-container"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="search-bar-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search events by title…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')} title="Clear search">
              ×
            </button>
          )}
        </div>

        <div className="category-filters">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              className={`filter-btn${selectedCategory === cat ? ' active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              whileTap={{ scale: 0.96 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Count Bar */}
      <div className="events-count-bar">
        <span>
          Showing <strong>{filteredEvents.length}</strong> of {events.length} events
        </span>
        {(searchTerm || selectedCategory !== 'All') && (
          <button
            className="btn-reset-filters"
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
          >
            ✕ Reset Filters
          </button>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="events-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ height: 190 }} />
              <div style={{ padding: 20 }}>
                <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 40 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <motion.div className="events-grid" layout>
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-icon">🔍</div>
          <h3>No matching events found</h3>
          <p>Try searching with a different keyword or reset your category filters.</p>
          <button
            className="btn btn-primary"
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            style={{ marginTop: 8 }}
          >
            Show All Events
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default Events;
