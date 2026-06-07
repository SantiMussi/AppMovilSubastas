package com.subastas.backend.controller;

import com.subastas.backend.dto.response.producto.DetalleProductoResponse;
import com.subastas.backend.dto.response.producto.FotosProductoResponse;
import com.subastas.backend.entity.Foto;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.service.ProductoService;
import com.subastas.backend.service.FotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productService;
        private final FotoService fotoService;

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
        FotoService.ContenidoFoto foto = fotoService.obtenerContenido(photoId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(foto.contentType()))
                .contentLength(foto.bytes().length)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic().immutable())
                .eTag(foto.etag())
                .body(foto.bytes());
    }
}