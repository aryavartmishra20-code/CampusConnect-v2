package com.example.eventapp.service;

import com.example.eventapp.dto.AuthResponse;
import com.example.eventapp.dto.LoginRequest;
import com.example.eventapp.dto.SignupRequest;
import com.example.eventapp.exception.BadRequestException;
import com.example.eventapp.model.Role;
import com.example.eventapp.model.User;
import com.example.eventapp.repository.UserRepository;
import com.example.eventapp.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthService (Service Layer)
 * 
 * Contains business logic for user registration and authentication.
 * Coordinates between UserRepository, PasswordEncoder, and JwtUtil.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Constructor injection for required dependencies
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Registers a new user with lowercase email, BCrypt-hashed password, and always assigns role USER
    public AuthResponse signup(SignupRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // Check if an account already exists with this email
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with this email already exists: " + normalizedEmail);
        }

        // Hash the plain-text password using BCrypt
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // Create and persist the new User entity (role is always USER for signup)
        User newUser = new User();
        newUser.setName(request.getName().trim());
        newUser.setEmail(normalizedEmail);
        newUser.setPasswordHash(encodedPassword);
        newUser.setRole(Role.USER);
        newUser.setStudentId(request.getStudentId() != null ? request.getStudentId().trim() : null);
        newUser.setDepartment(request.getDepartment() != null ? request.getDepartment().trim() : null);
        newUser.setYearOfStudy(request.getYearOfStudy() != null ? request.getYearOfStudy().trim() : null);
        newUser.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);

        User savedUser = userRepository.save(newUser);

        // Generate JWT token for the registered user
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(
                token,
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getStudentId(),
                savedUser.getDepartment(),
                savedUser.getYearOfStudy(),
                savedUser.getPhone()
        );
    }

    // Verifies login credentials and returns a fresh JWT token with user details
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // Retrieve user by email from the repository
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Compare raw password with the stored BCrypt hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Generate JWT token for the authenticated user
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getStudentId(),
                user.getDepartment(),
                user.getYearOfStudy(),
                user.getPhone()
        );
    }
}
