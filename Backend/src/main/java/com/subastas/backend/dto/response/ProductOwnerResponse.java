package com.subastas.backend.dto.response;

import lombok.Data;

@Data
public class ProductOwnerResponse {
    private Integer ownerId;
    private String nombre;
    private String categoria;
}