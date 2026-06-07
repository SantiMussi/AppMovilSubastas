package com.subastas.backend.service;

import com.subastas.backend.dto.response.producto.ItemFotoProductoResponse;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface FotoService {

    List<ItemFotoProductoResponse> obtenerFotosProducto(Integer productId);

    Map<Integer, String> obtenerUrlsPrimerasFotos(Set<Integer> productIds);

    ContenidoFoto obtenerContenido(Integer photoId);

    record ContenidoFoto(byte[] bytes, String contentType, String etag) {
    }
}