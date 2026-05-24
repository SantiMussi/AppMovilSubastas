package com.subastas.backend.dto.response.producto;

import lombok.Data;

@Data
public class RevisionProductoResponse {
    private Integer reviewerId;
    private String reviewStatus;
}