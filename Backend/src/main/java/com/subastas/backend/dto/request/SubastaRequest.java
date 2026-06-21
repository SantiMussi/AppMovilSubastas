package com.subastas.backend.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import com.subastas.backend.entity.Categoria;

@Data
public class SubastaRequest {
    private LocalDate fecha;
    private LocalTime hora;
    private String estado;
    private String ubicacion;
    private Categoria categoria;
}