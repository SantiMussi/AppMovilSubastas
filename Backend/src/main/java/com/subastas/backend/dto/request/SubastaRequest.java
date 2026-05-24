package com.subastas.backend.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SubastaRequest {
    private LocalDate fecha;
    private LocalTime hora;
    private String estado; // "abierta", "carrada", "proxima"
    private String ubicacion;
    private Categoria categoria;
}