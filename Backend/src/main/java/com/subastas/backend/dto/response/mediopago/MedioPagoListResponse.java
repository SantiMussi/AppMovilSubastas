package com.subastas.backend.dto.response.mediopago;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MedioPagoListResponse {
    private List<MedioPagoResponse> items;
}
