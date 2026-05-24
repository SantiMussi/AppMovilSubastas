package com.subastas.backend.service.impl;

import com.subastas.backend.entity.Catalogo;
import com.subastas.backend.entity.ItemCatalogo;
import com.subastas.backend.dto.response.catalogo.ItemCatalogoResponse;
import com.subastas.backend.dto.response.producto.ProductoResponse;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.CatalogoRepository;
import com.subastas.backend.repository.ItemCatalogoRepository;
import com.subastas.backend.service.CatalogoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

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
    public List<ItemCatalogoResponse> obtenerItemsPorCatalogo(Integer idCatalogo) {
        if (!catalogoRepository.existsById(idCatalogo)) {
            throw new ResourceNotFoundException("Catálogo no encontrado con id: " + idCatalogo);
        }

        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoIdentificador(idCatalogo);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("No se encontraron ítems para el catálogo con id: " + idCatalogo);
        }

        return items.stream().map(item -> {
            ItemCatalogoResponse response = new ItemCatalogoResponse();
            response.setIdentificador(item.getIdentificador());
            response.setPrecioBase(item.getPrecioBase());
            response.setComision(item.getComision());
            response.setSubastado(item.getSubastado());

            if (item.getProducto() != null) {
                ProductoResponse productoResp = new ProductoResponse();
                productoResp.setIdentificador(item.getProducto().getIdentificador());
                productoResp.setDescripcionCatalogo(item.getProducto().getDescripcionCatalogo());
                productoResp.setDescripcionCompleta(item.getProducto().getDescripcionCompleta());
                
                // Mapeo adicional para nombre y foto
                productoResp.setNombre(item.getProducto().getDescripcionCatalogo()); // Usamos descripcionCatalogo como nombre
                if (item.getProducto().getFotos() != null && !item.getProducto().getFotos().isEmpty()) {
                    productoResp.setFoto(item.getProducto().getFotos().get(0).getFoto());
                }

                response.setProducto(productoResp);
            }

            return response;
        }).collect(Collectors.toList());
    }
}