package com.subastas.backend.dto.response.multa;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MultaListResponse {
    private List<MultaResponse> multas;
}
