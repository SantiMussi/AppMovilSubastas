package com.subastas.backend.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ProductDetailResponse {
    private Integer productId;
    private String descripcion;
    private String descripcionCatalogo;
    private String descripcionCompleta;
    private String historia;
    private LocalDate fechaRegistro;
    private Boolean disponible;
    private ProductOwnerResponse owner;
    private ProductReviewResponse review;
    private ProductInsuranceResponse insurance;
    private Long photosCount;
}