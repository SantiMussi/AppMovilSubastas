package com.subastas.backend.repository;

import com.subastas.backend.entity.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PersonaRepository extends JpaRepository<Persona, Integer> {
    Optional<Persona> findByDocumento(String documento);
}
