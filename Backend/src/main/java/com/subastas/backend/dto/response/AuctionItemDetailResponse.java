package com.subastas.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class AuctionItemDetailResponse {
    private Integer auctionItemId;
    private Integer productId;
    private String description;
    private String historia;
    private BigDecimal precioBase;
    private BigDecimal comision;
    private Boolean subastado;
    private List<String> imagenes;
    private OwnerSummaryResponse ownerSummary;
}