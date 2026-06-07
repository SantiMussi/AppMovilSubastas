package com.subastas.backend.service;

import com.subastas.backend.entity.Pujo;

import java.math.BigDecimal;

public interface PujaService {
    Pujo realizarPuja(Integer auctionItemId, String userEmail, BigDecimal amount);
}
