package com.subastas.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AumentarSeguroRequest {
    @NotNull(message = "El importe de aumento es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El importe de aumento debe ser mayor a cero")
    private BigDecimal increaseAmount;
}