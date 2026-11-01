package com.example.eventapp.repository;

import com.example.eventapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * UserRepository (Repository Layer)
 * 
 * Provides database query methods for the User entity.
 * Extends Spring Data JPA's JpaRepository to inherit standard CRUD operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Finds a user in the database by their unique email address
    Optional<User> findByEmail(String email);

    // Checks whether an account already exists with the given email address
    boolean existsByEmail(String email);
}
