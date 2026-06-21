package com.subastas.backend.service;

import com.subastas.backend.dto.request.*;
import com.subastas.backend.dto.response.MessageResponse;
import com.subastas.backend.dto.response.admin.AdminUserResponse;
import com.subastas.backend.dto.response.multa.CrearMultaResponse;
import com.subastas.backend.dto.response.propuesta.AsignarPropuestaResponse;
import com.subastas.backend.dto.response.subasta.AdjudicarItemResponse;
import com.subastas.backend.dto.response.subasta.CerrarSubastaResponse;
import com.subastas.backend.dto.response.subasta.CrearSubastaResponse;

import java.util.List;

public interface AdminService {

    CrearSubastaResponse crearSubasta(Integer empleadoId, CrearSubastaRequest req);
    CerrarSubastaResponse cerrarSubasta(Integer empleadoId, Integer subastaId);
    AdjudicarItemResponse adjudicarItem(Integer empleadoId, Integer itemId, AdjudicarItemRequest req);

    List<AdminUserResponse> obtenerUsuarios();
    MessageResponse cambiarCategoria(Integer empleadoId, Integer usuarioId, CambiarCategoriaRequest req);
    MessageResponse admitirUsuario(Integer empleadoId, Integer usuarioId);

    MessageResponse verificarPago(Integer empleadoId, Integer pagoId, VerificarPagoRequest req);

    
    AsignarPropuestaResponse asignarPropuesta(Integer empleadoId, Integer propuestaId, AsignarPropuestaRequest req);
    MessageResponse revisarPropuesta(Integer empleadoId, Integer propuestaId, RevisarPropuestaRequest req);
    

    CrearMultaResponse crearMulta(Integer empleadoId, CrearMultaRequest req);
}