package com.example.eventapp.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * CustomAccessDeniedHandler (Security Layer)
 * 
 * Handles forbidden requests (HTTP 403).
 * 
 * NOTE FOR VIVA:
 * Spring Security filter chain errors (such as a logged-in USER attempting an ADMIN-only endpoint)
 * occur in the filter chain BEFORE reaching the Controller layer.
 * Because of this, Spring Security errors do NOT reach @RestControllerAdvice
 * (GlobalExceptionHandler). We implement AccessDeniedHandler so that 403 Forbidden
 * responses also adhere to our uniform {"message": "..."} JSON format.
 */
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    // Writes an HTTP 403 Forbidden JSON response when a user lacks the required ADMIN role
    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        String jsonResponse = "{\"message\": \"Forbidden: You do not have permission to access this resource.\"}";
        response.getWriter().write(jsonResponse);
    }
}
