package com.subastas.backend.service;

import com.subastas.backend.dto.request.MedioPagoCreateRequest;
import com.subastas.backend.dto.request.MedioPagoUpdateRequest;
import com.subastas.backend.dto.response.MedioPagoResponse;

import java.util.List;

public interface MedioPagoService {
    List<MedioPagoResponse> obtenerMediosDelUsuario(String email);

    MedioPagoResponse registrarMedio(String email, MedioPagoCreateRequest request);

    void actualizarMedio(String email, Integer paymentId, MedioPagoUpdateRequest request);

    void darDeBajaMedio(String email, Integer paymentId);

    List<MedioPagoResponse> obtenerMediosVerificadosDelUsuario(String email);
}