package com.subastas.backend.dto.response.multa;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearMultaResponse {
    private String mensaje;
    private Integer multaId;
    private Integer usuarioId;
    private BigDecimal montoMulta;
    private LocalDateTime fechaEmision;
    private LocalDateTime fechaLimite;
}
