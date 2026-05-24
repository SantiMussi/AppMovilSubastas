package com.subastas.backend.controller;

import com.subastas.backend.service.AdminService;
import com.subastas.backend.dto.response.*;
import com.subastas.backend.dto.request.*;
import com.subastas.backend.dto.response.MessageResponse;
import com.subastas.backend.util.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CurrentUser currentUser;


    //  SUBASTAS

    @PostMapping("/auctions")
    @ResponseStatus(HttpStatus.CREATED)
    public CrearSubastaResponse crearSubasta(@Valid @RequestBody CrearSubastaRequest req) {
        return adminService.crearSubasta(currentUser.obtenerEmpleadoId(), req);
    }


    @PostMapping("/auctions/{subastaId}/close")
    public CerrarSubastaResponse cerrarSubasta(@PathVariable Integer subastaId) {
        return adminService.cerrarSubasta(currentUser.obtenerEmpleadoId(), subastaId);
    }


    @PostMapping("/auction-items/{itemId}/settle")
    public AdjudicarItemResponse adjudicarItem(@PathVariable Integer itemId, @Valid @RequestBody AdjudicarItemRequest req) {
        return adminService.adjudicarItem(currentUser.obtenerEmpleadoId(), itemId, req);
    }


    //  USUARIOS

    @PatchMapping("/users/{usuarioId}/category")
    public MessageResponse cambiarCategoria(@PathVariable Integer usuarioId, @Valid @RequestBody CambiarCategoriaRequest req) {
        return adminService.cambiarCategoria(currentUser.obtenerEmpleadoId(), usuarioId, req);
    }


    //  MEDIOS DE PAGO

    @PostMapping("/payments/{pagoId}/verify")
    public MessageResponse verificarPago(@PathVariable Integer pagoId, @Valid @RequestBody VerificarPagoRequest req) {
        return adminService.verificarPago(currentUser.obtenerEmpleadoId(), pagoId, req);
    }


    //  PROPUESTAS

    @PostMapping("/proposals/{propuestaId}/review")
    public MessageResponse revisarPropuesta(@PathVariable Integer propuestaId, @Valid @RequestBody RevisarPropuestaRequest req) {
        return adminService.revisarPropuesta(currentUser.obtenerEmpleadoId(), propuestaId, req);
    }


    // MULTAS

    @PostMapping("/fines")
    @ResponseStatus(HttpStatus.CREATED)
    public CrearMultaResponse crearMulta(@Valid @RequestBody CrearMultaRequest req) {
        return adminService.crearMulta(currentUser.obtenerEmpleadoId(), req);
    }
}
