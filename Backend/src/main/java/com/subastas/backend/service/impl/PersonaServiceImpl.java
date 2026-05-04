package com.subastas.backend.service.impl;

import com.subastas.backend.entity.Persona;
import com.subastas.backend.repository.PersonaRepository;
import com.subastas.backend.service.PersonaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PersonaServiceImpl implements PersonaService {

    private final PersonaRepository personaRepository;

    @Override
    public Persona save(Persona persona) {
        return personaRepository.save(persona);
    }

    @Override
    public Optional<Persona> getById(Integer id) {
        return personaRepository.findById(id);
    }

    @Override
    public Optional<Persona> getByEmail(String email) {
        return personaRepository.findByEmail(email);
    }
}
