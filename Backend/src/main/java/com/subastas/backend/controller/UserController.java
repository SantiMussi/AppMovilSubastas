package com.subastas.backend.controller;

import com.subastas.backend.dto.response.PerfilResponse;
import com.subastas.backend.entity.Persona;
import com.subastas.backend.service.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private PersonaService personaService;

    // GET /api/user/profile?email=example@example.com
    @GetMapping("/profile")
    public ResponseEntity<PerfilResponse> getProfile(java.security.Principal principal) {
        String email = principal.getName(); // Esto viene del JWT
        return ResponseEntity.ok(personaService.obtenerPerfil(email));
    }

    // PUT /api/user/profile?email=example@example.com
    @PutMapping("/profile")
    public ResponseEntity<Persona> updateProfile(java.security.Principal principal, @RequestBody Persona persona) {
        String email = principal.getName();
        return ResponseEntity.ok(personaService.actualizarPerfil(email, persona));
    }

    @PostMapping(value = "/profile/foto", consumes = "multipart/form-data")
    public ResponseEntity<String> subirFotoPerfil(
            java.security.Principal principal,
            @RequestParam("imagen") MultipartFile imagen) {
        try {
            String email = principal.getName();
            personaService.actualizarFotoPerfil(email, imagen);
            return ResponseEntity.ok("Imagen procesada y guardada con éxito");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error inesperado al subir la imagen");
        }
    }

}