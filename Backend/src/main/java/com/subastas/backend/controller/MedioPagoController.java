package com.subastas.backend.controller;

import com.subastas.backend.dto.request.MedioPagoCreateRequest;
import com.subastas.backend.dto.request.MedioPagoUpdateRequest;
import com.subastas.backend.dto.response.MessageResponse;
import com.subastas.backend.dto.response.mediopago.MedioPagoCreatedResponse;
import com.subastas.backend.dto.response.mediopago.MedioPagoListResponse;
import com.subastas.backend.dto.response.mediopago.MedioPagoResponse;
import com.subastas.backend.service.MedioPagoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/users/me/payments")
@RequiredArgsConstructor
public class MedioPagoController {

    private final MedioPagoService medioPagoService;

    @GetMapping
    public ResponseEntity<MedioPagoListResponse> obtenerMediosDelUsuario(Principal principal) {
        return ResponseEntity.ok(new MedioPagoListResponse(
                medioPagoService.obtenerMediosDelUsuario(principal.getName())));
    }

    @PostMapping
    public ResponseEntity<MedioPagoCreatedResponse> registrarMedio(
            Principal principal,
            @Valid @RequestBody MedioPagoCreateRequest request) {
        MedioPagoResponse medioPago = medioPagoService.registrarMedio(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MedioPagoCreatedResponse("Medio de pago registrado correctamente", medioPago));
    }

    @PatchMapping("/{paymentId}")
    public ResponseEntity<MessageResponse> actualizarMedio(
            Principal principal,
            @PathVariable Integer paymentId,
            @Valid @RequestBody MedioPagoUpdateRequest request) {
        medioPagoService.actualizarMedio(principal.getName(), paymentId, request);
        return ResponseEntity.ok(new MessageResponse("Medio de pago actualizado correctamente"));
    }

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> darDeBajaMedio(Principal principal, @PathVariable Integer paymentId) {
        medioPagoService.darDeBajaMedio(principal.getName(), paymentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/verified")
    public ResponseEntity<MedioPagoListResponse> obtenerMediosVerificadosDelUsuario(Principal principal) {
        return ResponseEntity.ok(new MedioPagoListResponse(
                medioPagoService.obtenerMediosVerificadosDelUsuario(principal.getName())));
    }
}