package com.subastas.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RevisarPropuestaRequest {

    @NotNull(message = "El campo 'aprobar' es obligatorio")
    private Boolean aprobar;

    private String feedback;

    private BigDecimal precioBase;

    private BigDecimal comision;

    private String moneda;

    private Integer subastaAsignadaId;
}