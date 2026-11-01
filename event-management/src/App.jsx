import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Pages
import Home from './pages/Home';
import Events from './pages/Events';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Login from './pages/Login';
import RegisteredEvents from './pages/RegisteredEvents';

// Import Service Layer
import {
  getAllEvents,
  fetchEventsFromServer,
  createEvent,
  deleteEvent,
  loginAdmin,
  logoutAdmin,
  getCurrentUser,
  logoutUser
} from './services/eventService';

/**
 * Main Application Component (App.jsx)
 * 
 * Manages the shared `events` state, `currentUser` session, and `isAdmin` role.
 * When first entering the site, visitors are presented with the Login & Registration gateway.
 */
function App() {
  // Shared events state across the application, initialized from eventService
  const [events, setEvents] = useState(() => {
    try {
      return getAllEvents();
    } catch (error) {
      console.error('Failed to load events:', error);
      return [];
    }
  });

  // Current logged in user session (Student or Admin)
  const [currentUser, setCurrentUser] = useState(() => {
    return getCurrentUser();
  });

  // Role State: false = Student Site, true = Admin Site
  const [isAdmin, setIsAdmin] = useState(() => {
    const user = getCurrentUser();
    if (user) {
      return user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' || localStorage.getItem('campus_is_admin') === 'true';
    }
    return localStorage.getItem('campus_is_admin') === 'true';
  });

  // Automatically sync with Spring Boot backend when available
  useEffect(() => {
    let isMounted = true;
    fetchEventsFromServer()
      .then((remoteEvents) => {
        if (isMounted && Array.isArray(remoteEvents) && remoteEvents.length > 0) {
          setEvents(remoteEvents);
        }
      })
      .catch((err) => {
        console.warn('Backend sync note:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Universal Login / Signup handler (called by Login page)
   */
  const handleLoginSuccess = (userProfile, adminStatus) => {
    setCurrentUser(userProfile);
    setIsAdmin(adminStatus);
  };

  /**
   * User Logout handler
   */
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  /**
   * Admin Login handler to verify credentials and switch to Admin Site
   */
  const handleLoginAdmin = async (email, password) => {
    const result = await loginAdmin(email, password);
    if (result.success) {
      setIsAdmin(true);
      if (!currentUser) {
        setCurrentUser(result.user);
      }
    }
    return result;
  };

  /**
   * Switch back to Student Site
   */
  const handleSwitchToStudent = () => {
    logoutAdmin();
    setIsAdmin(false);
  };

  /**
   * Handler to add a new event from Admin dashboard.
   * Immediately updates React state and persists to Spring Boot & database.
   */
  const handleAddEvent = async (newEventData) => {
    const created = await createEvent(newEventData);
    setEvents((prev) => [created, ...prev]);
  };

  /**
   * Handler to delete an event by ID from Admin dashboard.
   * Immediately updates React state and removes from Spring Boot & database.
   */
  const handleDeleteEvent = async (eventId) => {
    await deleteEvent(eventId);
    setEvents((prev) => prev.filter((event) => Number(event.id) !== Number(eventId)));
  };

  return (
    <Router>
      <div className="app-container">
        {/* Top Navbar with role switcher, user profile badge, and logout */}
        <Navbar
          isAdmin={isAdmin}
          onSwitchToStudent={handleSwitchToStudent}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Main Content View with React Router */}
        <main className="main-content">
          <Routes>
            {/* Login / Registration Gateway */}
            <Route
              path="/login"
              element={
                currentUser ? (
                  <Navigate to={isAdmin ? '/admin' : '/'} replace />
                ) : (
                  <Login onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            {/* When not logged in, any attempt to visit the site redirects to /login */}
            {!currentUser ? (
              <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            ) : (
              <>
                {/* 1. Home Page ("/") */}
                <Route path="/" element={<Home events={events} isAdmin={isAdmin} currentUser={currentUser} />} />

                {/* 2. Events Catalog Page ("/events") */}
                <Route path="/events" element={<Events events={events} currentUser={currentUser} />} />

                {/* 3. Registration Page ("/register" & "/register/:eventId") */}
                <Route path="/register" element={<Register events={events} currentUser={currentUser} />} />
                <Route path="/register/:eventId" element={<Register events={events} currentUser={currentUser} />} />

                {/* 4. Registered Events Page ("/registered-events") */}
                <Route path="/registered-events" element={<RegisteredEvents currentUser={currentUser} events={events} />} />

                {/* 4. Admin Dashboard Page ("/admin") */}
                <Route
                  path="/admin"
                  element={
                    <Admin
                      events={events}
                      onAddEvent={handleAddEvent}
                      onDeleteEvent={handleDeleteEvent}
                      isAdmin={isAdmin}
                      onLoginAdmin={handleLoginAdmin}
                      onSwitchToStudent={handleSwitchToStudent}
                    />
                  }
                />

                {/* Fallback route for unknown URLs */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>

        {/* Bottom Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
