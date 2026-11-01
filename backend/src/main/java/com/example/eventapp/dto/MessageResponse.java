package com.example.eventapp.dto;

/**
 * MessageResponse DTO (Data Transfer Object)
 * 
 * Standard JSON response payload for informational, success, or error messages:
 * {"message": "..."}
 */
public class MessageResponse {

    private String message;

    // Default constructor
    public MessageResponse() {
    }

    // Parameterized constructor initializing the message text
    public MessageResponse(String message) {
        this.message = message;
    }

    // Returns the message text
    public String getMessage() {
        return message;
    }

    // Sets the message text
    public void setMessage(String message) {
        this.message = message;
    }
}
