package com.subastas.backend.config;

import com.subastas.backend.repository.EmpleadoRepository;
import com.subastas.backend.entity.Usuario;
import com.subastas.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UsuarioRepository usuarioRepository;
    private final EmpleadoRepository empleadoRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> usuarioRepository.findByEmail(username)
                .filter(usuario -> usuario.getPassword() != null && !usuario.getPassword().isBlank())
                .map(this::toUserDetails)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider authenticationProvider =
                new DaoAuthenticationProvider(userDetailsService);

        authenticationProvider.setPasswordEncoder(passwordEncoder);

        return authenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private UserDetails toUserDetails(Usuario usuario) {
        boolean esEmpleado = usuario.getPersona() != null
                && empleadoRepository.existsById(usuario.getPersona().getIdentificador());

        boolean deshabilitado = usuario.getPersona() != null
                && usuario.getPersona().getEstado() != null
                && !"activo".equalsIgnoreCase(usuario.getPersona().getEstado());

        var builder = User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPassword())
                .disabled(deshabilitado);

        if (esEmpleado) {
            builder.authorities("USUARIO", "ADMIN");
        } else {
            builder.authorities("USUARIO");
        }

        return builder.build();
    }
}