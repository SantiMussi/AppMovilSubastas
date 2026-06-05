package com.subastas.backend.controller.auth;

import com.subastas.backend.dto.request.AuthenticationRequest;
import com.subastas.backend.dto.request.CompletarRegistroRequest;
import com.subastas.backend.dto.request.OlvidoContraseñaRequest;
import com.subastas.backend.dto.request.ResetearContraseñaRequest;
import com.subastas.backend.dto.request.ValidarCodigoReseteoRequest;
import com.subastas.backend.dto.request.RegisterRequest;
import com.subastas.backend.service.AuthenticationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Validated
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.register(request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(errorResponse(HttpStatus.CONFLICT, exception.getMessage()));
        }
    }

    @GetMapping("/register/status")
    public ResponseEntity<?> registrationStatus(
            @RequestParam @NotBlank(message = "El email es obligatorio") @Email(message = "El email debe tener un formato válido") String email) {
        try {
            return ResponseEntity.ok(service.getRegistrationStatus(email));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(errorResponse(HttpStatus.NOT_FOUND, exception.getMessage()));
        }
    }

    @PostMapping("/complete")
    public ResponseEntity<?> completeRegistration(@Valid @RequestBody CompletarRegistroRequest request) {
        try {
            return ResponseEntity.ok(service.completeRegistration(request));
        } catch (AuthenticationException exception) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
        } catch (IllegalStateException exception) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(errorResponse(HttpStatus.CONFLICT, exception.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@Valid @RequestBody AuthenticationRequest request) {
        try {
            return ResponseEntity.ok(service.authenticate(request));
        } catch (AuthenticationException exception) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos"));
        }
    }

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody OlvidoContraseñaRequest request) {
        try {
            return ResponseEntity.ok(service.forgotPassword(request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(errorResponse(HttpStatus.NOT_FOUND, exception.getMessage()));
        }
    }

    @PostMapping("/validate-reset-code")
    public ResponseEntity<?> validateResetCode(@Valid @RequestBody ValidarCodigoReseteoRequest request) {
        try {
            return ResponseEntity.ok(service.validateResetCode(request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(errorResponse(HttpStatus.NOT_FOUND, exception.getMessage()));
        } catch (AuthenticationException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse(HttpStatus.BAD_REQUEST, exception.getMessage()));
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetearContraseñaRequest request) {
        try {
            return ResponseEntity.ok(service.resetPassword(request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(errorResponse(HttpStatus.NOT_FOUND, exception.getMessage()));
        } catch (AuthenticationException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse(HttpStatus.BAD_REQUEST, exception.getMessage()));
        }
    }

    private Map<String, Object> errorResponse(HttpStatus status, String message) {
        return Map.of(
                "timestamp", LocalDateTime.now(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message
        );
    }
}
