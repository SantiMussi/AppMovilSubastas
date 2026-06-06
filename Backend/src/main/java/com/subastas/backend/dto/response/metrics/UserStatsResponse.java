package com.subastas.backend.dto.response.metrics;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UserStatsResponse {
    private BigDecimal valuacionPortfolio;
    private Integer asistencia;
    private Integer victorias;
    private BigDecimal promedioPuja;
}
