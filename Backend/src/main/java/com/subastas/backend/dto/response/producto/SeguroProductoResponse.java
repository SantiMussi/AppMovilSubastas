package com.subastas.backend.dto.response.producto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SeguroProductoResponse {
    private String nroPoliza;
    private String compania;
    private String polizaCombinada;
    private BigDecimal importe;
}