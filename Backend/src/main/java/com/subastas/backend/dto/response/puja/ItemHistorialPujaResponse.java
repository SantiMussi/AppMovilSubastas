package com.subastas.backend.dto.response.puja;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ItemHistorialPujaResponse {
    private Integer bidId;
    private Integer bidderNumber;
    private BigDecimal importe;
    private LocalDateTime fecha;
}