package com.subastas.backend.dto.response.producto;

import lombok.Data;
import com.subastas.backend.entity.Categoria;

@Data
public class DueñoProductoResponse {
    private Integer ownerId;
    private String nombre;
    private Categoria categoria;
}