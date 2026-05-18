package com.subastas.backend.service;

import com.subastas.backend.dto.response.MultaResponse;

import java.util.List;

public interface MultaService {
    List<MultaResponse> obtenerMultasPorUsuario(String email);
}
