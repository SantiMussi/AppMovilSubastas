package com.subastas.backend.service;

import com.subastas.backend.dto.response.AuctionItemDetailResponse;
import com.subastas.backend.dto.response.BidHistoryResponse;
import com.subastas.backend.dto.response.TopBidResponse;

public interface AuctionItemService {
    AuctionItemDetailResponse obtenerDetalle(Integer auctionItemId);

    TopBidResponse obtenerMejorPuja(Integer auctionItemId);

    BidHistoryResponse obtenerHistorialPujas(Integer auctionItemId, int page, int size);
}