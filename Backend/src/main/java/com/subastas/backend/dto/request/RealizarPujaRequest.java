package com.subastas.backend.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RealizarPujaRequest {
    private String type;
    private BigDecimal amount;
    private Integer paymentMethodId;
}
