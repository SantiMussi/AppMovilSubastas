package com.subastas.backend.dto.response.propuesta;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ListaPropuestaResponse {
    private List<ItemListaPropuestaResponse> items;
}