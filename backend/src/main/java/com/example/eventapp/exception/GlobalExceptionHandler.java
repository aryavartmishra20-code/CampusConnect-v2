package com.example.eventapp.exception;

import com.example.eventapp.dto.MessageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * GlobalExceptionHandler (Exception Layer / Controller Advice)
 * 
 * Intercepts exceptions thrown from any controller in the application.
 * Ensures that all API error responses return a uniform JSON format: {"message": "..."}.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles validation failures (e.g. @NotBlank, @Email) and extracts the specific field error
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<MessageResponse> handleValidationException(MethodArgumentNotValidException ex) {
        FieldError firstError = ex.getBindingResult().getFieldError();
        String errorMessage = "Validation error";
        if (firstError != null && firstError.getDefaultMessage() != null) {
            errorMessage = firstError.getDefaultMessage();
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(errorMessage));
    }

    // Handles business logic validation errors such as duplicate email
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<MessageResponse> handleBadRequestException(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(ex.getMessage()));
    }

    // Handles entity not found errors (e.g. event ID does not exist)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<MessageResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
    }

    // Handles bad login credentials (incorrect password or unregistered email)
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<MessageResponse> handleBadCredentialsException(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Invalid email or password"));
    }

    // Handles authorization errors when an authenticated user lacks required privileges
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<MessageResponse> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Access denied: You do not have permission"));
    }

    // Fallback handler for all unexpected runtime exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponse> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("An internal server error occurred: " + ex.getMessage()));
    }
}
