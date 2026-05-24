package com.subastas.backend.dto.response.subasta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CerrarSubastaResponse {
    private String mensaje;
    private Integer subastaId;
    private String estado;
    private LocalDateTime cerradaEn;
}
