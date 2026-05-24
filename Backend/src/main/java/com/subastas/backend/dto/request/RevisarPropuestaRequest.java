package com.subastas.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RevisarPropuestaRequest {

    // true = aprobar, false = rechazar.
    @NotNull(message = "El campo 'aprobar' es obligatorio")
    private Boolean aprobar;

    // Requerido si aprobar = false.
    private String motivoRechazo;

    // Requerido si aprobar = true. 
    private BigDecimal precioBase;

    // Requerido si aprobar = true.
    private BigDecimal comision;

    // Opcional si aprobar = true: asigna la propuesta a una subasta existente.
    private Integer subastaAsignadaId;
}
