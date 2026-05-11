package com.subastas.backend.service.impl;

import com.subastas.backend.entity.Catalogo;
import com.subastas.backend.entity.ItemCatalogo;
import com.subastas.backend.repository.CatalogoRepository;
import com.subastas.backend.repository.ItemCatalogoRepository;
import com.subastas.backend.service.CatalogoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CatalogoServiceImpl implements CatalogoService {

    @Autowired
    private CatalogoRepository catalogoRepository;

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Override
    public List<Catalogo> obtenerPorSubasta(Integer idSubasta) {
        return catalogoRepository.findBySubastaIdentificador(idSubasta);
    }

    @Override
    public List<ItemCatalogo> obtenerItemsPorCatalogo(Integer idCatalogo) {
        return itemCatalogoRepository.findByCatalogoIdentificador(idCatalogo);
    }
}