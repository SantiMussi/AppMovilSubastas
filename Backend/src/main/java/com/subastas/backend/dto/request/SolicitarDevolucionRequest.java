package com.subastas.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SolicitarDevolucionRequest {

    @NotBlank
    private String tipo;

    private String direccion;
}