package com.example.eventapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * User Entity (Entity / Model Layer)
 * 
 * Maps to the "users" table in the database.
 * Stores login credentials and role information for registered users and admins.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "student_id")
    private String studentId;

    private String department;

    @Column(name = "year_of_study")
    private String yearOfStudy;

    private String phone;

    // Default no-argument constructor required by JPA
    public User() {
    }

    // Parameterized constructor to easily create a new user object
    public User(String name, String email, String passwordHash, Role role) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    // Parameterized constructor including student fields
    public User(String name, String email, String passwordHash, Role role,
                String studentId, String department, String yearOfStudy, String phone) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.studentId = studentId;
        this.department = department;
        this.yearOfStudy = yearOfStudy;
        this.phone = phone;
    }

    // Returns the primary key ID of the user
    public Long getId() {
        return id;
    }

    // Sets the primary key ID of the user
    public void setId(Long id) {
        this.id = id;
    }

    // Returns the full name of the user
    public String getName() {
        return name;
    }

    // Sets the full name of the user
    public void setName(String name) {
        this.name = name;
    }

    // Returns the email address of the user
    public String getEmail() {
        return email;
    }

    // Sets the email address of the user
    public void setEmail(String email) {
        this.email = email;
    }

    // Returns the BCrypt hashed password
    public String getPasswordHash() {
        return passwordHash;
    }

    // Sets the BCrypt hashed password
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    // Returns the role of the user (USER or ADMIN)
    public Role getRole() {
        return role;
    }

    // Sets the role of the user
    public void setRole(Role role) {
        this.role = role;
    }

    // Returns the student roll/ID number
    public String getStudentId() {
        return studentId;
    }

    // Sets the student roll/ID number
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    // Returns the student's department/branch
    public String getDepartment() {
        return department;
    }

    // Sets the student's department/branch
    public void setDepartment(String department) {
        this.department = department;
    }

    // Returns the year of study
    public String getYearOfStudy() {
        return yearOfStudy;
    }

    // Sets the year of study
    public void setYearOfStudy(String yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }

    // Returns the phone number
    public String getPhone() {
        return phone;
    }

    // Sets the phone number
    public void setPhone(String phone) {
        this.phone = phone;
    }
}
