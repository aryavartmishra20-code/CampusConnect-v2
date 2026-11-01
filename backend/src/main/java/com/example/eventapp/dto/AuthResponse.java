package com.example.eventapp.dto;

/**
 * AuthResponse DTO (Data Transfer Object)
 * 
 * Sent back to the client upon successful signup or login.
 * Contains the generated JWT bearer token and user profile information.
 */
public class AuthResponse {

    private String token;
    private String name;
    private String email;
    private String role;
    private String studentId;
    private String department;
    private String yearOfStudy;
    private String phone;

    // Default constructor
    public AuthResponse() {
    }

    // Parameterized constructor initializing all response fields
    public AuthResponse(String token, String name, String email, String role) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public AuthResponse(String token, String name, String email, String role,
                        String studentId, String department, String yearOfStudy, String phone) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.role = role;
        this.studentId = studentId;
        this.department = department;
        this.yearOfStudy = yearOfStudy;
        this.phone = phone;
    }

    // Returns the JWT token string
    public String getToken() {
        return token;
    }

    // Sets the JWT token string
    public void setToken(String token) {
        this.token = token;
    }

    // Returns the user's name
    public String getName() {
        return name;
    }

    // Sets the user's name
    public void setName(String name) {
        this.name = name;
    }

    // Returns the user's email
    public String getEmail() {
        return email;
    }

    // Sets the user's email
    public void setEmail(String email) {
        this.email = email;
    }

    // Returns the user's assigned role
    public String getRole() {
        return role;
    }

    // Sets the user's assigned role
    public void setRole(String role) {
        this.role = role;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(String yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
