package com.example.eventapp.service;

import com.example.eventapp.dto.EventRequest;
import com.example.eventapp.exception.ResourceNotFoundException;
import com.example.eventapp.model.Event;
import com.example.eventapp.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * EventService (Service Layer)
 * 
 * Contains business logic for managing campus events.
 * Directly interacts with EventRepository to perform CRUD and filtering operations.
 */
@Service
public class EventService {

    private final EventRepository eventRepository;

    // Constructor injection for EventRepository
    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    // Retrieves all events in the system
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // Retrieves only upcoming events where the event date is strictly after today's date
    public List<Event> getUpcomingEvents() {
        LocalDate today = LocalDate.now();
        return eventRepository.findByDateAfterOrderByDateAsc(today);
    }

    // Retrieves a single event by its ID or throws ResourceNotFoundException
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    // Creates a new event record from the provided request data and saves it to the database
    public Event createEvent(EventRequest request) {
        Event event = new Event();
        copyProperties(request, event);
        return eventRepository.save(event);
    }

    // Updates an existing event record by ID with new values
    public Event updateEvent(Long id, EventRequest request) {
        Event existingEvent = getEventById(id);
        copyProperties(request, existingEvent);
        return eventRepository.save(existingEvent);
    }

    // Deletes an event by its ID from the database
    public void deleteEvent(Long id) {
        Event existingEvent = getEventById(id);
        eventRepository.delete(existingEvent);
    }

    // Helper method to copy fields from an EventRequest DTO to an Event entity
    private void copyProperties(EventRequest source, Event target) {
        target.setTitle(source.getTitle().trim());
        target.setDescription(source.getDescription());
        target.setDate(source.getDate());
        target.setTime(source.getTime());
        target.setLocation(source.getLocation().trim());
        target.setCategory(source.getCategory());
        target.setImageUrl(source.getImageUrl());
        target.setCapacity(source.getCapacity());
    }
}
