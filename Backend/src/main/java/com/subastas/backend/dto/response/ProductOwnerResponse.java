package com.subastas.backend.dto.response;

import lombok.Data;
import com.subastas.backend.entity.Categoria;

@Data
public class ProductOwnerResponse {
    private Integer ownerId;
    private String nombre;
    private Categoria categoria;
}