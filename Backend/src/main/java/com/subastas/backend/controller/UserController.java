package com.subastas.backend.controller;

import com.subastas.backend.dto.request.AumentarSeguroRequest;
import com.subastas.backend.dto.request.PagoMultaRequest;
import com.subastas.backend.dto.response.PerfilResponse;
import com.subastas.backend.dto.response.multa.MultaListResponse;
import com.subastas.backend.dto.response.multa.MultaResponse;
import com.subastas.backend.dto.response.multa.PagoMultaResponse;
import com.subastas.backend.dto.response.producto.AumentoSeguroResponse;
import com.subastas.backend.dto.response.producto.SeguroConsignedItemResponse;
import com.subastas.backend.dto.response.producto.UbicacionProductoResponse;
import com.subastas.backend.exception.MultaVencidaException;
import com.subastas.backend.service.MultaService;
import com.subastas.backend.service.PersonaService;
import com.subastas.backend.service.ProductoService;
import com.subastas.backend.dto.response.metrics.*;
import jakarta.validation.Valid;
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
    @Autowired
    private ProductoService productoService;

    @GetMapping
    public ResponseEntity<PerfilResponse> getProfile(Principal principal) {
        String email = principal.getName();
        return ResponseEntity.ok(personaService.obtenerPerfil(email));
    }

    @PatchMapping
    public ResponseEntity<PerfilResponse> updateProfile(java.security.Principal principal,
            @RequestBody com.subastas.backend.dto.request.PerfilRequest request) {
        String email = principal.getName();
        return ResponseEntity.ok(personaService.actualizarPerfil(email, request));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(Principal principal) {
        personaService.eliminarCuenta(principal.getName());
        return ResponseEntity.noContent().build();
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
            e.printStackTrace();
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

    @GetMapping("/consigned-items/{productId}/insurance")
    public ResponseEntity<SeguroConsignedItemResponse> getConsignedItemInsurance(
            Principal principal,
            @PathVariable Integer productId) {
        return ResponseEntity.ok(productoService.obtenerSeguroProductoConsignado(productId, principal.getName()));
    }

    @PatchMapping("/consigned-items/{productId}/insurance")
    public ResponseEntity<AumentoSeguroResponse> requestInsuranceIncrease(
            Principal principal,
            @PathVariable Integer productId,
            @Valid @RequestBody AumentarSeguroRequest request) {
        return ResponseEntity.ok(productoService.solicitarAumentoSeguro(productId, request, principal.getName()));
    }

    @GetMapping("/consigned-items/{productId}/location")
    public ResponseEntity<UbicacionProductoResponse> getConsignedItemLocation(
            Principal principal,
            @PathVariable Integer productId) {
        return ResponseEntity.ok(productoService.obtenerUbicacionProductoConsignado(productId, principal.getName()));
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsResponse> getUserStats(Principal principal) {
        return ResponseEntity.ok(personaService.obtenerStatsUsuario(principal.getName()));
    }

    @GetMapping("/collection")
    public ResponseEntity<UserCollectionResponse> getUserCollection(Principal principal) {
        return ResponseEntity.ok(personaService.obtenerColeccionUsuario(principal.getName()));
    }

    @GetMapping("/wins")
    public ResponseEntity<UserWinsResponse> getUserWins(Principal principal) {
        return ResponseEntity.ok(personaService.obtenerWinsUsuario(principal.getName()));
    }

    @GetMapping("/bids/history")
    public ResponseEntity<UserBidsResponse> getUserBidsHistory(Principal principal) {
        return ResponseEntity.ok(personaService.obtenerBidsHistory(principal.getName()));
    }
}
