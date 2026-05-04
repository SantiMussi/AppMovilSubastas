package com.subastas.backend.controller;

import com.subastas.backend.entity.Pais;
import com.subastas.backend.service.PaisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paises")
@RequiredArgsConstructor
public class PaisController {

    private final PaisService paisService;

    @GetMapping
    public List<Pais> getAll() {
        return paisService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pais> getById(@PathVariable Integer id) {
        Pais pais = paisService.getById(id);
        return pais != null ? ResponseEntity.ok(pais) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Pais create(@RequestBody Pais pais) {
        return paisService.save(pais);
    }
}
