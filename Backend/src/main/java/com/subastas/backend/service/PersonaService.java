package com.subastas.backend.service;

import com.subastas.backend.dto.request.PerfilRequest;
import com.subastas.backend.dto.response.PerfilResponse;

public interface PersonaService {
    PerfilResponse obtenerPerfil(String email);
    PerfilResponse actualizarPerfil(String email, PerfilRequest datosActualizados);
    void actualizarFotoPerfil(String email, org.springframework.web.multipart.MultipartFile archivo) throws java.io.IOException;
    void eliminarCuenta(String email);
    com.subastas.backend.dto.response.metrics.UserStatsResponse obtenerStatsUsuario(String email);
    com.subastas.backend.dto.response.metrics.UserWinsResponse obtenerWinsUsuario(String email);
    com.subastas.backend.dto.response.metrics.UserBidsResponse obtenerBidsHistory(String email);
    com.subastas.backend.dto.response.metrics.UserCollectionResponse obtenerColeccionUsuario(String email);
}