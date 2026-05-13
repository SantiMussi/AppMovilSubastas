package com.subastas.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MedioPagoListResponse {
    private List<MedioPagoResponse> items;
}
