package com.subastas.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TerminosPropuestaRequest {
    @NotNull
    private Boolean acceptBasePriceAndCommission;
}