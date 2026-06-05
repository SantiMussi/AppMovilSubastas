package com.subastas.backend.repository;

import com.subastas.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    @Override
    @EntityGraph(attributePaths = {"persona"})
    List<Usuario> findAll();
    
    @EntityGraph(attributePaths = {"persona"})
    Optional<Usuario> findByEmail(String email);
}
