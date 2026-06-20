package com.subastas.backend.dto.response.metrics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WinSaleDto {
    private Integer saleId;
    private Integer registroId;
    private Integer auctionItemId;
    private Integer subastaId;
    private Integer productId;
    private String nombre;
    private BigDecimal montoGanador;
    private BigDecimal comision;
    private BigDecimal total;
    private String moneda;
}