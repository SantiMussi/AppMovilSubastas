package com.subastas.backend.service;

import com.subastas.backend.entity.Persona;
import java.util.Optional;

public interface PersonaService {
    Persona save(Persona persona);
    Optional<Persona> getById(Integer id);
    Optional<Persona> getByEmail(String email);
}
