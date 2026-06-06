package com.subastas.backend.dto.response.metrics;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UserCollectionResponse {
    private BigDecimal valorPortfolio;
    private Integer adquisiciones;
    private List<CollectionItemResponse> items;
}
