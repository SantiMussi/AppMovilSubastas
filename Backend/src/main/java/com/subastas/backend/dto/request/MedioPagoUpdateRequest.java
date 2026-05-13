package com.subastas.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MedioPagoUpdateRequest {

    @Size(max = 50)
    private String tipo;

    @Size(max = 150)
    private String entidad;

    @Size(max = 80)
    private String numeroIdentificacion;

    @Size(max = 10)
    private String moneda;

    @DecimalMin(value = "0.01", inclusive = false)
    private BigDecimal montoGarantia;

    @Size(max = 1000)
    private String comprobante;

    private Boolean activo;
}
