package com.subastas.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AsignarPropuestaRequest {
    @NotNull
    private Integer catalogoId;
}