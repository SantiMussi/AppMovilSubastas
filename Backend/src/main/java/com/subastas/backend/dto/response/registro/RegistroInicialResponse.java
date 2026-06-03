package com.subastas.backend.dto.response.registro;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegistroInicialResponse {
    private String message;
    private Integer clientId;
    private String status;
}