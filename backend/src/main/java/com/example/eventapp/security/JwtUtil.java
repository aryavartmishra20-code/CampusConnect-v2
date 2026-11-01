package com.example.eventapp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JwtUtil (Security Layer)
 * 
 * Utility component responsible for generating, signing, and parsing JSON Web Tokens.
 * Uses the jjwt 0.12.x library with HMAC-SHA signing algorithms.
 */
@Component
public class JwtUtil {

    private final SecretKey signingKey;
    private final long expirationMs;

    // Reads secret and expiration properties from application.properties
    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    // Creates a new signed JWT containing the user's email as subject and role as claim
    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    // Parses and validates the JWT, extracting the claims payload
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Extracts the user email (subject) stored inside the token
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Checks whether the token has expired
    public boolean isTokenExpired(String token) {
        Date expiration = extractAllClaims(token).getExpiration();
        return expiration.before(new Date());
    }

    // Validates that the token signature is authentic and the token has not expired
    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            // Token signature invalid, malformed, or expired
            return false;
        }
    }
}
