package com.example.eventapp.controller;

import com.example.eventapp.dto.AuthResponse;
import com.example.eventapp.dto.LoginRequest;
import com.example.eventapp.dto.SignupRequest;
import com.example.eventapp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AuthController (Controller Layer)
 * 
 * Handles HTTP requests for user authentication (signup and login).
 * Strictly communicates with AuthService, never calling repositories directly.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    // Constructor injection for AuthService
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Handles POST /api/auth/signup to register a new student user and returns JWT token
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Handles POST /api/auth/login to authenticate an existing user and returns JWT token
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
