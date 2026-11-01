package com.example.eventapp.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * CustomAuthenticationEntryPoint (Security Layer)
 * 
 * Handles unauthenticated requests (HTTP 401).
 * 
 * NOTE FOR VIVA:
 * Spring Security filter chain errors (such as missing or invalid JWT tokens)
 * occur BEFORE requests reach Spring's DispatcherServlet and Controller layer.
 * Because of this, Spring Security filter errors do NOT reach @RestControllerAdvice
 * (GlobalExceptionHandler). Therefore, we implement this entry point to write
 * our standardized JSON error {"message": "..."} directly to the HTTP response.
 */
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    // Writes an HTTP 401 Unauthorized JSON response when a user tries to access a protected resource without valid credentials
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        String jsonResponse = "{\"message\": \"Unauthorized: Please log in with a valid token.\"}";
        response.getWriter().write(jsonResponse);
    }
}
