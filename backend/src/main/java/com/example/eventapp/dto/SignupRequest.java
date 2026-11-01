package com.example.eventapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * SignupRequest DTO (Data Transfer Object)
 * 
 * Carries registration data sent from the client browser to the server.
 * Includes validation annotations to check user input before processing.
 */
public class SignupRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String studentId;
    private String department;
    private String yearOfStudy;
    private String phone;

    // Default constructor
    public SignupRequest() {
    }

    // Parameterized constructor
    public SignupRequest(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public SignupRequest(String name, String email, String password, String studentId,
                         String department, String yearOfStudy, String phone) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.studentId = studentId;
        this.department = department;
        this.yearOfStudy = yearOfStudy;
        this.phone = phone;
    }

    // Returns the submitted name
    public String getName() {
        return name;
    }

    // Sets the submitted name
    public void setName(String name) {
        this.name = name;
    }

    // Returns the submitted email
    public String getEmail() {
        return email;
    }

    // Sets the submitted email
    public void setEmail(String email) {
        this.email = email;
    }

    // Returns the submitted plain-text password
    public String getPassword() {
        return password;
    }

    // Sets the submitted plain-text password
    public void setPassword(String password) {
        this.password = password;
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
