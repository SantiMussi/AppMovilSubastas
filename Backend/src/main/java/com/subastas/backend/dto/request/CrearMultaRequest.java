package com.subastas.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CrearMultaRequest {

    @NotNull(message = "usuarioId es obligatorio")
    private Integer usuarioId;

    @NotNull(message = "subastaId es obligatorio")
    private Integer subastaId;

    @NotNull(message = "pujoId es obligatorio")
    private Integer pujoId;

    @NotBlank(message = "moneda es obligatoria")
    @Pattern(regexp = "ARS|USD", message = "moneda debe ser ARS o USD")
    private String moneda;

    @NotNull(message = "montoOferta es obligatorio")
    @DecimalMin(value = "0.01", message = "montoOferta debe ser mayor a 0")
    private BigDecimal montoOferta;

    @DecimalMin(value = "0.01", message = "porcentajeMulta debe ser mayor a 0")
    private BigDecimal porcentajeMulta;
}
