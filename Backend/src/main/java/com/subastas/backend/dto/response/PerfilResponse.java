package com.subastas.backend.dto.response;

import lombok.Data;

@Data
public class PerfilResponse {
    private Integer identificador;
    private String documento;
    private String nombre;
    private String apellido;
    private String email;
    private String direccion;
}