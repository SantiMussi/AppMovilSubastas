package com.subastas.backend.controller;

import com.subastas.backend.entity.Catalogo;
import com.subastas.backend.entity.ItemCatalogo;
import com.subastas.backend.service.CatalogoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/catalogos")
public class CatalogoController {

    @Autowired
    private CatalogoService catalogoService;

    // Obtener los catálogos de una subasta específica
    @GetMapping("/subasta/{idSubasta}")
    public ResponseEntity<List<Catalogo>> obtenerCatalogosDeSubasta(@PathVariable Integer idSubasta) {
        List<Catalogo> catalogos = catalogoService.obtenerPorSubasta(idSubasta);
        if (catalogos.isEmpty()) {
            return ResponseEntity.noContent().build(); // Devuelve 204 si la subasta todavía no tiene catálogos
        }
        return ResponseEntity.ok(catalogos);
    }

    // Obtener los productos (ítems) dentro de un catálogo
    @GetMapping("/{idCatalogo}/items")
    public ResponseEntity<List<ItemCatalogo>> obtenerItemsDeCatalogo(@PathVariable Integer idCatalogo) {
        List<ItemCatalogo> items = catalogoService.obtenerItemsPorCatalogo(idCatalogo);
        if (items.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(items);
    }
}