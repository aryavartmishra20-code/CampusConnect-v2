import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Login from './pages/Login';
import RegisteredEvents from './pages/RegisteredEvents';

// Service Layer
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
 * App — Root component managing global state: events, currentUser, isAdmin.
 */
function App() {
  const [events, setEvents] = useState(() => {
    try { return getAllEvents(); }
    catch { return []; }
  });

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const [isAdmin, setIsAdmin] = useState(() => {
    const user = getCurrentUser();
    if (user) return user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' || localStorage.getItem('campus_is_admin') === 'true';
    return localStorage.getItem('campus_is_admin') === 'true';
  });

  // Sync with backend on mount
  useEffect(() => {
    let isMounted = true;
    fetchEventsFromServer()
      .then((remoteEvents) => {
        if (isMounted && Array.isArray(remoteEvents) && remoteEvents.length > 0) {
          setEvents(remoteEvents);
        }
      })
      .catch((err) => console.warn('Backend sync note:', err));
    return () => { isMounted = false; };
  }, []);

  const handleLoginSuccess = (userProfile, adminStatus) => {
    setCurrentUser(userProfile);
    setIsAdmin(adminStatus);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const handleLoginAdmin = async (email, password) => {
    const result = await loginAdmin(email, password);
    if (result.success) {
      setIsAdmin(true);
      if (!currentUser) setCurrentUser(result.user);
    }
    return result;
  };

  const handleSwitchToStudent = () => {
    logoutAdmin();
    setIsAdmin(false);
  };

  const handleAddEvent = async (newEventData) => {
    const created = await createEvent(newEventData);
    setEvents((prev) => [created, ...prev]);
  };

  const handleDeleteEvent = async (eventId) => {
    await deleteEvent(eventId);
    setEvents((prev) => prev.filter((e) => Number(e.id) !== Number(eventId)));
  };

  // Determine whether to show footer (Admin layout handles its own full-page layout)
  const showFooter = !isAdmin || !currentUser;

  return (
    <Router>
      <div className="app-container">
        {/* Sticky top Navbar */}
        <Navbar
          isAdmin={isAdmin}
          onSwitchToStudent={handleSwitchToStudent}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            {/* Auth gateway */}
            <Route
              path="/login"
              element={
                currentUser
                  ? <Navigate to={isAdmin ? '/admin' : '/'} replace />
                  : <Login onLoginSuccess={handleLoginSuccess} />
              }
            />

            {/* Not logged in → redirect all to login */}
            {!currentUser ? (
              <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            ) : (
              <>
                <Route path="/" element={<Home events={events} isAdmin={isAdmin} currentUser={currentUser} />} />
                <Route path="/events" element={<Events events={events} currentUser={currentUser} />} />
                <Route path="/register" element={<Register events={events} currentUser={currentUser} />} />
                <Route path="/register/:eventId" element={<Register events={events} currentUser={currentUser} />} />
                <Route path="/registered-events" element={<RegisteredEvents currentUser={currentUser} events={events} />} />
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>

        {/* Footer — hidden in admin dashboard for cleaner layout */}
        {(!isAdmin || !currentUser) && <Footer />}
      </div>
    </Router>
  );
}

export default App;
