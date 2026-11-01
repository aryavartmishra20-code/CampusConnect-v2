# CampusConnect: Architecture & Code Implementation Guide

A comprehensive, student-friendly technical guide explaining the entire **CampusConnect College Event Management Platform**, covering both the **React Frontend** and the **Spring Boot 3 Backend**.

---

## Table of Contents

1. [High-Level Architecture & System Flow](#1-high-level-architecture--system-flow)
2. [Frontend Architecture & Implementation](#2-frontend-architecture--implementation)
   - [Tech Stack & Design Philosophy](#21-frontend-tech-stack--design-philosophy)
   - [Folder & File Structure](#22-frontend-folder--file-structure)
   - [Shared State Management (`App.jsx`)](#23-shared-state-management-appjsx)
   - [Service Layer (`eventService.js`)](#24-service-layer-eventservicejs)
   - [Component Walkthrough](#25-component-walkthrough)
   - [Page Walkthrough](#26-page-walkthrough)
   - [Styling & Design System (`styles.css`)](#27-styling--design-system-stylescss)
3. [Backend Architecture & Implementation](#3-backend-architecture--implementation)
   - [Tech Stack & Layered Pattern](#31-backend-tech-stack--layered-pattern)
   - [Package & Class Structure](#32-backend-package--class-structure)
   - [Data Models & Entities (`User`, `Event`, `Role`)](#33-data-models--entities)
   - [Repository Layer (`Spring Data JPA`)](#34-repository-layer-spring-data-jpa)
   - [Service & Business Logic Layer](#35-service--business-logic-layer)
   - [Controller & REST API Endpoints](#36-controller--rest-api-endpoints)
   - [Security & JWT Authentication Pipeline](#37-security--jwt-authentication-pipeline)
   - [Database & Seed Data (`DataSeeder`)](#38-database--seed-data-dataseeder)
4. [Connecting Frontend to Backend (Integration Guide)](#4-connecting-frontend-to-backend-integration-guide)
5. [How to Run and Test Both Systems](#5-how-to-run-and-test-both-systems)
6. [Quick Viva / Interview Q&A Cheatsheet](#6-quick-viva--interview-qa-cheatsheet)

---

## 1. High-Level Architecture & System Flow

CampusConnect is structured as a decoupled **Client-Server Architecture**:

```text
+-----------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER                                       |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |                       React Single Page Application (SPA)                       |   |
|   |  - React Router DOM v7 (Route navigation: /, /events, /register/:id, /admin)    |   |
|   |  - Centralized State (Lifting State Up in App.jsx)                              |   |
|   |  - Event Service Layer (eventService.js -> localStorage / REST fetch)           |   |
|   |  - Pure Vanilla CSS Design System (styles.css)                                  |   |
|   +---------------------------------------------------------------------------------+   |
+--------------------------------------------+--------------------------------------------+
                                             |
                                  HTTP / JSON (REST APIs)
                          CORS Allowed (http://localhost:5173)
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                  SPRING BOOT 3 BACKEND                                  |
|                                                                                         |
|   +-----------------------+     +-----------------------+     +---------------------+   |
|   |   Security Filter     | --> |   Controller Layer    | --> |    Service Layer    |   |
|   | (JwtAuthentication-   |     |  (AuthController,     |     | (AuthService,       |   |
|   |  Filter + BCrypt)     |     |   EventController)    |     |  EventService)      |   |
|   +-----------------------+     +-----------------------+     +----------+----------+   |
|                                                                          |              |
|                                                                          v              |
|   +-----------------------+     +-----------------------+     +---------------------+   |
|   |    Database (H2 /     | <-- | Hibernate / JPA ORM   | <-- |   Repository Layer  |   |
|   |        MySQL)         |     | (Entity Mapping)      |     | (UserRepository,    |   |
|   |                       |     |                       |     |  EventRepository)   |   |
|   +-----------------------+     +-----------------------+     +---------------------+   |
+-----------------------------------------------------------------------------------------+
```

### Key Architectural Strengths
1. **Decoupled Frontend & Backend**: The React frontend and Spring Boot backend run independently on separate ports (`5173` and `8080`).
2. **Pluggable Service Layer**: The frontend utilizes an abstraction module (`eventService.js`). Switching from browser `localStorage` to the Spring Boot REST API requires editing only one file without touching any UI component.
3. **Stateless Security**: The backend uses JSON Web Tokens (JWT). The server does not maintain session state in memory, allowing horizontal scaling.

---

## 2. Frontend Architecture & Implementation

### 2.1. Frontend Tech Stack & Design Philosophy

- **Framework**: React 19 (Functional Components & Hooks).
- **Routing**: `react-router-dom` v7 (`BrowserRouter`, `Routes`, `Route`, `NavLink`, `Link`, `useParams`, `useNavigate`).
- **Build Tool**: Vite (Lightning-fast HMR and bundling).
- **Styling**: Single global CSS file (`styles.css`) using CSS Custom Properties (Variables), Flexbox, CSS Grid, and responsive media queries.
- **Dependencies**: Zero external UI component libraries (no Tailwind, Bootstrap, or Material UI), keeping the code clean, transparent, and easy to explain during code reviews.

---

### 2.2. Frontend Folder & File Structure

```text
event-management/
├── index.html                     # HTML root template with viewport & Google Fonts
├── vite.config.js                 # Vite bundler config with React plugin
├── package.json                   # Project scripts and dependencies
└── src/
    ├── main.jsx                   # Entry file mounting React to the DOM #root
    ├── App.jsx                    # Root component with shared state & routes
    ├── styles.css                 # Complete responsive CSS design system
    ├── data/
    │   └── events.js              # Mock/initial dataset matching backend schema
    ├── services/
    │   └── eventService.js        # Data access layer (localStorage + API bridge)
    ├── components/
    │   ├── Navbar.jsx             # Sticky navigation bar with mobile toggle
    │   ├── EventCard.jsx          # Reusable event card with date formatter
    │   └── Footer.jsx             # Informational footer with categories & copyright
    └── pages/
        ├── Home.jsx               # Landing page with hero, stats, and preview
        ├── Events.jsx             # Events catalog with search & category filters
        ├── Register.jsx           # Dynamic registration form with validation
        └── Admin.jsx              # Admin control panel (Create, Delete, Attendee list)
```

---

### 2.3. Shared State Management (`App.jsx`)

Instead of introducing heavy third-party state libraries like Redux or Zustand, the project implements the standard React pattern known as **Lifting State Up**.

#### How it works:
1. **State Initialization**:
   ```javascript
   const [events, setEvents] = useState(() => {
     try {
       return getAllEvents();
     } catch (error) {
       console.error('Failed to load events:', error);
       return [];
     }
   });
   ```
   A **lazy initializer** function is passed to `useState()`. This ensures that `getAllEvents()` runs once on startup rather than running on every re-render.

2. **Prop Drilling down to Pages**:
   - `events` is passed down to `<Home events={events} />`, `<Events events={events} />`, `<Register events={events} />`, and `<Admin events={events} />`.
3. **Synchronous Updates**:
   - When an event is created in `Admin.jsx`, `handleAddEvent(newEvent)` is invoked.
   - It saves the event via `eventService.js` and immediately calls `setEvents((prev) => [created, ...prev])`.
   - Because `events` is shared across routes in `App.jsx`, navigating to Home (`/`) or Events (`/events`) shows the newly added event instantly without any page refresh.
4. **Instant Deletion**:
   - `handleDeleteEvent(id)` filters out the deleted event using `setEvents((prev) => prev.filter(e => e.id !== id))` while updating persistent storage.

---

### 2.4. Service Layer (`eventService.js`)

`eventService.js` acts as an isolation barrier between the React presentation components and the data storage mechanism.

#### Key Functions:
- `getAllEvents()`: Retrieves events from `localStorage`. If empty, seeds initial records from `events.js`.
- `getEventById(id)`: Looks up a specific event matching `id`.
- `createEvent(newEventData)`: Assigns a unique ID (`Date.now()`), sets fallback image URLs, prepends the event to storage, and returns the created object.
- `deleteEvent(id)`: Removes the event by ID and updates storage.
- `registerForEvent(registrationData)`: Stores student registration records with a generated confirmation ID and timestamp.
- `getRegistrations()`: Returns all submitted student registrations for the Admin dashboard.

---

### 2.5. Component Walkthrough

#### 1. `Navbar.jsx`
- Uses `NavLink` from `react-router-dom`. The callback `{ isActive }` dynamically applies `.active` class styles so the user always knows what page they are viewing.
- Features a mobile hamburger toggle (`mobileMenuOpen` state) that toggles `.nav-menu.open` on smartphones.

#### 2. `EventCard.jsx`
- Accepts a single `event` prop.
- Contains an internal helper `formatDate()` that transforms ISO dates (e.g. `2026-11-15`) into human-readable strings (`Nov 15, 2026`).
- Implements an image error handler (`onError`) that gracefully switches to a high-resolution fallback image if an external URL is broken.
- Shows dynamic category color pills (`.category-technical`, `.category-cultural`, `.category-sports`, `.category-workshop`).
- Includes a direct "Register Now" button linking to `/register/:eventId`.

#### 3. `Footer.jsx`
- Displays branding, quick links, event categories, and contact information.
- Dynamically resolves `new Date().getFullYear()` outside the render loop for optimal purity and performance.

---

### 2.6. Page Walkthrough

#### 1. `Home.jsx` (`/`)
- **Hero Banner**: Displays welcoming header, tagline, and call-to-action buttons ("View Events", "Admin Dashboard").
- **Quick Statistics**: Shows active event count, categories, registration cost, and availability.
- **Featured / Upcoming Cards**: Takes the first 3 events from `events.slice(0, 3)` and renders dynamic `<EventCard />` items.
- **Value Proposition**: 3 benefit cards explaining skill development, networking, and prizes.

#### 2. `Events.jsx` (`/events`)
- **Search Filter**: Controlled text input tracking `searchTerm`. Filters by event title in real time (`title.toLowerCase().includes(...)`).
- **Category Filter**: Buttons for *All, Technical, Cultural, Sports, Workshop*. Clicking any updates `selectedCategory`.
- **Combined Filtering**: Uses array `.filter()` where both conditions must be true:
  ```javascript
  const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase().trim());
  const matchesCategory = selectedCategory === 'All' || event.category?.toLowerCase() === selectedCategory.toLowerCase();
  return matchesSearch && matchesCategory;
  ```
- **Live Counter & Reset**: Shows current count (e.g. "Showing 4 of 6 events") with a reset button.

#### 3. `Register.jsx` (`/register` and `/register/:eventId`)
- **URL Parameter Binding**: Extracts `eventId` via `useParams()`.
- **Smart Event Fallback**: If visited without an ID (`/register`), it automatically selects the first available event and provides a dropdown selector to change events.
- **Two-Column Layout**:
  - Left Column: Selected event summary (image, category, date, time, venue, description).
  - Right Column: Student registration form.
- **Form Fields**: Full Name, Email, Phone Number, Department, Year of Study.
- **Real-Time Client Validation**:
  - Required fields check.
  - Full Name minimum length (3 characters).
  - Strict Email regex pattern validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
  - Strict 10-digit Phone validation (`/^\d{10}$/`).
- **Success Receipt View**: On valid submission, transitions to a confirmation receipt showing Confirmation ID, attendee details, and venue instructions.

#### 4. `Admin.jsx` (`/admin`)
- **Metric Cards**: Real-time totals for Events, Registrations, Categories, and Status.
- **Tab Navigation**: Toggle between *Manage & Create Events* and *View Registered Students*.
- **Create Event Form**: Validated form with Title, Category, Date, Time, Venue, Optional Image URL, and Description.
- **Immediate State Synchronization**: Directly invokes `onAddEvent` passed from `App.jsx`.
- **Event Deletion**: Triggers confirmation dialog `window.confirm()`, invokes `onDeleteEvent`, and flashes an alert banner.
- **Registered Attendees Table**: Inspects all registered students with names, emails, phones, departments, and event titles.

---

### 2.7. Styling & Design System (`styles.css`)

The styles are written in standard CSS3 without external preprocessors:
- **Design Tokens (`:root`)**:
  - Primary color: `#2563eb` (Royal Blue) with hover `#1d4ed8` and light accent `#eff6ff`.
  - Background: `#f4f6f9` (Soft off-white / light slate).
  - Card background: `#ffffff` with subtle shadows (`--shadow-sm`, `--shadow-md`).
  - Text colors: Slate primary `#1e293b` and secondary `#64748b`.
  - Alert colors: Danger `#ef4444` and Success `#10b981`.
- **Responsive Breakpoints**:
  - `@media (max-width: 900px)`: Converts 2-column forms and grids to 1 column.
  - `@media (max-width: 640px)`: Activates mobile hamburger drawer navigation.

---

## 3. Backend Architecture & Implementation

### 3.1. Backend Tech Stack & Layered Pattern

The backend is built with modern **Spring Boot 3** on **Java 17**:
- **Spring Web**: RESTful API endpoints, HTTP request mapping, JSON serialization.
- **Spring Data JPA & Hibernate**: Object-Relational Mapping (ORM) and automated database CRUD queries.
- **Spring Security 6 & JJWT (`0.12.x`)**: Stateless security filter chain, BCrypt hashing, and signed JWT issuance.
- **Jakarta Validation**: DTO input constraint checking (`@NotBlank`, `@Email`, `@Min`, `@Size`).
- **H2 In-Memory Database**: Zero-configuration default database with automatic schema generation and web console.
- **MySQL Driver**: Production-ready database driver configurable via `application.properties`.

#### The 4-Tier Layered Architecture:
```text
Controller Layer (REST Endpoints)
       ↓
Service Layer (Business Logic & Validations)
       ↓
Repository Layer (Spring Data JPA)
       ↓
Database Layer (H2 / MySQL)
```

---

### 3.2. Backend Package & Class Structure

```text
backend/src/main/java/com/example/eventapp/
├── EventApplication.java               # Spring Boot entry point (@SpringBootApplication)
│
├── config/
│   ├── SecurityConfig.java            # SecurityFilterChain, PasswordEncoder, CORS config
│   └── DataSeeder.java                # CommandLineRunner seeding default Admin & Events
│
├── controller/
│   ├── AuthController.java            # /api/auth (signup, login)
│   └── EventController.java           # /api/events (CRUD operations & search)
│
├── dto/
│   ├── SignupRequest.java             # Incoming payload for user signup
│   ├── LoginRequest.java              # Incoming payload for user login
│   ├── AuthResponse.java              # Outgoing JWT token and user info
│   ├── EventRequest.java              # Incoming payload for event creation/update
│   └── MessageResponse.java           # Generic response for status messages
│
├── model/
│   ├── User.java                      # JPA Entity mapped to 'users' table
│   ├── Event.java                     # JPA Entity mapped to 'events' table
│   └── Role.java                      # Enum (ROLE_USER, ROLE_ADMIN)
│
├── repository/
│   ├── UserRepository.java            # Spring Data JPA interface for User queries
│   └── EventRepository.java           # Spring Data JPA interface for Event queries
│
├── service/
│   ├── AuthService.java               # User registration, authentication, JWT issuing
│   └── EventService.java              # Event creation, updates, lookup, deletion logic
│
├── security/
│   ├── JwtUtil.java                   # Signs, parses, and validates HMAC-SHA JWT tokens
│   ├── JwtAuthenticationFilter.java   # OncePerRequestFilter intercepting Authorization header
│   ├── CustomUserDetailsService.java  # Loads UserDetails from database
│   ├── CustomAuthenticationEntryPoint.java # Handles 401 Unauthorized errors in JSON
│   └── CustomAccessDeniedHandler.java # Handles 403 Forbidden errors in JSON
│
└── exception/
    ├── ResourceNotFoundException.java # Thrown when an ID does not exist (404)
    ├── BadRequestException.java       # Thrown for business rule violations (400)
    └── GlobalExceptionHandler.java    # @ControllerAdvice converting exceptions to clean JSON
```

---

### 3.3. Data Models & Entities

#### 1. `Event.java` (Database Table: `events`)
Mapped using JPA annotations:
- `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)`: Auto-increment primary key.
- `title`: Event name (VARCHAR 150).
- `description`: Detailed text (VARCHAR 2000).
- `date`: Date of the event (`LocalDate`).
- `time`: Time string (e.g. "10:00 AM").
- `venue`: Physical hall or lab location.
- `category`: Category name (*Technical, Cultural, Sports, Workshop*).
- `imageUrl`: Optional banner URL.
- `capacity`: Maximum allowed attendees.

#### 2. `User.java` (Database Table: `users`)
- `id`: Auto-increment primary key.
- `name`: Full name.
- `email`: Unique email address used as login username (`@Column(unique = true)`).
- `password`: BCrypt hashed password (raw passwords are never stored).
- `role`: Enumerated role (`Role.USER` or `Role.ADMIN`).

---

### 3.4. Repository Layer (`Spring Data JPA`)

Spring Data JPA dynamically generates database queries at runtime without requiring manual SQL queries:

```java
// EventRepository.java
public interface EventRepository extends JpaRepository<Event, Long> {
    // Dynamic derived query searching title ignoring case
    List<Event> findByTitleContainingIgnoreCase(String keyword);
    
    // Dynamic derived query filtering by category
    List<Event> findByCategoryIgnoreCase(String category);
}
```

```java
// UserRepository.java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

---

### 3.5. Service & Business Logic Layer

#### `EventService.java`
- `getAllEvents()`: Retrieves all events sorted by date ascending.
- `getEventById(Long id)`: Looks up event or throws `ResourceNotFoundException("Event not found with id: " + id)`.
- `createEvent(EventRequest request)`: Validates that the event date is not in the past and saves the entity.
- `updateEvent(Long id, EventRequest request)`: Updates fields on an existing record.
- `deleteEvent(Long id)`: Checks existence and deletes the record.

#### `AuthService.java`
- `signup(SignupRequest request)`:
  1. Checks if email is already registered (`userRepository.existsByEmail`).
  2. Hashes password using `passwordEncoder.encode(request.getPassword())`.
  3. Saves user with default role `ROLE_USER`.
  4. Generates and returns a signed JWT token.
- `login(LoginRequest request)`:
  1. Authenticates credentials using `AuthenticationManager`.
  2. Generates a fresh JWT token with the user's role and email.

---

### 3.6. Controller & REST API Endpoints

| HTTP Method | Endpoint | Description | Access Level |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Registers new student account | Public |
| `POST` | `/api/auth/login` | Authenticates user & returns JWT | Public |
| `GET` | `/api/events` | Retrieves all events | Public |
| `GET` | `/api/events/{id}` | Retrieves single event details | Public |
| `GET` | `/api/events/search?keyword=hack` | Search events by title keyword | Public |
| `POST` | `/api/events` | Creates a new event | Admin Only (`ROLE_ADMIN`) |
| `PUT` | `/api/events/{id}` | Updates existing event | Admin Only (`ROLE_ADMIN`) |
| `DELETE` | `/api/events/{id}` | Deletes an event | Admin Only (`ROLE_ADMIN`) |

---

### 3.7. Security & JWT Authentication Pipeline

The application uses **Spring Security 6** with a stateless token pipeline:

```text
Incoming Request -> JwtAuthenticationFilter -> SecurityContextHolder -> Controller
```

1. **Token Extraction**:
   `JwtAuthenticationFilter` intercepts every HTTP request and checks the `Authorization` header:
   ```text
   Authorization: Bearer <eyJhbGciOiJIUzI1NiJ9...>
   ```
2. **Token Validation**:
   `JwtUtil` validates the cryptographic signature using HMAC-SHA256 and checks expiration (24 hours).
3. **Authentication Context**:
   The user's email and authorities (`ROLE_ADMIN` / `ROLE_USER`) are set in Spring's `SecurityContextHolder`.
4. **Endpoint Authorization**:
   In `SecurityConfig.java`:
   - `/api/events/**` GET requests: `permitAll()`
   - `/api/events/**` POST/PUT/DELETE requests: `hasRole("ADMIN")`
   - `/api/auth/**` requests: `permitAll()`

---

### 3.8. Database & Seed Data (`DataSeeder`)

When the application boots, `DataSeeder.java` checks if the database is empty. If empty, it creates:
1. **Default Administrator**:
   - Email: `admin@event.com`
   - Password: `admin123` (Encrypted with BCrypt)
   - Role: `ROLE_ADMIN`
2. **Initial Campus Events**:
   - Annual Campus Hackathon
   - Cloud Computing & DevOps Workshop
   - Inter-College Cultural Gala

---

## 4. Connecting Frontend to Backend (Integration Guide)

Currently, the React frontend persists data in the browser's `localStorage` via `eventService.js`. When you are ready to connect to the Spring Boot REST API, update `src/services/eventService.js` to call the live backend endpoints.

### Step 1: Set the API Base URL
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### Step 2: Update the Service Methods
Replace the `localStorage` implementations in `eventService.js` with `fetch` calls:

```javascript
// 1. Fetch All Events (GET /api/events)
export const getAllEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/events`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return await response.json();
};

// 2. Fetch Single Event (GET /api/events/:id)
export const getEventById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`);
  if (!response.ok) throw new Error('Event not found');
  return await response.json();
};

// 3. Create Event (POST /api/events)
export const createEvent = async (newEventData, token) => {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // JWT token from login
    },
    body: JSON.stringify(newEventData)
  });
  if (!response.ok) throw new Error('Failed to create event');
  return await response.json();
};

// 4. Delete Event (DELETE /api/events/:id)
export const deleteEvent = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete event');
  return true;
};
```

> **Note on CORS**: `SecurityConfig.java` in the backend is already configured to permit requests originating from `http://localhost:5173` (Vite's default port).

---

## 5. How to Run and Test Both Systems

### Step 1: Start the Spring Boot Backend
Open a terminal in the project root:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*(On macOS/Linux, run `./mvnw spring-boot:run`)*
- Backend will start at: `http://localhost:8080`
- H2 Database Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:eventdb`, User: `sa`, Password: *blank*)

### Step 2: Start the React Frontend
Open a second terminal window:
```powershell
cd event-management
npm run dev
```
- Open your browser at: `http://localhost:5173`

### Step 3: Test End-to-End Features
1. **Home (`/`)**: View the hero section and verify event cards load dynamically from state.
2. **Events (`/events`)**: Type a keyword in the search bar or click category buttons (*Technical, Cultural, Sports, Workshop*) to test real-time filtering.
3. **Register (`/register/:eventId`)**: Click "Register Now" on any card. Fill in name, email, phone, department, and year. Submit the form to view the confirmation receipt.
4. **Admin Dashboard (`/admin`)**:
   - Create a new event with title, date, venue, and description.
   - Click "+ Publish Event".
   - Notice the event count updates immediately.
   - Switch to the Home or Events page to see the newly created event appear instantly without a page refresh.
   - Return to `/admin` and click "Delete" on an event to verify instant removal.
   - Click the "View Registered Students" tab to see all submitted student registrations.

---

## 6. Quick Viva / Interview Q&A Cheatsheet

### Frontend Questions

**Q1: Why did you use React Router instead of standard `<a>` tags?**  
*Answer:* Standard `<a>` tags trigger a full browser page refresh, re-downloading HTML and resetting state. React Router's `<Link>` and `<NavLink>` perform client-side routing by manipulating browser history without reloading, preserving memory state and providing instant transitions.

**Q2: How does the Admin page immediately update the Home and Events pages?**  
*Answer:* We implemented the **Lifting State Up** pattern in `App.jsx`. The `events` array lives at the top of the component tree. When `Admin.jsx` creates or deletes an event, it calls handler functions passed down as props (`handleAddEvent`, `handleDeleteEvent`). This updates the central state, causing all child pages to re-render with the latest data.

**Q3: How are form errors handled in registration?**  
*Answer:* We use a custom `validateForm()` function before submission that checks required fields, email format with regex, and phone length (10 digits). Errors are stored in an `errors` state object and rendered conditionally beneath each input with CSS `.input-error` borders.

---

### Backend Questions

**Q1: Why did you choose Spring Boot 3 and Java 17?**  
*Answer:* Spring Boot 3 provides production-ready defaults, auto-configuration, and integrated embedded Tomcat. Java 17 is a Long-Term Support (LTS) release offering performance optimizations, enhanced security, and pattern matching.

**Q2: What is the purpose of the 4-layer architecture?**  
*Answer:* Separation of Concerns. The **Controller** handles HTTP requests and input validation; the **Service** executes business logic and security rules; the **Repository** abstracts database queries via JPA; and the **Entity** represents the relational table schema.

**Q3: How does JWT authentication work in this application?**  
*Answer:* When an admin logs in at `/api/auth/login`, Spring Security verifies credentials with BCrypt. `JwtUtil` issues a signed, time-limited token containing the user's email and role. Subsequent requests send this token in the `Authorization: Bearer <token>` header. `JwtAuthenticationFilter` validates the signature on every request without requiring session storage on the server.

**Q4: How easily can the project switch from H2 to MySQL?**  
*Answer:* Because we use Spring Data JPA and Hibernate, no Java code changes are needed. We simply uncomment the MySQL datasource URL, username, password, and dialect in `application.properties`, and Hibernate automatically generates the tables in MySQL.
