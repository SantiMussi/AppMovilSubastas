package com.subastas.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CrearPropuestaRequest {

    @NotBlank
    private String titulo;

    @NotBlank
    private String descripcion;

    @NotBlank
    private String historia;

    @NotEmpty
    private List<@NotBlank String> fotos;

    private String origenLicitoUrl;
}