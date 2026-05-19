package com.subastas.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BidHistoryItemResponse {
    private Integer bidId;
    private Integer bidderNumber;
    private BigDecimal importe;
    private LocalDateTime fecha;
}