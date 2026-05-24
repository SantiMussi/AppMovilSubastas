package com.subastas.backend.service;

import com.subastas.backend.dto.response.puja.HistorialPujaResponse;
import com.subastas.backend.dto.response.puja.TopPujaResponse;
import com.subastas.backend.dto.response.subasta.DetalleItemSubastaResponse;

public interface ItemSubastaService {
    DetalleItemSubastaResponse obtenerDetalle(Integer auctionItemId);

    TopPujaResponse obtenerMejorPuja(Integer auctionItemId);

    HistorialPujaResponse obtenerHistorialPujas(Integer auctionItemId, int page, int size);
}