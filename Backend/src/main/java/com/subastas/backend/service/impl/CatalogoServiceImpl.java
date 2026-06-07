package com.subastas.backend.service.impl;

import com.subastas.backend.entity.Catalogo;
import com.subastas.backend.entity.ItemCatalogo;
import com.subastas.backend.dto.response.catalogo.CatalogoResponse;
import com.subastas.backend.dto.response.catalogo.ItemCatalogoResponse;
import com.subastas.backend.dto.response.producto.ProductoResponse;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.CatalogoRepository;
import com.subastas.backend.repository.ItemCatalogoRepository;
import com.subastas.backend.service.CatalogoService;
import com.subastas.backend.service.FotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogoServiceImpl implements CatalogoService {

    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final FotoService fotoService;

    @Override
    public List<CatalogoResponse> obtenerPorSubasta(Integer idSubasta) {
        return catalogoRepository.findBySubastaIdentificador(idSubasta).stream()
                .map(this::toCatalogoResponse)
                .collect(Collectors.toList());
    }

    private CatalogoResponse toCatalogoResponse(Catalogo catalogo) {
        CatalogoResponse response = new CatalogoResponse();
        response.setIdentificador(catalogo.getIdentificador());
        response.setDescripcion(catalogo.getDescripcion());
        return response;
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

        Set<Integer> productIds = items.stream()
                .map(ItemCatalogo::getProducto)
                .filter(Objects::nonNull)
                .map(producto -> producto.getIdentificador())
                .collect(Collectors.toSet());
        Map<Integer, String> firstPhotoUrls = fotoService.obtenerUrlsPrimerasFotos(productIds);

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
                
                productoResp.setNombre(item.getProducto().getDescripcionCatalogo());
                productoResp.setImageUrl(firstPhotoUrls.get(item.getProducto().getIdentificador()));

                response.setProducto(productoResp);
            }

            return response;
        }).collect(Collectors.toList());
    }
}