package com.subastas.backend.controller;

import com.subastas.backend.dto.request.CrearPujaRequest;
import com.subastas.backend.dto.response.puja.HistorialPujaResponse;
import com.subastas.backend.dto.response.puja.PujaCreadaResponse;
import com.subastas.backend.dto.response.puja.RegistrarPujaResponse;
import com.subastas.backend.dto.response.puja.TopPujaResponse;
import com.subastas.backend.dto.response.subasta.DetalleItemSubastaResponse;
import com.subastas.backend.entity.Pujo;
import com.subastas.backend.service.ItemSubastaService;
import com.subastas.backend.service.PujaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/auction-items")
@RequiredArgsConstructor
public class ItemSubastaController {

    private final ItemSubastaService auctionItemService;
    private final PujaService pujaService;

    @GetMapping("/{auctionItemId}")
    public ResponseEntity<DetalleItemSubastaResponse> obtenerDetalle(@PathVariable Integer auctionItemId) {
        return ResponseEntity.ok(auctionItemService.obtenerDetalle(auctionItemId));
    }

    @GetMapping("/{auctionItemId}/top-bid")
    public ResponseEntity<TopPujaResponse> obtenerMejorPuja(@PathVariable Integer auctionItemId) {
        return ResponseEntity.ok(auctionItemService.obtenerMejorPuja(auctionItemId));
    }

    @PostMapping("/{auctionItemId}/bids")
    public ResponseEntity<RegistrarPujaResponse> registrarPuja(
            Principal principal,
            @PathVariable Integer auctionItemId,
            @Valid @RequestBody CrearPujaRequest request) {
        Pujo bid = pujaService.realizarPuja(
                auctionItemId,
                principal.getName(),
                request.getAmount(),
                request.getPaymentMethodId());
        PujaCreadaResponse createdBid = new PujaCreadaResponse(
                bid.getIdentificador(),
                auctionItemId,
                bid.getImporte(),
                true,
                LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(new RegistrarPujaResponse(
                "Puja registrada correctamente",
                createdBid,
                bid.getImporte()));
    }

    @GetMapping("/{auctionItemId}/bids")
    public ResponseEntity<HistorialPujaResponse> obtenerHistorialPujas(
            @PathVariable Integer auctionItemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auctionItemService.obtenerHistorialPujas(auctionItemId, page, size));
    }
}