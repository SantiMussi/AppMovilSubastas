package com.subastas.backend.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateProposalRequest {

    @NotBlank
    private String titulo;

    @NotBlank
    private String descripcion;

    @NotBlank
    private String historia;

    @NotEmpty
    private List<@NotBlank String> fotos;

    @AssertTrue(message = "declaracionPropiedad debe ser true")
    private boolean declaracionPropiedad;

    @AssertTrue(message = "acuerdoEnvio debe ser true")
    private boolean acuerdoEnvio;

    @NotBlank
    private String origenLicitoAdjunto;
}