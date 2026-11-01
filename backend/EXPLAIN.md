# CampusConnect - Project Explanation & Viva Guide

This document is prepared specifically for viva presentations. It explains how this Spring Boot application works under the hood using clear, simple English without confusing jargon.

---

## Section A: Architecture Overview

Our backend is built using a **Layered Architecture**. Each layer has one specific responsibility:

```text
[ Browser / Frontend / Postman ]
               |
        HTTP Request (JSON)
               v
   [ 1. Controller Layer ]       <-- AuthController, EventController
               |                     (Receives requests, validates inputs, sends responses)
         Java Method Call
               v
    [ 2. Service Layer ]         <-- AuthService, EventService
               |                     (Contains business logic, password hashing, rules)
         Java Method Call
               v
   [ 3. Repository Layer ]       <-- UserRepository, EventRepository
               |                     (Executes SQL queries using Spring Data JPA)
           SQL Query
               v
    [ 4. Database Layer ]        <-- H2 In-Memory Database / MySQL
                                     (Stores rows in 'users' and 'events' tables)
```

### Why Strict Layering Matters
* **Controllers** never touch the Database or Repositories directly. They only talk to Services.
* **Services** contain the core rules (e.g. checking if an email already exists, making sure capacity is positive).
* **Repositories** talk to the database using JPA.
* **Entities (Models)** represent database tables as Java objects.

---

## Section B: Step-by-Step Execution Flows

Here is exactly what happens behind the scenes during key operations:

### 1. User Signup Flow
1. Client sends `POST /api/auth/signup` with JSON body `{ "name": "...", "email": "...", "password": "..." }`.
2. `AuthController.signup()` receives the request. The `@Valid` annotation checks validation rules (`@NotBlank`, `@Email`, `@Size(min=6)`).
3. `AuthController` calls `AuthService.signup(SignupRequest request)`.
4. `AuthService`:
   * Trims and converts email to lowercase.
   * Calls `UserRepository.existsByEmail(email)` to verify the email is not already taken.
   * Calls `PasswordEncoder.encode(rawPassword)` to generate a secure BCrypt hash.
   * Creates a `User` entity, setting the role explicitly to `Role.USER`.
   * Calls `UserRepository.save(user)` to insert a row into the `"users"` table.
   * Calls `JwtUtil.generateToken(email, role)` to build a 24-hour signed JWT token.
5. Returns `AuthResponse` containing `{token, name, email, role}` with HTTP status `201 Created`.

---

### 2. User Login Flow
1. Client sends `POST /api/auth/login` with `{ "email": "...", "password": "..." }`.
2. `AuthController.login()` receives and passes the request to `AuthService.login(LoginRequest request)`.
3. `AuthService`:
   * Normalizes email to lowercase.
   * Calls `UserRepository.findByEmail(email)`. If not found, throws `BadCredentialsException`.
   * Calls `passwordEncoder.matches(rawPassword, storedHash)`. If password does not match, throws `BadCredentialsException`.
   * Calls `JwtUtil.generateToken(email, role)` to issue a fresh JWT token.
4. Returns `AuthResponse` with HTTP status `200 OK`.

---

### 3. A Protected Request with a JWT Token
1. Client sends an HTTP request with header: `Authorization: Bearer <token>`.
2. Before the controller is reached, the request passes through `JwtAuthenticationFilter`:
   * It checks for the `Authorization` header starting with `Bearer `.
   * Calls `JwtUtil.validateToken(token)` to verify the HMAC signature and check that the token is not expired.
   * Calls `JwtUtil.extractEmail(token)` to read the subject from the payload.
   * Calls `CustomUserDetailsService.loadUserByUsername(email)` to load user authorities (`ROLE_USER` or `ROLE_ADMIN`).
   * Creates a `UsernamePasswordAuthenticationToken` and sets it in Spring's `SecurityContextHolder`.
3. Spring Security checks `SecurityConfig` rules:
   * If the user has sufficient privileges, the request proceeds to the Controller.
   * If the token is missing or invalid, `CustomAuthenticationEntryPoint` sends a `401 Unauthorized` JSON.
   * If a `USER` tries an `ADMIN` endpoint, `CustomAccessDeniedHandler` sends a `403 Forbidden` JSON.

---

### 4. Admin Creating an Event Flow
1. Admin client sends `POST /api/events` with event JSON and the Admin's JWT token.
2. `JwtAuthenticationFilter` validates token and sets authentication with `ROLE_ADMIN`.
3. `SecurityConfig` verifies that `POST /api/events` has `hasRole("ADMIN")`. Permission granted.
4. `EventController.createEvent(@Valid @RequestBody EventRequest request)` is invoked.
5. `EventController` calls `EventService.createEvent(request)`.
6. `EventService` validates fields, maps the DTO data to a new `Event` entity, and calls `EventRepository.save(event)`.
7. `EventRepository` inserts the record into the `"events"` table.
8. Returns the newly created `Event` object with HTTP status `201 Created`.

---

### 5. Public User Viewing Upcoming Events Flow
1. Anyone (no token needed) sends `GET /api/events/upcoming`.
2. `SecurityConfig` matches `.requestMatchers(HttpMethod.GET, "/api/events/upcoming").permitAll()`. The request is allowed without any login.
3. `EventController.getUpcomingEvents()` calls `EventService.getUpcomingEvents()`.
4. `EventService` calls `LocalDate.now()` to find today's date.
5. It calls `EventRepository.findByDateAfterOrderByDateAsc(today)`.
6. `EventRepository` translates this method into the SQL query:
   `SELECT * FROM events WHERE date > CURRENT_DATE ORDER BY date ASC`.
7. Returns a JSON array of upcoming events with HTTP status `200 OK`.

---

## Section C: Core Concepts Explained (3-4 Lines Each)

### 1. REST API
Representational State Transfer (REST) is an architectural style for web communication. It uses standard HTTP methods (`GET` for fetching, `POST` for creating, `PUT` for updating, `DELETE` for removing) to manage resources represented by unique URLs.

### 2. JSON (JavaScript Object Notation)
JSON is a lightweight, human-readable data format used to transmit structured data between a client (like a browser) and a server. It stores information as key-value pairs (e.g. `{"name": "Arun"}`) and arrays.

### 3. JPA and ORM
Object-Relational Mapping (ORM) is a technique that bridges Java objects and relational database tables. Java Persistence API (JPA) is the standard Java specification (implemented by Hibernate) that allows developers to run database operations without writing raw SQL queries.

### 4. Entity
An Entity is a plain Java class marked with `@Entity` that directly represents a database table. Each instance of the class corresponds to a single row in the table, and its instance variables correspond to table columns.

### 5. BCrypt Password Hashing
BCrypt is a one-way mathematical hashing algorithm designed specifically for passwords. It incorporates random "salt" and deliberate computational delay to protect passwords against rainbow table and brute-force attacks. Passwords can never be decrypted back to plain text.

### 6. JWT (JSON Web Token)
JWT is a compact, URL-safe token format consisting of three parts separated by dots: Header, Payload, and Signature. It is digitally signed by the backend using a secret key, allowing the server to securely verify the client's identity without maintaining server-side session memory.

### 7. Filter (Servlet Filter)
A Filter is a component that intercepts incoming HTTP requests before they reach the Controller, and outgoing responses before they reach the client. In our project, `JwtAuthenticationFilter` reads the token from the request header and verifies credentials before any business logic runs.

### 8. CORS (Cross-Origin Resource Sharing)
CORS is a browser security mechanism that blocks web pages on one origin (like `http://localhost:5500`) from making HTTP requests to a different origin (like `http://localhost:8080`). We configure Spring Security to explicitly permit requests from our frontend development servers.

### 9. Roles & Authorization
Authentication proves **who** the user is, while Authorization determines **what** the user is allowed to do. In our project, roles (`USER` vs `ADMIN`) restrict administrative operations (like adding or deleting events) exclusively to admins.

### 10. Dependency Injection (DI) & Inversion of Control (IoC)
Dependency Injection is a design pattern where an object receives its dependencies from an external assembler (the Spring Framework) rather than creating them itself with `new`. Spring manages component lifecycles and automatically injects services and repositories via constructors.

---

## Section D: Database Tables & Schema

### Table 1: `users`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique user ID |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full name of the user |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | Lowercase login email |
| `password_hash`| `VARCHAR(255)` | `NOT NULL` | BCrypt hash of the password |
| `role` | `VARCHAR(20)` | `NOT NULL` | User role: `'USER'` or `'ADMIN'` |

---

### Table 2: `events`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique event ID |
| `title` | `VARCHAR(255)` | `NOT NULL` | Event title/heading |
| `description`| `VARCHAR(2000)`| `NULL` | Detailed description of event |
| `date` | `DATE` | `NOT NULL` | Date of event (`YYYY-MM-DD`) |
| `time` | `VARCHAR(50)` | `NULL` | Time (e.g. `"10:00 AM"`) |
| `location` | `VARCHAR(255)` | `NOT NULL` | Venue or auditorium room |
| `category` | `VARCHAR(100)` | `NULL` | Type (e.g. Technical, Cultural) |
| `image_url` | `VARCHAR(255)` | `NULL` | Poster/banner image link |
| `capacity` | `INT` | `NOT NULL` | Maximum capacity (> 0) |

---

## Section E: 15 Likely Viva Questions & Answers

#### Q1: What is Spring Boot and why did you use it instead of plain Spring?
**Answer:** Spring Boot provides auto-configuration, starter dependencies, and an embedded Tomcat server. It eliminates complex XML configuration and allows us to create production-ready Spring applications rapidly.

#### Q2: What is the difference between `@RestController` and `@Controller`?
**Answer:** `@Controller` is used for traditional MVC applications that return HTML views. `@RestController` combines `@Controller` and `@ResponseBody`, ensuring all method return values are automatically converted to JSON format.

#### Q3: How does Spring Data JPA save data without you writing SQL queries?
**Answer:** By extending `JpaRepository`, Spring Data JPA generates proxy implementations at runtime that automatically translate method names (like `findByEmail` or `save`) into SQL queries using Hibernate.

#### Q4: What is an In-Memory Database and why did you use H2?
**Answer:** An in-memory database stores data directly in RAM rather than persisting to disk files. We used H2 because it requires zero installation, boots instantly with the application, and is ideal for college demos and testing.

#### Q5: How do you switch this project from H2 to MySQL?
**Answer:** In `pom.xml`, add the `mysql-connector-j` dependency. Then in `application.properties`, comment out the H2 settings and uncomment the MySQL database URL, username, and password.

#### Q6: Why do we never store plain-text passwords in the database?
**Answer:** If the database is compromised or leaked, plain-text passwords would expose users immediately. Using BCrypt one-way hashing ensures that even database administrators cannot view original passwords.

#### Q7: What are the three parts of a JWT token?
**Answer:** A JWT consists of:
1. **Header:** Contains the algorithm and token type.
2. **Payload:** Contains claims (e.g., subject `email` and `role`).
3. **Signature:** Generated by hashing the header and payload with a secret key to prevent tampering.

#### Q8: Why is CSRF disabled in your application?
**Answer:** CSRF attacks rely on browsers automatically sending session cookies with cross-domain requests. Our REST API uses stateless JWT authentication sent via the `Authorization: Bearer <token>` header, which browsers never send automatically. Hence, CSRF is not applicable.

#### Q9: What is the purpose of `OncePerRequestFilter`?
**Answer:** It guarantees that our `JwtAuthenticationFilter` executes exactly once per HTTP request, preventing duplicate filter execution when internal request dispatches occur.

#### Q10: Why do `CustomAuthenticationEntryPoint` and `CustomAccessDeniedHandler` exist if you have `GlobalExceptionHandler`?
**Answer:** `GlobalExceptionHandler` (`@RestControllerAdvice`) only catches exceptions thrown within the Controller layer. Authentication (401) and Authorization (403) security failures happen earlier in the Spring Security filter chain before reaching the Controller, so custom security entry handlers are required.

#### Q11: What is the difference between 401 Unauthorized and 403 Forbidden?
**Answer:** 
* `401 Unauthorized` means the user is not authenticated (missing or invalid JWT token).
* `403 Forbidden` means the user is authenticated, but does not have the required role/permission (e.g. a regular `USER` attempting to delete an event).

#### Q12: How does the `/api/events/upcoming` endpoint filter events?
**Answer:** The service gets today's date using `LocalDate.now()` and calls `eventRepository.findByDateAfterOrderByDateAsc(today)`. JPA translates this to a query checking if the event date is greater than the current date.

#### Q13: Why did you use Constructor Injection instead of `@Autowired` on fields?
**Answer:** Constructor injection makes dependencies explicit, ensures classes cannot be instantiated in an invalid state, simplifies unit testing, and is the official best practice recommended by Spring.

#### Q14: What is CORS and why did you configure it?
**Answer:** CORS (Cross-Origin Resource Sharing) is a security measure in browsers preventing frontends running on port 5173 or 5500 from calling our API on port 8080. We added CORS configuration in `SecurityConfig` to explicitly permit these frontend origins.

#### Q15: What is the role of `DataSeeder` (`CommandLineRunner`)?
**Answer:** `CommandLineRunner` is a Spring Boot interface whose `run()` method executes right after the application context starts. We use it to automatically seed our admin account and 3 demo events so the application is immediately testable upon launch.
