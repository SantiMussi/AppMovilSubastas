package com.subastas.backend.dto.response.subasta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearSubastaResponse {

    private String mensaje;
    private Integer subastaId;
    private String estado;
    private String moneda;
}
