package com.example.eventapp.config;

import com.example.eventapp.model.Event;
import com.example.eventapp.model.Role;
import com.example.eventapp.model.User;
import com.example.eventapp.repository.EventRepository;
import com.example.eventapp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * DataSeeder (Configuration / Initialization Layer)
 * 
 * Implements Spring Boot's CommandLineRunner interface.
 * Runs automatically upon application startup to populate the in-memory H2 database
 * with a default ADMIN account and 3 demo events (1 past, 2 upcoming).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    // Injects required repositories and password encoder
    public DataSeeder(UserRepository userRepository,
                      EventRepository eventRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Executes automatically when the application starts up
    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
        seedSampleEvents();
    }

    // Creates the default administrator account if it does not already exist
    private void seedAdminUser() {
        String adminEmail = "admin@event.com";

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setName("Administrator");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
            System.out.println(">>> DataSeeder: Admin user created (admin@event.com / admin123)");
        }
    }

    // Seeds 3 sample events computed dynamically from LocalDate.now()
    private void seedSampleEvents() {
        if (eventRepository.count() == 0) {
            LocalDate today = LocalDate.now();

            // 1. Past Event (10 days ago)
            Event pastEvent = new Event(
                    "Annual Campus Hackathon 2025",
                    "A 24-hour coding competition where teams built innovative web and mobile apps.",
                    today.minusDays(10),
                    "09:00 AM",
                    "Main Auditorium, Block A",
                    "Technical",
                    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
                    150
            );

            // 2. Upcoming Event 1 (7 days in the future)
            Event upcomingEvent1 = new Event(
                    "Cloud Computing & DevOps Workshop",
                    "Hands-on workshop exploring Docker, Kubernetes, and AWS infrastructure fundamentals.",
                    today.plusDays(7),
                    "11:00 AM",
                    "Computer Lab 3, IT Dept",
                    "Workshop",
                    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
                    80
            );

            // 3. Upcoming Event 2 (30 days in the future)
            Event upcomingEvent2 = new Event(
                    "Inter-College Cultural Gala",
                    "An evening filled with music, dance, theatrical performances, and campus talent shows.",
                    today.plusDays(30),
                    "05:30 PM",
                    "Open Air Amphitheatre",
                    "Cultural",
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
                    500
            );

            eventRepository.save(pastEvent);
            eventRepository.save(upcomingEvent1);
            eventRepository.save(upcomingEvent2);

            System.out.println(">>> DataSeeder: 3 demo events seeded (1 past, 2 upcoming relative to today: " + today + ")");
        }
    }
}
