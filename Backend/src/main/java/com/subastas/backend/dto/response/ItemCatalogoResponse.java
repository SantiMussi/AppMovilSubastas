package com.subastas.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ItemCatalogoResponse {
    private Integer identificador;
    private BigDecimal precioBase;
    private BigDecimal comision;
    private String subastado;
    private ProductoResponse producto;
}
