package com.subastas.backend.service.impl;

import com.subastas.backend.entity.Persona;
import com.subastas.backend.repository.PersonaRepository;
import com.subastas.backend.service.PersonaService;
import com.subastas.backend.util.ImageUtils;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PersonaServiceImpl implements PersonaService {

    @Autowired
    private PersonaRepository personaRepository;

    @Override
    public Persona obtenerPerfil(String email) {
        return personaRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Override
    public Persona actualizarPerfil(String email, Persona datos) {
        Persona existente = obtenerPerfil(email);
        existente.setNombre(datos.getNombre());
        existente.setApellido(datos.getApellido());
        existente.setDireccion(datos.getDireccion());
        // No actualizamos el password aca, se haria en otro endpoint
        return personaRepository.save(existente);
    }

    @Override
    public void actualizarFotoPerfil(String email, MultipartFile archivo) throws IOException {
        Persona persona = obtenerPerfil(email);

        // Usamos el utilitario. Si hay un error (archivo vacío, no es imagen), tira la
        // excepción automáticamente
        persona.setFoto(ImageUtils.procesarImagen(archivo));

        personaRepository.save(persona);
    }
}