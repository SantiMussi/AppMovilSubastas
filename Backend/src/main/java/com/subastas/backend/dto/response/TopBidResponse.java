package com.subastas.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TopBidResponse {
    private Integer auctionItemId;
    private BigDecimal currentBid;
    private String currency;
    private Integer bidderNumber;
    private BigDecimal nextMinBid;
    private BigDecimal nextMaxBid;
    private Boolean appliesCap;
}

