package com.subastas.backend.service;

import com.subastas.backend.dto.request.AuthenticationRequest;
import com.subastas.backend.dto.request.RegisterRequest;
import com.subastas.backend.dto.response.AuthenticationResponse;
import com.subastas.backend.entity.Persona;
import com.subastas.backend.repository.PersonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final PersonaRepository personaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        String documento = request.getDocumento().trim();

        personaRepository.findByEmail(email).ifPresent(persona -> {
            throw new IllegalArgumentException("Ya existe una persona registrada con ese email");
        });
        personaRepository.findByDocumento(documento).ifPresent(persona -> {
            throw new IllegalArgumentException("Ya existe una persona registrada con ese documento");
        });

        Persona persona = Persona.builder()
                .documento(documento)
                .nombre(request.getNombre().trim())
                .apellido(trimToNull(request.getApellido()))
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .direccion(trimToNull(request.getDireccion()))
                .estado("activo")
                .build();

        Persona savedPersona = personaRepository.save(persona);
        String jwtToken = jwtService.generateToken(savedPersona);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        String email = normalizeEmail(request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        Persona persona = personaRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Email o contraseña incorrectos"));
        String jwtToken = jwtService.generateToken(persona);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .build();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}