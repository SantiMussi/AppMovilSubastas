package com.subastas.backend.event;

public record SubastaCerradaEvent(Integer auctionId, String status) {
}