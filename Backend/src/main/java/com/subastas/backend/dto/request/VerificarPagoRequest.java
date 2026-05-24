package com.subastas.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerificarPagoRequest {

    @NotNull(message = "El campo 'aprobar' es obligatorio")
    private Boolean aprobar;

    private String motivo;
}
