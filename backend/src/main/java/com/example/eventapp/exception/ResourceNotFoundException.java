package com.example.eventapp.exception;

/**
 * ResourceNotFoundException (Exception Layer)
 * 
 * Thrown when an entity (like an Event with a specific ID) cannot be found in the database.
 * Handled by GlobalExceptionHandler to return an HTTP 404 response.
 */
public class ResourceNotFoundException extends RuntimeException {

    // Creates an exception with a custom not-found message
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
