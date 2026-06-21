package com.subastas.backend.controller;

import com.subastas.backend.entity.RegistroDeSubasta;
import com.subastas.backend.entity.Usuario;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.RegistroDeSubastaRepository;
import com.subastas.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/sales")
public class VentaController {

    private final RegistroDeSubastaRepository registroDeSubastaRepository;
    private final UsuarioRepository usuarioRepository;
    private final com.subastas.backend.service.EmailService emailService;

    @GetMapping("/{saleId}/invoice")
    public ResponseEntity<Map<String, Object>> getInvoice(@PathVariable Integer saleId, Principal principal) {
        RegistroDeSubasta sale = getOwnedSale(saleId, principal);
        return ResponseEntity.ok(buildInvoice(sale));
    }

    @PostMapping("/{saleId}/checkout")
    public ResponseEntity<Map<String, Object>> checkout(
            @PathVariable Integer saleId,
            @RequestBody(required = false) Map<String, Object> request,
            Principal principal) {
        RegistroDeSubasta sale = getOwnedSale(saleId, principal);
        Map<String, Object> invoice = buildInvoice(sale);
        invoice.put("message", "Compra finalizada correctamente");
        invoice.put("invoiceNumber", "FAC-" + sale.getIdentificador());
        
        emailService.sendInvoiceEmail(principal.getName(), invoice, sale);
        
        return ResponseEntity.ok(invoice);
    }

    private RegistroDeSubasta getOwnedSale(Integer saleId, Principal principal) {
        Usuario usuario = usuarioRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Integer clienteId = usuario.getPersona().getIdentificador();
        RegistroDeSubasta sale = registroDeSubastaRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada"));
        if (sale.getCliente() == null || !clienteId.equals(sale.getCliente().getIdentificador())) {
            throw new ResourceNotFoundException("Venta no encontrada");
        }
        return sale;
    }

    private Map<String, Object> buildInvoice(RegistroDeSubasta sale) {
        BigDecimal amount = sale.getImporte() != null ? sale.getImporte() : BigDecimal.ZERO;
        BigDecimal commission = sale.getComision() != null ? sale.getComision() : BigDecimal.ZERO;
        return new java.util.LinkedHashMap<>(Map.of(
                "saleId", sale.getIdentificador(),
                "montoPujado", amount,
                "comision", commission,
                "total", amount.add(commission)
        ));
    }
}