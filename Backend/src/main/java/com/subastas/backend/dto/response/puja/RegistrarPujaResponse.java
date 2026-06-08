package com.subastas.backend.dto.response.puja;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class RegistrarPujaResponse {
    private String message;
    private PujaCreadaResponse bid;
    private BigDecimal currentTopBid;
}