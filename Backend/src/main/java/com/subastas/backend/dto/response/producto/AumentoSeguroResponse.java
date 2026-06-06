package com.subastas.backend.dto.response.producto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AumentoSeguroResponse {
    private String message;
    private BigDecimal newRequestedAmount;
}