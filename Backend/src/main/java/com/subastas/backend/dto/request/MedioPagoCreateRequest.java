package com.subastas.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MedioPagoCreateRequest {

    @NotBlank
    @Size(max = 50)
    private String tipo;

    @NotBlank
    @Size(max = 150)
    private String entidad;

    @NotBlank
    @Size(max = 80)
    private String numeroIdentificacion;

    @NotBlank
    @Size(max = 10)
    private String moneda;

    @DecimalMin(value = "0.01", inclusive = false)
    private BigDecimal montoGarantia;

    @Size(max = 1000)
    private String comprobante;
}