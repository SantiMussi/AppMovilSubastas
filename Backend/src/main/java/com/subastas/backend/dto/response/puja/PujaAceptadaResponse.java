package com.subastas.backend.dto.response.puja;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
public class PujaAceptadaResponse {
    private String type;
    private Instant acceptedAt;
    private Integer bidId;
    private Integer auctionItemId;
    private BigDecimal amount;
}