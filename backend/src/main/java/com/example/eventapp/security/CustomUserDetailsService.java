package com.example.eventapp.security;

import com.example.eventapp.model.User;
import com.example.eventapp.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * CustomUserDetailsService (Security Layer)
 * 
 * Implements Spring Security's UserDetailsService interface.
 * Loads user records from the database by email to authenticate security requests.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // Injects the UserRepository using constructor injection
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Fetches a user by their email address and maps them into a Spring Security UserDetails object
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Maps the role enum (USER, ADMIN) to a Spring Security authority with "ROLE_" prefix
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                authorities
        );
    }
}
