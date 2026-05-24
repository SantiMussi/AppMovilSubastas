package com.subastas.backend.dto.response.multa;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.subastas.backend.dto.response.subasta.SubastaResponse;

@Data
@Builder
public class MultaResponse {
    private Integer identificador;
    private String estado;
    private String moneda;
    private LocalDateTime fechaEmision;
    private LocalDateTime fechaLimite;
    private LocalDateTime fechaPago;
    private BigDecimal monto;
    private SubastaResponse subasta;
    private String descProducto;
}
