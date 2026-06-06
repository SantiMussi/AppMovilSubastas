package com.subastas.backend.service;

import com.subastas.backend.dto.response.catalogo.ItemCatalogoResponse;
import com.subastas.backend.dto.response.catalogo.CatalogoResponse;

import java.util.List;

public interface CatalogoService {
    List<CatalogoResponse> obtenerPorSubasta(Integer idSubasta);
    List<ItemCatalogoResponse> obtenerItemsPorCatalogo(Integer idCatalogo);
}