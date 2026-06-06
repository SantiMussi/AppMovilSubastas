package com.subastas.backend.controller;

import com.subastas.backend.entity.Subasta;
import com.subastas.backend.service.SubastaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/auctions")
public class SubastaController {

    @Autowired
    private SubastaService subastaService;

    @GetMapping
    public ResponseEntity<List<Subasta>> listarTodas() {
        return ResponseEntity.ok(subastaService.obtenerTodas());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Subasta>> listarActivas() {
        return ResponseEntity.ok(subastaService.obtenerActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subasta> obtenerDetalle(@PathVariable Integer id) {
        return ResponseEntity.ok(subastaService.obtenerPorId(id));
    }
}