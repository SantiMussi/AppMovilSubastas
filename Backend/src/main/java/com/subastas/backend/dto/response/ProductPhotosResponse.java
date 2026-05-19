package com.subastas.backend.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ProductPhotosResponse {
    private Integer productId;
    private List<ProductPhotoItemResponse> items;
}