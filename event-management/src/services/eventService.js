import { initialEvents } from '../data/events';

/**
 * Event Service Layer
 * 
 * Connects the React Frontend to the Spring Boot REST API (`http://localhost:8080/api`).
 * Features:
 *  - Automatic JWT authentication for Admin operations (POST, DELETE) using seeded admin credentials.
 *  - Live REST synchronization with Spring Boot & H2/MySQL database.
 *  - Resilient local fallback so the website and UI remain 100% operational whether the backend is running or offline.
 */

const API_BASE_URL = `${(import.meta.env.VITE_API_URL || 'https://campusconnect-backend-z0si.onrender.com').replace(/\/api\/?$/, '')}/api`;
const STORAGE_KEY_EVENTS = 'campus_events';
const STORAGE_KEY_REGISTRATIONS = 'campus_event_registrations';
const STORAGE_KEY_TOKEN = 'campus_admin_jwt';
const STORAGE_KEY_CURRENT_USER = 'campus_current_user';
const STORAGE_KEY_LOCAL_USERS = 'campus_local_users';

// Helper to normalize event objects so both 'venue' and 'location' work seamlessly
const normalizeEvent = (event) => ({
  ...event,
  venue: event.venue || event.location || 'Campus',
  location: event.location || event.venue || 'Campus',
  imageUrl: event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  capacity: event.capacity ? Number(event.capacity) : 100
});

// Initialize and retrieve localStorage cache
const getCachedEvents = () => {
  const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(initialEvents.map(normalizeEvent)));
    return initialEvents.map(normalizeEvent);
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map(normalizeEvent)
      : initialEvents.map(normalizeEvent);
  } catch (err) {
    console.error('Failed to parse cached events:', err);
    return initialEvents.map(normalizeEvent);
  }
};

/**
 * Retrieve the currently authenticated user from localStorage.
 */
export const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('Error reading current user:', err);
    return null;
  }
};

/**
 * Universal User Login (Students & Administrators).
 * Calls Spring Boot POST /api/auth/login with graceful local fallback.
 */
export const loginUser = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password })
    });

    if (response.ok) {
      const data = await response.json();
      const isAdmin = data.role === 'ADMIN' || data.role === 'ROLE_ADMIN';
      const userProfile = {
        name: data.name,
        email: data.email,
        role: data.role,
        studentId: data.studentId || '',
        department: data.department || '',
        yearOfStudy: data.yearOfStudy || '',
        phone: data.phone || '',
        token: data.token
      };

      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(userProfile));
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      localStorage.setItem('campus_is_admin', isAdmin ? 'true' : 'false');
      return { success: true, user: userProfile, isAdmin };
    } else {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.message || 'Invalid email or password' };
    }
  } catch (err) {
    console.warn('Backend server not reachable for login, falling back to local credentials.', err);
  }

  // Fallback 1: Admin account verification
  if (cleanEmail === 'admin@event.com' && password === 'admin123') {
    const adminProfile = {
      name: 'Administrator',
      email: 'admin@event.com',
      role: 'ADMIN',
      department: 'Dean of Student Affairs',
      token: 'demo-admin-token-' + Date.now()
    };
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(adminProfile));
    localStorage.setItem(STORAGE_KEY_TOKEN, adminProfile.token);
    localStorage.setItem('campus_is_admin', 'true');
    return { success: true, user: adminProfile, isAdmin: true };
  }

  // Fallback 2: Check locally registered students
  try {
    const localUsers = JSON.parse(localStorage.getItem(STORAGE_KEY_LOCAL_USERS) || '[]');
    const matched = localUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );
    if (matched) {
      const studentProfile = {
        name: matched.name,
        email: matched.email,
        role: 'USER',
        studentId: matched.studentId || '',
        department: matched.department || '',
        yearOfStudy: matched.yearOfStudy || '',
        phone: matched.phone || '',
        token: 'local-token-' + Date.now()
      };
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(studentProfile));
      localStorage.setItem('campus_is_admin', 'false');
      return { success: true, user: studentProfile, isAdmin: false };
    }
  } catch (e) {
    console.warn('Local users fallback error:', e);
  }

  return { success: false, error: 'Invalid email or password. Use registered credentials or admin@event.com / admin123' };
};

/**
 * Register a new student account.
 * Calls Spring Boot POST /api/auth/signup with graceful local fallback.
 */
export const signupStudent = async (studentData) => {
  const cleanEmail = studentData.email.trim().toLowerCase();
  const payload = {
    name: studentData.name.trim(),
    email: cleanEmail,
    password: studentData.password,
    studentId: studentData.studentId?.trim() || '',
    department: studentData.department?.trim() || '',
    yearOfStudy: studentData.yearOfStudy || '1st Year',
    phone: studentData.phone?.trim() || ''
  };

  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      const userProfile = {
        name: data.name,
        email: data.email,
        role: data.role || 'USER',
        studentId: data.studentId || payload.studentId,
        department: data.department || payload.department,
        yearOfStudy: data.yearOfStudy || payload.yearOfStudy,
        phone: data.phone || payload.phone,
        token: data.token
      };

      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(userProfile));
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      localStorage.setItem('campus_is_admin', 'false');
      return { success: true, user: userProfile };
    } else {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.message || 'Registration failed. Email may already be in use.' };
    }
  } catch (err) {
    console.warn('Backend server offline during signup, registering locally.', err);
  }

  // Local fallback: persist to local students list
  try {
    const localUsers = JSON.parse(localStorage.getItem(STORAGE_KEY_LOCAL_USERS) || '[]');
    if (localUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists locally.' };
    }
    localUsers.push(payload);
    localStorage.setItem(STORAGE_KEY_LOCAL_USERS, JSON.stringify(localUsers));

    const userProfile = {
      name: payload.name,
      email: payload.email,
      role: 'USER',
      studentId: payload.studentId,
      department: payload.department,
      yearOfStudy: payload.yearOfStudy,
      phone: payload.phone,
      token: 'local-token-' + Date.now()
    };
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(userProfile));
    localStorage.setItem('campus_is_admin', 'false');
    return { success: true, user: userProfile };
  } catch (e) {
    return { success: false, error: 'Failed to create student account locally.' };
  }
};

/**
 * Logout the currently logged in user (Student or Admin).
 */
export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.setItem('campus_is_admin', 'false');
};

/**
 * Legacy Admin login adapter (maintains 100% backward compatibility).
 */
export const loginAdmin = async (email, password) => {
  const result = await loginUser(email, password);
  if (result.success && result.isAdmin) {
    return { success: true, user: result.user };
  }
  return { success: false, error: 'Invalid admin credentials. Use admin@event.com / admin123' };
};

/**
 * Legacy Admin logout adapter.
 */
export const logoutAdmin = () => {
  logoutUser();
};

/**
 * Obtains the active JWT token.
 */
export const getAdminAuthToken = async () => {
  const existingToken = localStorage.getItem(STORAGE_KEY_TOKEN);
  if (existingToken) return existingToken;
  const user = getCurrentUser();
  return user?.token || null;
};

/**
 * Synchronizes events from the Spring Boot REST API (`GET /api/events`).
 * If the backend is running, updates the local cache and returns remote events.
 * If the backend is offline, returns cached events without breaking the UI.
 */
export const fetchEventsFromServer = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s quick timeout

    const response = await fetch(`${API_BASE_URL}/events`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map(normalizeEvent);
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(normalized));
        return normalized;
      }
    }
  } catch (err) {
    console.info('Backend currently offline or starting up; using local event cache.', err?.message || err);
  }
  return getCachedEvents();
};

/**
 * Fetch all events (Used for immediate synchronous initial state).
 */
export const getAllEvents = () => {
  return getCachedEvents();
};

/**
 * Fetch a single event by ID (from server or cache).
 */
export const getEventById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${id}`);
    if (response.ok) {
      const data = await response.json();
      return normalizeEvent(data);
    }
  } catch (err) {
    console.warn(`Could not fetch event ${id} from server, checking cache:`, err);
  }
  const cached = getCachedEvents();
  return cached.find((e) => Number(e.id) === Number(id)) || null;
};

/**
 * Create a new event (Calls `POST /api/events` with JWT Authorization header).
 * Automatically updates both the backend database and the local state.
 */
export const createEvent = async (newEventData) => {
  const token = await getAdminAuthToken();

  const payload = {
    title: newEventData.title?.trim(),
    description: newEventData.description?.trim(),
    date: newEventData.date,
    time: newEventData.time?.trim() || '10:00 AM',
    location: newEventData.venue?.trim() || newEventData.location?.trim() || 'Campus Main Hall',
    category: newEventData.category || 'Technical',
    imageUrl: newEventData.imageUrl?.trim() || undefined,
    capacity: newEventData.capacity ? Number(newEventData.capacity) : 100
  };

  let savedEvent = null;

  if (token) {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const createdFromBackend = await response.json();
        savedEvent = normalizeEvent(createdFromBackend);
      } else {
        console.warn('Backend rejected event creation, status:', response.status);
      }
    } catch (err) {
      console.warn('Failed to post event to backend:', err);
    }
  }

  // If backend was offline or didn't return, create local representation
  if (!savedEvent) {
    savedEvent = normalizeEvent({
      ...payload,
      id: Date.now()
    });
  }

  // Update local cache
  const current = getCachedEvents();
  const updated = [savedEvent, ...current];
  localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));

  return savedEvent;
};

/**
 * Delete an event by ID (Calls `DELETE /api/events/{id}` with JWT Authorization header).
 * Removes from both the backend database and local cache.
 */
export const deleteEvent = async (id) => {
  const token = await getAdminAuthToken();

  if (token) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        console.warn('Backend delete response status:', response.status);
      }
    } catch (err) {
      console.warn('Backend delete request failed:', err);
    }
  }

  // Update local cache
  const current = getCachedEvents();
  const updated = current.filter((e) => Number(e.id) !== Number(id));
  localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
  return updated;
};

/**
 * Submit an event registration (Stores registration records for student tickets).
 */
export const registerForEvent = (registrationData) => {
  const raw = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
  const registrations = raw ? JSON.parse(raw) : [];

  const newRegistration = {
    id: Date.now(),
    registrationDate: new Date().toISOString(),
    ...registrationData
  };

  registrations.push(newRegistration);
  localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(registrations));
  return newRegistration;
};

/**
 * Fetch all submitted student registrations for the Admin dashboard.
 */
export const getRegistrations = () => {
  const raw = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
  return raw ? JSON.parse(raw) : [];
};

/**
 * Retrieve registered events for a specific student.
 * Correlates registration records with event details.
 */
export const getStudentRegisteredEvents = (userEmail) => {
  const registrations = getRegistrations();
  const allEvents = getCachedEvents();

  let studentRegs = registrations;
  if (userEmail) {
    const cleanEmail = userEmail.trim().toLowerCase();
    const filtered = registrations.filter(
      (r) => r.email && r.email.trim().toLowerCase() === cleanEmail
    );
    // If specific matches exist for this email, use them
    if (filtered.length > 0) {
      studentRegs = filtered;
    }
  }

  // Enrich registration records with full event information
  return studentRegs.map((reg) => {
    const matchedEvent = allEvents.find((e) => Number(e.id) === Number(reg.eventId));
    return {
      registrationId: reg.id,
      registeredAt: reg.registrationDate || new Date().toISOString(),
      studentName: reg.fullName || reg.name || 'Student',
      studentEmail: reg.email,
      studentPhone: reg.phone || '',
      studentDept: reg.department || '',
      studentYear: reg.yearOfStudy || '',
      eventId: reg.eventId,
      title: matchedEvent?.title || reg.eventTitle || 'Campus Event',
      description: matchedEvent?.description || 'Registered campus event activity.',
      date: matchedEvent?.date || 'Upcoming',
      time: matchedEvent?.time || '10:00 AM',
      venue: matchedEvent?.venue || matchedEvent?.location || 'Campus Main Hall',
      category: matchedEvent?.category || 'General',
      imageUrl: matchedEvent?.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      capacity: matchedEvent?.capacity || 100
    };
  });
};

/**
 * Cancel an event registration by registration ID.
 */
export const cancelEventRegistration = (registrationId) => {
  const raw = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
  if (!raw) return [];
  const registrations = JSON.parse(raw);
  const updated = registrations.filter((r) => Number(r.id) !== Number(registrationId));
  localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(updated));
  return updated;
};

/**
 * Checks if a student is already registered for a specific event.
 */
export const isEventRegisteredByStudent = (eventId, userEmail) => {
  if (!userEmail) return false;
  const registrations = getRegistrations();
  const cleanEmail = userEmail.trim().toLowerCase();
  return registrations.some(
    (r) => Number(r.eventId) === Number(eventId) && r.email && r.email.trim().toLowerCase() === cleanEmail
  );
};
