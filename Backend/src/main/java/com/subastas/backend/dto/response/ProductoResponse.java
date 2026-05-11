package com.subastas.backend.dto.response;

import lombok.Data;

@Data
public class ProductoResponse {
    private Integer identificador;
    private String descripcionCatalogo;
    private String descripcionCompleta;
    private String nombre;
    private byte[] foto;
}
