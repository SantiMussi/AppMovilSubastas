package com.subastas.backend.dto.response.propuesta;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ItemListaPropuestaResponse {
    private Integer proposalId;
    private String titulo;
    private String status;
    private LocalDateTime createdAt;
}