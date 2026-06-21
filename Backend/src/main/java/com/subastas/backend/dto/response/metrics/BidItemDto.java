package com.subastas.backend.dto.response.metrics;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

import com.subastas.backend.dto.response.puja.ItemHistorialPujaResponse;

@Data
public class BidItemDto {
    private Integer id;
    private String status; // ACTIVA, CERRADA
    private String auctionStatus;
    private String lotNumber;
    private String category;
    private String title;
    private String description;
    private BigDecimal price; // PRECIO FINAL DE ADJUDICACIÓN o TU PUJA
    private String auctioneer;
    private String auctionDate;
    private String image;
    private List<ItemHistorialPujaResponse> bidHistory;
}
