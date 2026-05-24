package com.subastas.backend.dto.response.multa;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PagoMultaResponse {
    private Integer multaId;
    private BigDecimal montoPagado;
    private String moneda;
    private LocalDateTime fechaPago;
    private Integer medioPagoId;
    private String mensaje;
}
