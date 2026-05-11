package com.subastas.backend.service;

import com.subastas.backend.entity.Catalogo;
import com.subastas.backend.entity.ItemCatalogo;
import java.util.List;

public interface CatalogoService {
    List<Catalogo> obtenerPorSubasta(Integer idSubasta);
    List<ItemCatalogo> obtenerItemsPorCatalogo(Integer idCatalogo);
}