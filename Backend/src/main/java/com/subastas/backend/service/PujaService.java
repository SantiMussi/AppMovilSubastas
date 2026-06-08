package com.subastas.backend.service;

import com.subastas.backend.entity.Pujo;

import java.math.BigDecimal;

public interface PujaService {
    void registrarAsistenteSiPuedePujar(Integer auctionItemId, String userEmail);

    Pujo realizarPuja(Integer auctionItemId, String userEmail, BigDecimal amount, Integer paymentMethodId);
}
