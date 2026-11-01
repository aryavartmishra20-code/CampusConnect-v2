package com.example.eventapp.controller;

import com.example.eventapp.dto.EventRequest;
import com.example.eventapp.dto.MessageResponse;
import com.example.eventapp.model.Event;
import com.example.eventapp.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * EventController (Controller Layer)
 * 
 * Exposes REST API endpoints for viewing and managing campus events.
 * Strictly communicates with EventService, never calling repositories directly.
 */
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    // Constructor injection for EventService
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // Handles GET /api/events to retrieve all events (Public: no login needed)
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    // Handles GET /api/events/upcoming to retrieve events scheduled after today (Public: no login needed)
    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents() {
        List<Event> upcomingEvents = eventService.getUpcomingEvents();
        return ResponseEntity.ok(upcomingEvents);
    }

    // Handles GET /api/events/{id} to retrieve a single event by ID (Public: no login needed)
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    // Handles POST /api/events to create a new event (ADMIN only)
    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody EventRequest request) {
        Event createdEvent = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    // Handles PUT /api/events/{id} to update an existing event by its ID (ADMIN only)
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        Event updatedEvent = eventService.updateEvent(id, request);
        return ResponseEntity.ok(updatedEvent);
    }

    // Handles DELETE /api/events/{id} to remove an event by its ID (ADMIN only)
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(new MessageResponse("Event deleted successfully"));
    }
}
