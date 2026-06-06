package com.subastas.backend.dto.response.metrics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentBreakdownDto {
    private String categoria;
    private Double porcentaje;
}
