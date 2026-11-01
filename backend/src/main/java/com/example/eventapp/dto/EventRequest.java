package com.example.eventapp.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * EventRequest DTO (Data Transfer Object)
 * 
 * Used by admin clients to create or update an event.
 * Enforces validation rules for required fields and positive capacity.
 */
public class EventRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String time;

    @NotBlank(message = "Location is required")
    private String location;

    private String category;

    private String imageUrl;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be greater than 0")
    private Integer capacity;

    // Default constructor
    public EventRequest() {
    }

    // Parameterized constructor
    public EventRequest(String title, String description, LocalDate date, String time,
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

    // Returns event title
    public String getTitle() {
        return title;
    }

    // Sets event title
    public void setTitle(String title) {
        this.title = title;
    }

    // Returns event description
    public String getDescription() {
        return description;
    }

    // Sets event description
    public void setDescription(String description) {
        this.description = description;
    }

    // Returns event date
    public LocalDate getDate() {
        return date;
    }

    // Sets event date
    public void setDate(LocalDate date) {
        this.date = date;
    }

    // Returns event time
    public String getTime() {
        return time;
    }

    // Sets event time
    public void setTime(String time) {
        this.time = time;
    }

    // Returns event location
    public String getLocation() {
        return location;
    }

    // Sets event location
    public void setLocation(String location) {
        this.location = location;
    }

    // Returns event category
    public String getCategory() {
        return category;
    }

    // Sets event category
    public void setCategory(String category) {
        this.category = category;
    }

    // Returns image URL
    public String getImageUrl() {
        return imageUrl;
    }

    // Sets image URL
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // Returns event capacity
    public Integer getCapacity() {
        return capacity;
    }

    // Sets event capacity
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
}
