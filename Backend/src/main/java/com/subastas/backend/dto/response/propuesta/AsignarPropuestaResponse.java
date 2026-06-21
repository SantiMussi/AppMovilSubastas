package com.subastas.backend.dto.response.propuesta;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AsignarPropuestaResponse {
    private String mensaje;
    private Integer propuestaId;
    private Integer productoId;
    private Integer itemCatalogoId;
    private Integer subastaId;
    private String nombreSubasta;
}