package com.subastas.backend.dto.response.producto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UbicacionProductoResponse {
    private Integer productId;
    private String deposito;
    private String sector;
    private LocalDateTime ultimaActualizacion;
}