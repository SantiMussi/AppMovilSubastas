package com.subastas.backend.service;

import com.subastas.backend.dto.request.PagoMultaRequest;
import com.subastas.backend.dto.response.multa.MultaResponse;
import com.subastas.backend.dto.response.multa.PagoMultaResponse;
import com.subastas.backend.exception.MultaVencidaException;


import java.util.List;

public interface MultaService {
    List<MultaResponse> obtenerMultasPorUsuario(String email);
    MultaResponse obtenerMultaPorId(Integer multaId);
    PagoMultaResponse pagarMulta(PagoMultaRequest r, Integer idMulta, String email) throws MultaVencidaException;
}
