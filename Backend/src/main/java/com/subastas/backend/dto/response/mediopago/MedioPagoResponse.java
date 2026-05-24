package com.subastas.backend.dto.response.mediopago;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class MedioPagoResponse {
    private Integer id;
    private String tipo;
    private String entidad;
    private String numeroIdentificacion;
    private String moneda;
    private BigDecimal montoGarantia;
    private String comprobante;
    private Boolean verificado;
    private Boolean activo;
}