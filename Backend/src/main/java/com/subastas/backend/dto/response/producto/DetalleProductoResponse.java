package com.subastas.backend.dto.response.producto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DetalleProductoResponse {
    private Integer productId;
    private String descripcion;
    private String descripcionCatalogo;
    private String descripcionCompleta;
    private String historia;
    private LocalDate fechaRegistro;
    private Boolean disponible;
    private DueñoProductoResponse owner;
    private RevisionProductoResponse review;
    private SeguroProductoResponse insurance;
    private Long photosCount;
}