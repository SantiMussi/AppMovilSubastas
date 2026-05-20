package com.subastas.backend.controller;

import com.subastas.backend.dto.request.PagoMultaRequest;
import com.subastas.backend.dto.response.MultaListResponse;
import com.subastas.backend.dto.response.MultaResponse;
import com.subastas.backend.dto.response.PagoMultaResponse;
import com.subastas.backend.dto.response.PerfilResponse;
import com.subastas.backend.exception.MultaVencidaException;
import com.subastas.backend.service.MultaService;
import com.subastas.backend.service.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/users/me")
public class UserController {

    @Autowired
    private PersonaService personaService;
    @Autowired
    private MultaService multaService;

    // GET /api/v1/users/me
    @GetMapping
    public ResponseEntity<PerfilResponse> getProfile(Principal principal) {
        String email = principal.getName(); // Esto viene del JWT
        return ResponseEntity.ok(personaService.obtenerPerfil(email));
    }

    // PATCH /api/v1/users/me
    @PatchMapping
    public ResponseEntity<PerfilResponse> updateProfile(java.security.Principal principal,
            @RequestBody com.subastas.backend.dto.request.PerfilRequest request) {
        String email = principal.getName();
        return ResponseEntity.ok(personaService.actualizarPerfil(email, request));
    }

    @PostMapping(value = "/foto", consumes = "multipart/form-data")
    public ResponseEntity<String> subirFotoPerfil(
            java.security.Principal principal,
            @RequestParam("imagen") MultipartFile imagen) {
        try {
            String email = principal.getName();
            personaService.actualizarFotoPerfil(email, imagen);
            return ResponseEntity.ok("Imagen procesada y guardada con éxito");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error de validación: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // Imprimir en la consola para debugging
            return ResponseEntity.internalServerError()
                    .body("Error al subir la imagen: " + e.getClass().getName() + " - " + e.getMessage());
        }
    }

    @GetMapping("/fines")
    public ResponseEntity<MultaListResponse> getUserFines(Principal principal){
        return ResponseEntity.ok(new MultaListResponse(multaService.obtenerMultasPorUsuario(principal.getName())));
    }

    @GetMapping("/fines/{fineId}")
    public ResponseEntity<MultaResponse> getUserFineDetail(@PathVariable Integer fineId){
        return ResponseEntity.ok(multaService.obtenerMultaPorId(fineId));
    }

    @PostMapping("/fines/{fineId}/pay")
    public ResponseEntity<PagoMultaResponse> payFine(
            Principal principal,
            @RequestBody PagoMultaRequest request,
            @PathVariable Integer fineId) throws MultaVencidaException{
            return ResponseEntity.ok(multaService.pagarMulta(request, fineId, principal.getName()));
        }
}
