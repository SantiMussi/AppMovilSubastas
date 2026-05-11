package com.subastas.backend.service;

import com.subastas.backend.entity.Persona;
import com.subastas.backend.dto.response.PerfilResponse;

public interface PersonaService {
    PerfilResponse obtenerPerfil(String email);
    Persona actualizarPerfil(String email, Persona datosActualizados);
    void actualizarFotoPerfil(String email, org.springframework.web.multipart.MultipartFile archivo) throws java.io.IOException;
}