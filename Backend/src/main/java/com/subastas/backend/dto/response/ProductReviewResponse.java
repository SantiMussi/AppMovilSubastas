package com.subastas.backend.dto.response;

import lombok.Data;

@Data
public class ProductReviewResponse {
    private Integer reviewerId;
    private String reviewStatus;
}