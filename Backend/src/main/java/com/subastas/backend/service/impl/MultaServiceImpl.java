package com.subastas.backend.service.impl;

import com.subastas.backend.dto.request.PagoMultaRequest;
import com.subastas.backend.dto.response.MultaResponse;
import com.subastas.backend.dto.response.PagoMultaResponse;
import com.subastas.backend.dto.response.SubastaResponse;
import com.subastas.backend.entity.*;
import com.subastas.backend.exception.MultaVencidaException;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.MedioPagoRepository;
import com.subastas.backend.repository.MultaRepository;
import com.subastas.backend.repository.UsuarioRepository;
import com.subastas.backend.service.MultaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MultaServiceImpl implements MultaService {

    private final UsuarioRepository usuarioRepository;
    private final MultaRepository multaRepository;
    private final MedioPagoRepository medioPagoRepository;


    @Override
    public List<MultaResponse> obtenerMultasPorUsuario(String email) {
        if (!usuarioRepository.findByEmail(email).isPresent()) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        Integer idUsuario = obtenerUsuarioPorEmail(email).getIdentificador();
        return multaRepository.findByUsuarioIdentificador(idUsuario).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public MultaResponse obtenerMultaPorId(Integer multaId) {
        return multaRepository.findById(multaId).map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Multa no existente"));
    }

    private Usuario obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
    }

    @Override
    public PagoMultaResponse pagarMulta(PagoMultaRequest r, Integer idMulta, String email) throws MultaVencidaException {
        Usuario u = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        MedioPago mp = medioPagoRepository.findById(r.getMedioPago())
                .orElseThrow(() -> new ResourceNotFoundException("Medio Pago no encontrado"));
        Multa m = multaRepository.findById(idMulta)
                .orElseThrow(() -> new ResourceNotFoundException("Multa no existente"));
        if (LocalDateTime.now().isAfter(m.getFechaLimite())){
            m.setEstado("vencida");
            multaRepository.save(m);
            throw new MultaVencidaException();
        }
        m.setEstado("paga");
        m.setFechaPago(LocalDateTime.now());
        multaRepository.save(m);
        PagoMultaResponse response = new PagoMultaResponse();
        response.setMultaId(idMulta);
        response.setMoneda(m.getMoneda());
        response.setMensaje("Pago de multa exitoso");
        response.setFechaPago(LocalDateTime.now());
        response.setMontoPagado(m.getMontoMulta());
        response.setMedioPagoId(mp.getIdentificador());
        return response;
    }

    private MultaResponse toResponse(Multa multa) {
        Subasta s = multa.getSubasta();

        SubastaResponse subastaResponse = new SubastaResponse();
        subastaResponse.setIdentificador(s.getIdentificador());
        subastaResponse.setCategoria(s.getCategoria());
        subastaResponse.setHora(s.getHora());
        subastaResponse.setFecha(s.getFecha());
        subastaResponse.setUbicacion(s.getUbicacion());
        subastaResponse.setEstado(s.getEstado());

        Producto producto = multa.getPujo().getItem().getProducto();

        subastaResponse.setProductoId(producto.getIdentificador());

        return MultaResponse.builder()
                .identificador(multa.getIdentificador())
                .estado(multa.getEstado())
                .moneda(multa.getMoneda())
                .fechaEmision(multa.getFechaEmision())
                .fechaLimite(multa.getFechaLimite())
                .fechaPago(multa.getFechaPago())
                .monto(multa.getMontoMulta())
                .subasta(subastaResponse)
                .descProducto(producto.getDescripcionCompleta())
                .build();
    }
}
