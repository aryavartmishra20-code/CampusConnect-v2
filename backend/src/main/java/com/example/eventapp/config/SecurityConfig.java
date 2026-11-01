package com.example.eventapp.config;

import com.example.eventapp.security.CustomAccessDeniedHandler;
import com.example.eventapp.security.CustomAuthenticationEntryPoint;
import com.example.eventapp.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * SecurityConfig (Configuration Layer)
 * 
 * Configures Spring Security filter chain:
 * - Disables CSRF (explained below)
 * - Enables CORS for frontend dev servers
 * - Sets stateless session management (no HTTP session cookies)
 * - Restricts ADMIN-only routes and permits public routes
 * - Registers JWT authentication filter before UsernamePasswordAuthenticationFilter
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    // Injects security filter and custom error handlers
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CustomAuthenticationEntryPoint authenticationEntryPoint,
                          CustomAccessDeniedHandler accessDeniedHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    // Configures the SecurityFilterChain bean defining URL authorizations and filters
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // =========================================================================
                // WHY CSRF IS DISABLED (VIVA EXPLANATION):
                // CSRF (Cross-Site Request Forgery) attacks exploit automatic browser cookie
                // transmission. Our REST API is completely STATELESS and does not use session
                // cookies for authentication. Instead, clients send tokens in the Authorization
                // header ("Bearer <token>"), which browsers never attach automatically.
                // Therefore, CSRF protection is unnecessary and disabled.
                // =========================================================================
                .csrf(csrf -> csrf.disable())

                // Enable CORS with our configured origins
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Stateless sessions: server stores no session state
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Custom exception handlers for 401 Unauthorized and 403 Forbidden
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )

                // Route authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public auth endpoints
                        .requestMatchers("/api/auth/**").permitAll()

                        // Public event endpoints (viewing all, single event by id, and upcoming events)
                        .requestMatchers(HttpMethod.GET, "/api/events", "/api/events/**").permitAll()

                        // H2 database console (for development and viva demo)
                        .requestMatchers("/h2-console/**").permitAll()

                        // Event creation, update, and deletion require ADMIN role
                        .requestMatchers(HttpMethod.POST, "/api/events").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/events/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/events/**").hasRole("ADMIN")

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )

                // Allow frames for H2 console in browser
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))

                // Register JWT authentication filter before Spring's default username/password filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Configures CORS permissions for React dev server (5173) and VS Code Live Server (5500)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // Exposes BCrypt password hasher as a Spring bean
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Exposes Spring Security's AuthenticationManager bean
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
