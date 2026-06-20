package com.subastas.backend.controller;

import com.subastas.backend.dto.response.catalogo.ItemCatalogoResponse;
import com.subastas.backend.dto.response.catalogo.CatalogoResponse;
import com.subastas.backend.service.CatalogoService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CatalogoController {

    private final CatalogoService catalogoService;

    @GetMapping("/auctions/{idSubasta}/catalog")
    public ResponseEntity<List<CatalogoResponse>> obtenerCatalogosDeSubasta(@PathVariable Integer idSubasta) {
        List<CatalogoResponse> catalogos = catalogoService.obtenerPorSubasta(idSubasta);
        if (catalogos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(catalogos);
    }

    @GetMapping("/{idCatalogo}/items")
    public ResponseEntity<List<ItemCatalogoResponse>> obtenerItemsDeCatalogo(@PathVariable Integer idCatalogo) {
        List<ItemCatalogoResponse> items = catalogoService.obtenerItemsPorCatalogo(idCatalogo);
        if (items.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(items);
    }
}