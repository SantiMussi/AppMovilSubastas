package com.subastas.backend.dto.response.producto;

import lombok.Data;

@Data
public class SeguroConsignedItemResponse {
    private Integer productId;
    private SeguroProductoResponse insurance;
}