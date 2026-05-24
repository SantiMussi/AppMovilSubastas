package com.subastas.backend.service;

import com.subastas.backend.dto.response.producto.DetalleProductoResponse;
import com.subastas.backend.dto.response.producto.FotosProductoResponse;

public interface ProductoService {
    DetalleProductoResponse obtenerDetalle(Integer productId);

    FotosProductoResponse obtenerFotos(Integer productId);
}