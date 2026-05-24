package com.subastas.backend.dto.response.catalogo;

import lombok.Data;
import java.math.BigDecimal;

import com.subastas.backend.dto.response.producto.ProductoResponse;

@Data
public class ItemCatalogoResponse {
    private Integer identificador;
    private BigDecimal precioBase;
    private BigDecimal comision;
    private String subastado;
    private ProductoResponse producto;
}
