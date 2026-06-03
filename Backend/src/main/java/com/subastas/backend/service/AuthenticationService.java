package com.subastas.backend.service;

import com.subastas.backend.dto.request.AuthenticationRequest;
import com.subastas.backend.dto.request.CompletarRegistroRequest;
import com.subastas.backend.dto.request.RegisterRequest;
import com.subastas.backend.dto.response.AuthenticationResponse;
import com.subastas.backend.dto.response.registro.CompletarRegistroResponse;
import com.subastas.backend.dto.response.registro.RegistroInicialResponse;
import com.subastas.backend.dto.response.registro.EstadoRegistroResponse;
import com.subastas.backend.entity.Categoria;
import com.subastas.backend.entity.Cliente;
import com.subastas.backend.entity.Empleado;
import com.subastas.backend.entity.Persona;
import com.subastas.backend.entity.Usuario;
import com.subastas.backend.exception.ConflictException;
import com.subastas.backend.repository.ClienteRepository;
import com.subastas.backend.repository.EmpleadoRepository;
import com.subastas.backend.repository.PersonaRepository;
import com.subastas.backend.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
    private final ClienteRepository clienteRepository;
    private final EntityManager entityManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${app.auth.registration-verification-code:}")
    private String configuredRegistrationVerificationCode;

    @Transactional
    public RegistroInicialResponse register(RegisterRequest request) {
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
                .password(null)
                .apellido(trimToNull(request.getApellido()))
                .build();

        usuarioRepository.save(usuario);

        Empleado verificador = empleadoRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No hay empleados registrados en el sistema para asignar como verificador."));

        Cliente cliente = new Cliente();
        cliente.setIdentificador(savedPersona.getIdentificador());
        cliente.setPersona(savedPersona);
        cliente.setAdmitido("no");
        cliente.setCategoria(Categoria.comun);
        cliente.setVerificador(verificador);
        entityManager.persist(cliente);

        return RegistroInicialResponse.builder()
                .message("Registro inicial creado correctamente")
                .clientId(savedPersona.getIdentificador())
                .status("pendiente_verificacion")
                .build();
    }

    @Transactional(readOnly = true)
    public EstadoRegistroResponse getRegistrationStatus(String emailInput) {
        String email = normalizeEmail(emailInput);
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró un usuario registrado con ese email"));
        Cliente cliente = getCliente(usuario);
        boolean puedeCompletarEtapa2 = cliente != null && "si".equalsIgnoreCase(cliente.getAdmitido());

        return EstadoRegistroResponse.builder()
                .email(usuario.getEmail())
                .status(puedeCompletarEtapa2 ? "aprobado" : "pendiente_verificacion")
                .categoria(cliente != null && cliente.getCategoria() != null ? cliente.getCategoria().name() : null)
                .puedeCompletarEtapa2(puedeCompletarEtapa2)
                .build();
    }

    @Transactional
    public CompletarRegistroResponse completeRegistration(CompletarRegistroRequest request) {
        validateRegistrationCode(request.getVerificationCode());

        String email = normalizeEmail(request.getEmail());
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));
        Cliente cliente = getCliente(usuario);

        if (cliente == null || !"si".equalsIgnoreCase(cliente.getAdmitido())) {
            throw new IllegalStateException("La etapa 1 del registro todavía no está aprobada");
        }
        if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
            throw new IllegalStateException("El registro ya fue completado");
        }

        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        Usuario savedUsuario = usuarioRepository.save(usuario);
        String jwtToken = jwtService.generateToken(savedUsuario);

                return CompletarRegistroResponse.builder()
                .message("Registro completado correctamente")
                .accessToken(jwtToken)
                .refreshToken(jwtToken)
                .user(CompletarRegistroResponse.UserResponse.builder()
                        .id(savedUsuario.getPersona().getIdentificador())
                        .email(savedUsuario.getEmail())
                        .categoria(cliente.getCategoria() != null ? cliente.getCategoria() : null)
                        .build())
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

    private void validateRegistrationCode(String verificationCode) {
        String normalizedCode = verificationCode.trim();
        if (configuredRegistrationVerificationCode == null || configuredRegistrationVerificationCode.isBlank()) {
            return;
        }
        if (!configuredRegistrationVerificationCode.trim().equals(normalizedCode)) {
            throw new BadCredentialsException("Código de verificación inválido");
        }
    }

    private Cliente getCliente(Usuario usuario) {
        if (usuario.getPersona() == null || usuario.getPersona().getIdentificador() == null) {
            return null;
        }
        return clienteRepository.findById(usuario.getPersona().getIdentificador()).orElse(null);
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