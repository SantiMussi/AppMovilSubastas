package com.subastas.backend.controller;

import com.subastas.backend.dto.response.puja.HistorialPujaResponse;
import com.subastas.backend.dto.response.puja.TopPujaResponse;
import com.subastas.backend.dto.response.subasta.DetalleItemSubastaResponse;
import com.subastas.backend.service.ItemSubastaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auction-items")
@RequiredArgsConstructor
public class ItemSubastaController {

    private final ItemSubastaService auctionItemService;

    @GetMapping("/{auctionItemId}")
    public ResponseEntity<DetalleItemSubastaResponse> obtenerDetalle(@PathVariable Integer auctionItemId) {
        return ResponseEntity.ok(auctionItemService.obtenerDetalle(auctionItemId));
    }

    @GetMapping("/{auctionItemId}/top-bid")
    public ResponseEntity<TopPujaResponse> obtenerMejorPuja(@PathVariable Integer auctionItemId) {
        return ResponseEntity.ok(auctionItemService.obtenerMejorPuja(auctionItemId));
    }

    @GetMapping("/{auctionItemId}/bids")
    public ResponseEntity<HistorialPujaResponse> obtenerHistorialPujas(
            @PathVariable Integer auctionItemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auctionItemService.obtenerHistorialPujas(auctionItemId, page, size));
    }
}