package com.subastas.backend.dto.response.puja;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PujaCreadaResponse {
    private Integer bidId;
    private Integer auctionItemId;
    private BigDecimal amount;
    private Boolean isTopBid;
    private LocalDateTime createdAt;
}
