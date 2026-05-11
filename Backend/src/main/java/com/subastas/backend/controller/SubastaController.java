package com.subastas.backend.controller;

import com.subastas.backend.entity.Subasta;
import com.subastas.backend.service.SubastaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subastas")
public class SubastaController {

    @Autowired
    private SubastaService subastaService;

    // Endpoint para administradores: ver todo
    @GetMapping
    public ResponseEntity<List<Subasta>> listarTodas() {
        return ResponseEntity.ok(subastaService.obtenerTodas());
    }

    // Endpoint para la App Móvil: ver solo las disponibles para pujar
    @GetMapping("/activas")
    public ResponseEntity<List<Subasta>> listarActivas() {
        return ResponseEntity.ok(subastaService.obtenerActivas());
    }

    // Endpoint para ver el detalle de una subasta específica al hacerle clic
    @GetMapping("/{id}")
    public ResponseEntity<Subasta> obtenerDetalle(@PathVariable Integer id) {
        return ResponseEntity.ok(subastaService.obtenerPorId(id));
    }
}