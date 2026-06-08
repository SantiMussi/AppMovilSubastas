package com.subastas.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CrearPujaRequest {

    @NotNull
    @DecimalMin(value = "0.00", inclusive = false)
    @Digits(integer = 16, fraction = 2)
    private BigDecimal amount;

    @NotNull
    private Integer paymentMethodId;

    @Size(max = 100)
    private String clientRequestId;
}