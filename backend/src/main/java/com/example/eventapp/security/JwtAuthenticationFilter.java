package com.example.eventapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthenticationFilter (Security Layer)
 * 
 * Intercepts every incoming HTTP request once.
 * Inspects the "Authorization" header for a "Bearer <token>" string.
 * Validates the token and populates Spring Security's SecurityContext.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    // Constructor injection for JwtUtil and CustomUserDetailsService
    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    // Inspects request headers, validates the JWT, and sets authentication context
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        // Check if Authorization header exists and begins with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remove "Bearer " prefix
            if (jwtUtil.validateToken(token)) {
                email = jwtUtil.extractEmail(token);
            }
        }

        // If email was extracted and no authentication is currently set in context
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        // Continue along the filter chain to next filters or controller
        filterChain.doFilter(request, response);
    }
}
