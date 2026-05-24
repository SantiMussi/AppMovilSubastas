package com.subastas.backend.service;

import com.subastas.backend.dto.response.catalogo.ItemCatalogoResponse;
import com.subastas.backend.entity.Catalogo;

import java.util.List;

public interface CatalogoService {
    List<Catalogo> obtenerPorSubasta(Integer idSubasta);
    List<ItemCatalogoResponse> obtenerItemsPorCatalogo(Integer idCatalogo);
}