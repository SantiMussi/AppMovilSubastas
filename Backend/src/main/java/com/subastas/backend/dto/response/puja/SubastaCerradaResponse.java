package com.subastas.backend.dto.response.puja;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class SubastaCerradaResponse {
    private String type;
    private Instant generatedAt;
    private Integer auctionId;
    private Integer auctionItemId;
    private String status;
    private Boolean auctionClosed;
    private Boolean biddingOpen;
}