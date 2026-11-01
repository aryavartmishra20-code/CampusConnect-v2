package com.example.eventapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * Event Entity (Entity / Model Layer)
 * 
 * Maps to the "events" table in the database.
 * Stores details for campus events such as workshops, hackathons, and seminars.
 */
@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private LocalDate date;

    private String time;

    @Column(nullable = false)
    private String location;

    private String category;

    private String imageUrl;

    @Column(nullable = false)
    private Integer capacity;

    // Default no-argument constructor required by JPA
    public Event() {
    }

    // Parameterized constructor to easily create a new event instance
    public Event(String title, String description, LocalDate date, String time,
                 String location, String category, String imageUrl, Integer capacity) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.time = time;
        this.location = location;
        this.category = category;
        this.imageUrl = imageUrl;
        this.capacity = capacity;
    }

    // Returns the event ID
    public Long getId() {
        return id;
    }

    // Sets the event ID
    public void setId(Long id) {
        this.id = id;
    }

    // Returns the event title
    public String getTitle() {
        return title;
    }

    // Sets the event title
    public void setTitle(String title) {
        this.title = title;
    }

    // Returns the event description
    public String getDescription() {
        return description;
    }

    // Sets the event description
    public void setDescription(String description) {
        this.description = description;
    }

    // Returns the date of the event
    public LocalDate getDate() {
        return date;
    }

    // Sets the date of the event
    public void setDate(LocalDate date) {
        this.date = date;
    }

    // Returns the time of the event
    public String getTime() {
        return time;
    }

    // Sets the time of the event
    public void setTime(String time) {
        this.time = time;
    }

    // Returns the physical or virtual location of the event
    public String getLocation() {
        return location;
    }

    // Sets the location of the event
    public void setLocation(String location) {
        this.location = location;
    }

    // Returns the event category
    public String getCategory() {
        return category;
    }

    // Sets the event category
    public void setCategory(String category) {
        this.category = category;
    }

    // Returns the URL of the event banner image
    public String getImageUrl() {
        return imageUrl;
    }

    // Sets the URL of the event banner image
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // Returns the maximum attendee capacity
    public Integer getCapacity() {
        return capacity;
    }

    // Sets the maximum attendee capacity
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
}
