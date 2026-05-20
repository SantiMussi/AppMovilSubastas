package com.subastas.backend.service;

import com.subastas.backend.dto.request.PagoMultaRequest;
import com.subastas.backend.dto.response.MultaResponse;
import com.subastas.backend.dto.response.PagoMultaResponse;
import com.subastas.backend.exception.MultaVencidaException;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface MultaService {
    List<MultaResponse> obtenerMultasPorUsuario(String email);
    MultaResponse obtenerMultaPorId(Integer multaId);
    PagoMultaResponse pagarMulta(PagoMultaRequest r, Integer idMulta, String email) throws MultaVencidaException;
}
