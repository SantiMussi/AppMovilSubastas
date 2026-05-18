package com.subastas.backend.dto.response;

import com.subastas.backend.entity.Producto;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SubastaResponse {
    private Integer identificador;
    private LocalDate fecha;
    private LocalTime hora;
    private String estado;
    private String ubicacion;
    private String categoria;
    private Producto producto;
}