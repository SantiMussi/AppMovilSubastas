package com.subastas.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MedioPagoCreatedResponse {
    private String message;
    private MedioPagoResponse paymentMethod;
}