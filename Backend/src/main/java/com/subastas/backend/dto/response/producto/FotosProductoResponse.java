package com.subastas.backend.dto.response.producto;

import lombok.Data;

import java.util.List;

@Data
public class FotosProductoResponse {
    private Integer productId;
    private List<ItemFotoProductoResponse> items;
}