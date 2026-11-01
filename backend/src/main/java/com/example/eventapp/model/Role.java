package com.example.eventapp.model;

/**
 * Role Enum (Entity / Model Layer)
 * 
 * Defines the possible authority roles for users in the system:
 * - USER: Standard student/attendee role (can browse events)
 * - ADMIN: Administrative role (can create, update, and delete events)
 */
public enum Role {
    USER,
    ADMIN
}
