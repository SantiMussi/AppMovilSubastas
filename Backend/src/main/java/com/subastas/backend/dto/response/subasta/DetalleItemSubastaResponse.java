package com.subastas.backend.dto.response.subasta;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class DetalleItemSubastaResponse {
    private Integer auctionItemId;
    private Integer productId;
    private String description;
    private String historia;
    private BigDecimal precioBase;
    private BigDecimal comision;
    private Boolean subastado;
    private List<String> imagenes;
    private ResumenDueñoResponse ownerSummary;
}