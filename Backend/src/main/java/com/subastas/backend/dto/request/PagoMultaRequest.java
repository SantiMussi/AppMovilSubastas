package com.subastas.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PagoMultaRequest {

    @NotNull(message = "El medio de pago es obligatorio")
    private Integer medioPago;
}
