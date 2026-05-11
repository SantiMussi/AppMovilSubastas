package com.subastas.backend.service;

import com.subastas.backend.entity.Persona;

public interface PersonaService {
    Persona obtenerPerfil(String email);
    Persona actualizarPerfil(String email, Persona datosActualizados);
    void actualizarFotoPerfil(String email, org.springframework.web.multipart.MultipartFile archivo) throws java.io.IOException;
}