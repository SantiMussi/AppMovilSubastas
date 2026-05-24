package com.subastas.backend.dto.response.subasta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdjudicarItemResponse {
    private String mensaje;
    private Integer itemCatalogoId;
    private Integer clienteGanadorId;
    private BigDecimal montoGanador;
    private Integer registroId;
}
