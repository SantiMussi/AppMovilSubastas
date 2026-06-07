package com.subastas.backend.dto.response.puja;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PujaRechazadaResponse {
    private String type;
    private String code;
    private String message;
    private TopPujaResponse topBid;
}