package com.subastas.backend.service;

import com.subastas.backend.dto.request.*;
import com.subastas.backend.dto.response.MessageResponse;
import com.subastas.backend.dto.response.multa.CrearMultaResponse;
import com.subastas.backend.dto.response.subasta.AdjudicarItemResponse;
import com.subastas.backend.dto.response.subasta.CerrarSubastaResponse;
import com.subastas.backend.dto.response.subasta.CrearSubastaResponse;
 
public interface AdminService {
 
    // Subastas
    CrearSubastaResponse crearSubasta(Integer empleadoId, CrearSubastaRequest req);
    CerrarSubastaResponse cerrarSubasta(Integer empleadoId, Integer subastaId);
    AdjudicarItemResponse adjudicarItem(Integer empleadoId, Integer itemId, AdjudicarItemRequest req);
 
    // Usuarios
    MessageResponse cambiarCategoria(Integer empleadoId, Integer usuarioId, CambiarCategoriaRequest req);
 
    // Medios de pago
    MessageResponse verificarPago(Integer empleadoId, Integer pagoId, VerificarPagoRequest req);
 
    // Propuestas
    MessageResponse revisarPropuesta(Integer empleadoId, Integer propuestaId, RevisarPropuestaRequest req);
 
    // Multas
    CrearMultaResponse crearMulta(Integer empleadoId, CrearMultaRequest req);
}