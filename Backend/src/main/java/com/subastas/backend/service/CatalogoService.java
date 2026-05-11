package com.subastas.backend.service;

import com.subastas.backend.entity.Catalogo;
import com.subastas.backend.dto.response.ItemCatalogoResponse;
import java.util.List;

public interface CatalogoService {
    List<Catalogo> obtenerPorSubasta(Integer idSubasta);
    List<ItemCatalogoResponse> obtenerItemsPorCatalogo(Integer idCatalogo);
}