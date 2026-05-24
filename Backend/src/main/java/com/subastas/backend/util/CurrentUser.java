package com.subastas.backend.util;

import com.subastas.backend.entity.Usuario;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Helper para obtener el usuario autenticado desde el contexto de seguridad.
 * El JWT pone el email como principal (via JwtAuthenticationFilter).
 */
@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UsuarioRepository usuarioRepository;

    /** Retorna la entidad Usuario del token activo. */
    public Usuario get() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails ud)
                ? ud.getUsername()
                : principal.toString();

        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));
    }

    /**
     * Retorna el identificador de la Persona (= id en empleados).
     * Útil para registrar quién ejecutó una acción admin.
     */
    public Integer obtenerEmpleadoId() {
        return get().getPersona().getIdentificador();
    }
}
