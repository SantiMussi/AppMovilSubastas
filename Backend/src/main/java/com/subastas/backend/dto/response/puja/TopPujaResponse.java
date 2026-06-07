package com.subastas.backend.dto.response.puja;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TopPujaResponse {
    private Integer auctionItemId;
    private BigDecimal currentBid;
    private String currency;
    private Integer bidderNumber;
    private String bidderName;
    private BigDecimal nextMinBid;
    private BigDecimal nextMaxBid;
    private Boolean appliesCap;
}

