package com.example.eventapp.exception;

/**
 * BadRequestException (Exception Layer)
 * 
 * Thrown when client requests contain invalid or conflicting business data
 * (such as attempting to register with an email that is already in use).
 * Handled by GlobalExceptionHandler to return an HTTP 400 response.
 */
public class BadRequestException extends RuntimeException {

    // Creates an exception with a custom bad request message
    public BadRequestException(String message) {
        super(message);
    }
}
