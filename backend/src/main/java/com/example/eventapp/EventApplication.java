package com.example.eventapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * EventApplication (Main Entry Point)
 * 
 * The main bootstrap class for the Spring Boot application.
 * Starts the Spring application context, embedded Tomcat web server,
 * and initializes all components, repositories, and seed data.
 */
@SpringBootApplication
public class EventApplication {

    // Launches the Spring Boot application
    public static void main(String[] args) {
        SpringApplication.run(EventApplication.class, args);
    }
}
