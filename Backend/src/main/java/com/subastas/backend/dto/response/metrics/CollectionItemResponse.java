package com.subastas.backend.dto.response.metrics;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CollectionItemResponse {
    private Integer registroId;
    private Integer productId;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private String estadoEntrega;
    private String imagenUrl;
}