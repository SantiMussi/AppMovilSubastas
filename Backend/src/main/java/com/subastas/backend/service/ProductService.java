package com.subastas.backend.service;

import com.subastas.backend.dto.response.ProductDetailResponse;
import com.subastas.backend.dto.response.ProductPhotosResponse;

public interface ProductService {
    ProductDetailResponse obtenerDetalle(Integer productId);

    ProductPhotosResponse obtenerFotos(Integer productId);
}