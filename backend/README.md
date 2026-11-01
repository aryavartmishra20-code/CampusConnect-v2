# CampusConnect Event Management Backend

A simple, readable, and clean Spring Boot 3 REST API backend for a college event management website. Built for 3rd-semester IT students using Java 17, Spring Web, Spring Data JPA, Spring Security with JWT (jjwt 0.12.x), Validation, and H2 In-Memory Database.

---

## 1. How to Run the Project

No prior Maven installation is required because the project includes the Maven Wrapper (`mvnw`).

### On Windows (PowerShell or Command Prompt)
Navigate to the `backend` folder and run:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### On macOS / Linux (Terminal)
Navigate to the `backend` folder and run:
```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

The application will start on: `http://localhost:8080`

---

## 2. In-Memory Database & Startup Demo Data

The application uses an in-memory **H2 Database** (`jdbc:h2:mem:eventdb`). All tables and initial seed data are created automatically when the application starts.

### H2 Web Console
You can view and query database tables visually in your browser:
* **URL:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
* **JDBC URL:** `jdbc:h2:mem:eventdb`
* **User Name:** `sa`
* **Password:** *(leave blank)*
* Click **Connect**.

### Default Seeded Accounts & Events
* **Admin Account:**
  * **Email:** `admin@event.com`
  * **Password:** `admin123`
  * **Role:** `ADMIN`
* **Seeded Events:**
  1. *Annual Campus Hackathon 2025* (Past event: 10 days ago)
  2. *Cloud Computing & DevOps Workshop* (Upcoming event: 7 days in the future)
  3. *Inter-College Cultural Gala* (Upcoming event: 30 days in the future)

---

## 3. How to Switch to MySQL (For Viva Demo)

Open `src/main/resources/application.properties`:
1. Comment out the active `spring.datasource.*` and `spring.h2.*` H2 lines.
2. Uncomment the MySQL lines:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/eventdb?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
```
3. Add `mysql-connector-j` to `pom.xml`.

---

## 4. API Endpoints Table

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | **Public** | Register a new student account (always creates `USER` role) |
| `POST` | `/api/auth/login` | **Public** | Authenticate user/admin & receive JWT token |
| `GET` | `/api/events` | **Public** | Retrieve all events |
| `GET` | `/api/events/upcoming` | **Public** | Retrieve events where date is after today |
| `POST` | `/api/events` | **ADMIN only** | Create a new event |
| `PUT` | `/api/events/{id}` | **ADMIN only** | Update an existing event by ID |
| `DELETE` | `/api/events/{id}` | **ADMIN only** | Delete an event by ID |

---

## 5. Postman Examples (Copy-Paste)

### A. Signup (`POST http://localhost:8080/api/auth/signup`)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@campus.edu",
  "password": "password123"
}
```
* **Response Body (`201 Created`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "name": "John Doe",
  "email": "john@campus.edu",
  "role": "USER"
}
```

---

### B. Login as Admin (`POST http://localhost:8080/api/auth/login`)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "email": "admin@event.com",
  "password": "admin123"
}
```
* **Response Body (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "name": "Administrator",
  "email": "admin@event.com",
  "role": "ADMIN"
}
```

---

### C. Get All Events (`GET http://localhost:8080/api/events`)
* **Headers:** None required (Public)
* **Response Body (`200 OK`):**
```json
[
  {
    "id": 1,
    "title": "Annual Campus Hackathon 2025",
    "description": "A 24-hour coding competition where teams built innovative web and mobile apps.",
    "date": "2026-10-02",
    "time": "09:00 AM",
    "location": "Main Auditorium, Block A",
    "category": "Technical",
    "imageUrl": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    "capacity": 150
  },
  {
    "id": 2,
    "title": "Cloud Computing & DevOps Workshop",
    "description": "Hands-on workshop exploring Docker, Kubernetes, and AWS infrastructure fundamentals.",
    "date": "2026-10-19",
    "time": "11:00 AM",
    "location": "Computer Lab 3, IT Dept",
    "category": "Workshop",
    "imageUrl": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    "capacity": 80
  }
]
```

---

### D. Get Upcoming Events (`GET http://localhost:8080/api/events/upcoming`)
* **Headers:** None required (Public)
* **Response Body (`200 OK`):**
Returns only events with dates strictly after today.

---

### E. Create Event (`POST http://localhost:8080/api/events`)
* **Headers:**
  * `Content-Type: application/json`
  * `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Request Body:**
```json
{
  "title": "AI & Machine Learning Seminar",
  "description": "An interactive lecture on modern generative AI architectures and transformers.",
  "date": "2026-11-15",
  "time": "02:00 PM",
  "location": "Seminar Hall 2",
  "category": "Technical",
  "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
  "capacity": 120
}
```
* **Response Body (`201 Created`):**
```json
{
  "id": 4,
  "title": "AI & Machine Learning Seminar",
  "description": "An interactive lecture on modern generative AI architectures and transformers.",
  "date": "2026-11-15",
  "time": "02:00 PM",
  "location": "Seminar Hall 2",
  "category": "Technical",
  "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
  "capacity": 120
}
```

---

### F. Update Event (`PUT http://localhost:8080/api/events/4`)
* **Headers:**
  * `Content-Type: application/json`
  * `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Request Body:**
```json
{
  "title": "AI & Machine Learning Seminar (Updated)",
  "description": "Updated room location and increased capacity.",
  "date": "2026-11-15",
  "time": "02:30 PM",
  "location": "Auditorium Hall 1",
  "category": "Technical",
  "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
  "capacity": 200
}
```
* **Response Body (`200 OK`):** Updated event JSON.

---

### G. Delete Event (`DELETE http://localhost:8080/api/events/4`)
* **Headers:**
  * `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Response Body (`200 OK`):**
```json
{
  "message": "Event deleted successfully"
}
```

---

### H. Error Responses (Standard Format: `{"message": "..."}`)

1. **Missing or Invalid Token (`401 Unauthorized`):**
```json
{
  "message": "Unauthorized: Please log in with a valid token."
}
```

2. **Logged in as USER trying to POST/PUT/DELETE event (`403 Forbidden`):**
```json
{
  "message": "Forbidden: You do not have permission to access this resource."
}
```

3. **Validation Failure (`400 Bad Request`):**
```json
{
  "message": "Title is required"
}
```

4. **Event ID Not Found (`404 Not Found`):**
```json
{
  "message": "Event not found with id: 999"
}
```
