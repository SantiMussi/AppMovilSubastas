package com.subastas.backend.controller;

import com.subastas.backend.dto.request.CrearPropuestaRequest;
import com.subastas.backend.dto.request.SolicitarDevolucionRequest;
import com.subastas.backend.dto.request.TerminosPropuestaRequest;
import com.subastas.backend.dto.response.propuesta.CrearPropuestaResponse;
import com.subastas.backend.dto.response.propuesta.DetallePropuestaResponse;
import com.subastas.backend.dto.response.propuesta.ListaPropuestaResponse;
import com.subastas.backend.dto.response.propuesta.TerminosPropuestaResponse;
import com.subastas.backend.service.PropuestaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class PropuestaController {

    private final PropuestaService proposalService;

    @PostMapping("/proposals")
    public ResponseEntity<CrearPropuestaResponse> create(@Valid @RequestBody CrearPropuestaRequest request, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(proposalService.create(request, principal.getName()));
    }

    @GetMapping("/users/me/proposals")
    public ResponseEntity<ListaPropuestaResponse> mine(Principal principal) {
        return ResponseEntity.ok(proposalService.listMine(principal.getName()));
    }

    @GetMapping("/proposals/{proposalId}")
    public ResponseEntity<DetallePropuestaResponse> detail(@PathVariable Integer proposalId, Principal principal) {
        return ResponseEntity.ok(proposalService.getMine(proposalId, principal.getName()));
    }

    @PatchMapping("/proposals/{proposalId}/terms")
    public ResponseEntity<TerminosPropuestaResponse> terms(@PathVariable Integer proposalId,
                                                            @Valid @RequestBody TerminosPropuestaRequest request,
                                                            Principal principal) {
        return ResponseEntity.ok(proposalService.respondTerms(proposalId, request, principal.getName()));
    }

    @GetMapping("/sales/me/proposals/{proposalId}")
    public ResponseEntity<DetallePropuestaResponse> saleResult(@PathVariable Integer proposalId, Principal principal) {
        return ResponseEntity.ok(proposalService.getMine(proposalId, principal.getName()));
    }

    @GetMapping("/proposals/{proposalId}/photos")
    public List<String> photos(@PathVariable Integer proposalId, Principal principal) {
        return proposalService.getPhotos(proposalId, principal.getName());
    }

    @PatchMapping("/proposals/{proposalId}/return")
    public ResponseEntity<TerminosPropuestaResponse> solicitarDevolucion(@PathVariable Integer proposalId,
                                                                        @Valid @RequestBody SolicitarDevolucionRequest request,
                                                                        Principal principal) {
        return ResponseEntity.ok(proposalService.solicitarDevolucion(proposalId, request, principal.getName()));
    }
}