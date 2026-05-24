package com.subastas.backend.service;

import com.subastas.backend.entity.Categoria;
import com.subastas.backend.dto.request.AuthenticationRequest;
import com.subastas.backend.dto.request.RegisterRequest;
import com.subastas.backend.dto.response.AuthenticationResponse;
import com.subastas.backend.entity.Cliente;
import com.subastas.backend.entity.Empleado;
import com.subastas.backend.entity.Persona;
import com.subastas.backend.entity.Usuario;
import com.subastas.backend.repository.EmpleadoRepository;
import com.subastas.backend.repository.PersonaRepository;
import com.subastas.backend.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final PersonaRepository personaRepository;
    private final EmpleadoRepository empleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntityManager entityManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        String documento = request.getDocumento().trim();

        usuarioRepository.findByEmail(email).ifPresent(usuario -> {
            throw new IllegalArgumentException("Ya existe un usuario registrado con ese email");
        });
        personaRepository.findByDocumento(documento).ifPresent(persona -> {
            throw new IllegalArgumentException("Ya existe una persona registrada con ese documento");
        });

        Persona persona = Persona.builder()
                .documento(documento)
                .nombre(request.getNombre().trim())
                .direccion(trimToNull(request.getDireccion()))
                .estado("activo")
                .build();

        Persona savedPersona = personaRepository.save(persona);

        Usuario usuario = Usuario.builder()
                .persona(savedPersona)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .apellido(trimToNull(request.getApellido()))
                .build();

        Usuario savedUsuario = usuarioRepository.save(usuario);

        Empleado verificador = empleadoRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No hay empleados registrados en el sistema para asignar como verificador."));

        Cliente cliente = new Cliente();
        cliente.setIdentificador(savedPersona.getIdentificador());
        cliente.setPersona(savedPersona);
        cliente.setAdmitido("si");
        cliente.setCategoria(Categoria.comun);
        cliente.setVerificador(verificador);
        entityManager.persist(cliente);

        String jwtToken = jwtService.generateToken(savedUsuario);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        String email = normalizeEmail(request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Email o contraseña incorrectos"));
        String jwtToken = jwtService.generateToken(usuario);
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