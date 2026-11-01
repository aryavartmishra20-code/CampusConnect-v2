package com.example.eventapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * LoginRequest DTO (Data Transfer Object)
 * 
 * Carries email and password credentials submitted by the user when logging in.
 */
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    // Default constructor
    public LoginRequest() {
    }

    // Parameterized constructor
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Returns the login email
    public String getEmail() {
        return email;
    }

    // Sets the login email
    public void setEmail(String email) {
        this.email = email;
    }

    // Returns the login password
    public String getPassword() {
        return password;
    }

    // Sets the login password
    public void setPassword(String password) {
        this.password = password;
    }
}
