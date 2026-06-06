package com.subastas.backend.service;

import com.subastas.backend.dto.request.AumentarSeguroRequest;
import com.subastas.backend.dto.response.producto.*;

public interface ProductoService {
    DetalleProductoResponse obtenerDetalle(Integer productId);

    FotosProductoResponse obtenerFotos(Integer productId);

    SeguroConsignedItemResponse obtenerSeguroProductoConsignado(Integer productId, String email);

    AumentoSeguroResponse solicitarAumentoSeguro(Integer productId, AumentarSeguroRequest request, String email);

    UbicacionProductoResponse obtenerUbicacionProductoConsignado(Integer productId, String email);
}