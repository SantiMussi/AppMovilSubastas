package com.subastas.backend.service.impl;

import com.subastas.backend.dto.response.MultaResponse;
import com.subastas.backend.dto.response.SubastaResponse;
import com.subastas.backend.entity.*;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.MultaRepository;
import com.subastas.backend.repository.UsuarioRepository;
import com.subastas.backend.service.MultaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MultaServiceImpl implements MultaService {

    private final UsuarioRepository usuarioRepository;
    private final MultaRepository multaRepository;

    @Override
    public List<MultaResponse> obtenerMultasPorUsuario(String email) {
        if (!usuarioRepository.findByEmail(email).isPresent()) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        Integer idPersona = obtenerUsuarioPorEmail(email).getPersona().getIdentificador();
        return multaRepository.findByUsuarioIdentificador(idPersona).stream().map(this::toResponse).collect(Collectors.toList());
    }

    private Usuario obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
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

        subastaResponse.setProducto(producto);

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
