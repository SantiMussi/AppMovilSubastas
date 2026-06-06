package com.subastas.backend.dto.response.metrics;

import lombok.Data;
import java.util.List;

@Data
public class UserWinsResponse {
    private Double tasaExito;
    private List<InvestmentBreakdownDto> desgloseInversiones;
}
