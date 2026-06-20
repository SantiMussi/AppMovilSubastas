package com.subastas.backend.service;

import java.util.List;

import com.subastas.backend.dto.request.CrearPropuestaRequest;
import com.subastas.backend.dto.request.SolicitarDevolucionRequest;
import com.subastas.backend.dto.request.TerminosPropuestaRequest;
import com.subastas.backend.dto.response.propuesta.CrearPropuestaResponse;
import com.subastas.backend.dto.response.propuesta.DetallePropuestaResponse;
import com.subastas.backend.dto.response.propuesta.ListaPropuestaResponse;
import com.subastas.backend.dto.response.propuesta.TerminosPropuestaResponse;

public interface PropuestaService {
    CrearPropuestaResponse create(CrearPropuestaRequest request, String email);
    ListaPropuestaResponse listMine(String email);
    DetallePropuestaResponse getMine(Integer proposalId, String email);
    TerminosPropuestaResponse solicitarDevolucion(Integer proposalId, SolicitarDevolucionRequest request, String email);
    List<String> getPhotos(Integer proposalId, String email);
    TerminosPropuestaResponse respondTerms(Integer proposalId, TerminosPropuestaRequest request, String email);
}