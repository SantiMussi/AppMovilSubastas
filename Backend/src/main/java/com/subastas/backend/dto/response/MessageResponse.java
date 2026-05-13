package com.subastas.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
// respuesta de mensaje generica
@Data
@AllArgsConstructor
public class MessageResponse {
    private String message;
}