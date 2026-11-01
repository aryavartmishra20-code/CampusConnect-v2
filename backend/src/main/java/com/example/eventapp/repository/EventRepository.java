package com.example.eventapp.repository;

import com.example.eventapp.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

/**
 * EventRepository (Repository Layer)
 * 
 * Provides database query methods for the Event entity.
 * Extends Spring Data JPA's JpaRepository to inherit standard CRUD operations.
 */
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Retrieves all events whose date is strictly after the specified date (for upcoming events)
    List<Event> findByDateAfterOrderByDateAsc(LocalDate date);
}
