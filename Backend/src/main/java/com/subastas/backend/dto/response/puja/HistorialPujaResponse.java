package com.subastas.backend.dto.response.puja;

import lombok.Data;

import java.util.List;

@Data
public class HistorialPujaResponse {
    private List<ItemHistorialPujaResponse> items;
}