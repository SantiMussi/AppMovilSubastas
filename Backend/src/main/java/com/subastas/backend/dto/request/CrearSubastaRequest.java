package com.subastas.backend.dto.request;

import com.subastas.backend.entity.Categoria;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CrearSubastaRequest {

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "La hora es obligatoria")
    private LocalTime hora;

    @Size(max = 350)
    private String ubicacion;

    @Min(1)
    private Integer capacidadAsistentes;

    private Boolean tieneDeposito;
    private Boolean seguridadPropia;

    @NotNull(message = "La categoría es obligatoria")
    private Categoria categoria;

    @NotBlank(message = "La moneda es obligatoria")
    @Pattern(regexp = "ARS|USD", message = "La moneda debe ser ARS o USD")
    private String moneda;

    private Integer subastadorId;
}
