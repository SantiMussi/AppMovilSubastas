package com.subastas.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductInsuranceResponse {
    private String nroPoliza;
    private String compania;
    private String polizaCombinada;
    private BigDecimal importe;
}