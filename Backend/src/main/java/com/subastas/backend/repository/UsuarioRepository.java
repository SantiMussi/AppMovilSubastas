package com.subastas.backend.repository;

import com.subastas.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    @EntityGraph(attributePaths = {"persona"})
    Optional<Usuario> findByEmail(String email);
}
