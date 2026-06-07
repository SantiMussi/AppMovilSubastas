package com.subastas.backend.dto.response.metrics;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BidItemDto {
    private Integer id;
    private String status; // GANADA, PERDIDA, ACTIVA
    private String lotNumber;
    private String category;
    private String title;
    private String description;
    private BigDecimal price; // PRECIO FINAL DE ADJUDICACIÓN o TU PUJA
    private String auctioneer;
    private String auctionDate;
    private String image;
}
