package com.subastas.backend.controller;

import com.subastas.backend.dto.response.producto.DetalleProductoResponse;
import com.subastas.backend.dto.response.producto.FotosProductoResponse;
import com.subastas.backend.entity.Foto;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.FotoRepository;
import com.subastas.backend.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productService;
    private final FotoRepository fotoRepository;

    @GetMapping("/{productId}")
    public ResponseEntity<DetalleProductoResponse> obtenerDetalle(@PathVariable Integer productId) {
        return ResponseEntity.ok(productService.obtenerDetalle(productId));
    }

    @GetMapping("/{productId}/photos")
    public ResponseEntity<FotosProductoResponse> obtenerFotos(@PathVariable Integer productId) {
        return ResponseEntity.ok(productService.obtenerFotos(productId));
    }

    @GetMapping("/photos/{photoId}/content")
    public ResponseEntity<byte[]> obtenerContenidoFoto(@PathVariable Integer photoId) {
        Foto foto = fotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Foto no encontrada con id: " + photoId));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(foto.getFoto());
    }
}