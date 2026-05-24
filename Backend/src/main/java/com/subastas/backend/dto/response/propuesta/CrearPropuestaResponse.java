package com.subastas.backend.dto.response.propuesta;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CrearPropuestaResponse {
    private String message;
    private Integer proposalId;
    private String status;
}