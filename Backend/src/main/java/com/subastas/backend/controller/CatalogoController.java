package com.subastas.backend.controller;

import com.subastas.backend.dto.response.catalogo.ItemCatalogoResponse;
import com.subastas.backend.dto.response.catalogo.CatalogoResponse;
import com.subastas.backend.service.CatalogoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CatalogoController {

    @Autowired
    private CatalogoService catalogoService;

    // Obtener los catálogos de una subasta específica
    @GetMapping("/auctions/{idSubasta}/catalog")
    public ResponseEntity<List<CatalogoResponse>> obtenerCatalogosDeSubasta(@PathVariable Integer idSubasta) {
        List<CatalogoResponse> catalogos = catalogoService.obtenerPorSubasta(idSubasta);
        if (catalogos.isEmpty()) {
            return ResponseEntity.noContent().build(); // Devuelve 204 si la subasta todavía no tiene catálogos
        }
        return ResponseEntity.ok(catalogos);
    }

    // Obtener los productos (ítems) dentro de un catálogo
    @GetMapping("/catalogs/{idCatalogo}/items")
    public ResponseEntity<List<ItemCatalogoResponse>> obtenerItemsDeCatalogo(@PathVariable Integer idCatalogo) {
        List<ItemCatalogoResponse> items = catalogoService.obtenerItemsPorCatalogo(idCatalogo);
        if (items.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(items);
    }
}