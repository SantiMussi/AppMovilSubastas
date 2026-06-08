package com.subastas.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
@ExceptionHandler(PujaRechazadaException.class)
    public ResponseEntity<Map<String, String>> handlePujaRechazadaException(PujaRechazadaException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("code", ex.getCode());
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, bidRejectionStatus(ex.getCode()));
    }

    private HttpStatus bidRejectionStatus(String code) {
        return switch (code) {
            case "AUCTION_ITEM_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "AUCTION_NOT_OPEN", "AUCTION_ITEM_SOLD" -> HttpStatus.CONFLICT;
            case "INSUFFICIENT_GUARANTEE" -> HttpStatus.UNPROCESSABLE_ENTITY;
            case "USER_NOT_FOUND", "CLIENT_NOT_FOUND", "CLIENT_NOT_ADMITTED", "OUTSTANDING_FINE",
                    "PAYMENT_METHOD_REQUIRED", "PAYMENT_METHOD_NOT_FOUND", "PAYMENT_METHOD_NOT_OWNED",
                    "PAYMENT_METHOD_NOT_VERIFIED", "PAYMENT_CURRENCY_MISMATCH" -> HttpStatus.FORBIDDEN;
            default -> HttpStatus.BAD_REQUEST;
        };
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, String>> handleConflictException(ConflictException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Solicitud inválida");
        ex.getBindingResult().getFieldErrors().forEach(error ->
                response.put(error.getField(), error.getDefaultMessage()));
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
