package com.subastas.backend.event;

public record LoteCerradoEvent(
        Integer auctionId,
        Integer closedItemId,
        Integer nextItemId   // null si era el último lote
) {}