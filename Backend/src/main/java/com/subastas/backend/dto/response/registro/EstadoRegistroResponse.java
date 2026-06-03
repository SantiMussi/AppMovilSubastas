package com.subastas.backend.dto.response.registro;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstadoRegistroResponse {
    private String email;
    private String status;
    private String categoria;
    private Boolean puedeCompletarEtapa2;
}