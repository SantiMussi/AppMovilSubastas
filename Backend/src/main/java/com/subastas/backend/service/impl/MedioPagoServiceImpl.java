package com.subastas.backend.service.impl;

import com.subastas.backend.dto.request.MedioPagoCreateRequest;
import com.subastas.backend.dto.request.MedioPagoUpdateRequest;
import com.subastas.backend.dto.response.mediopago.MedioPagoResponse;
import com.subastas.backend.entity.MedioPago;
import com.subastas.backend.entity.Persona;
import com.subastas.backend.entity.Usuario;
import com.subastas.backend.exception.ConflictException;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.MedioPagoRepository;
import com.subastas.backend.repository.UsuarioRepository;
import com.subastas.backend.service.MedioPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedioPagoServiceImpl implements MedioPagoService {

    private final MedioPagoRepository medioPagoRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MedioPagoResponse> obtenerMediosDelUsuario(String email) {
        Persona persona = obtenerUsuarioPorEmail(email).getPersona();
        return medioPagoRepository.findByPersonaAndActivoTrue(persona).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public MedioPagoResponse registrarMedio(String email, MedioPagoCreateRequest request) {
        Persona persona = obtenerUsuarioPorEmail(email).getPersona();
        MedioPago medioPago = MedioPago.builder()
                .persona(persona)
                .tipo(normalizeRequired(request.getTipo()))
                .entidad(normalizeRequired(request.getEntidad()))
                .numeroIdentificacion(normalizeRequired(request.getNumeroIdentificacion()))
                .moneda(normalizeRequired(request.getMoneda()).toUpperCase())
                .montoGarantia(request.getMontoGarantia())
                .comprobante(trimToNull(request.getComprobante()))
                .verificado(false)
                .activo(true)
                .usadoEnOperacion(false)
                .build();

        return toResponse(medioPagoRepository.save(medioPago));
    }

    @Override
    @Transactional
    public void actualizarMedio(String email, Integer paymentId, MedioPagoUpdateRequest request) {
        MedioPago medioPago = obtenerMedioDelUsuario(email, paymentId);
        validarNoUsadoEnOperacion(medioPago);

        if (request.getTipo() != null) {
            medioPago.setTipo(normalizeRequired(request.getTipo()));
        }
        if (request.getEntidad() != null) {
            medioPago.setEntidad(normalizeRequired(request.getEntidad()));
        }
        if (request.getNumeroIdentificacion() != null) {
            medioPago.setNumeroIdentificacion(normalizeRequired(request.getNumeroIdentificacion()));
        }
        if (request.getMoneda() != null) {
            medioPago.setMoneda(normalizeRequired(request.getMoneda()).toUpperCase());
        }
        if (request.getMontoGarantia() != null) {
            medioPago.setMontoGarantia(request.getMontoGarantia());
        }
        if (request.getComprobante() != null) {
            medioPago.setComprobante(trimToNull(request.getComprobante()));
        }
        if (request.getActivo() != null) {
            medioPago.setActivo(request.getActivo());
        }

        medioPago.setVerificado(false);
        medioPagoRepository.save(medioPago);
    }

    @Override
    @Transactional
    public void darDeBajaMedio(String email, Integer paymentId) {
        MedioPago medioPago = obtenerMedioDelUsuario(email, paymentId);
        validarNoUsadoEnOperacion(medioPago);
        medioPago.setActivo(false);
        medioPagoRepository.save(medioPago);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedioPagoResponse> obtenerMediosVerificadosDelUsuario(String email) {
        Persona persona = obtenerUsuarioPorEmail(email).getPersona();
        return medioPagoRepository.findByPersonaAndActivoTrueAndVerificadoTrue(persona).stream()
                .map(this::toResponse)
                .toList();
    }

    private MedioPago obtenerMedioDelUsuario(String email, Integer paymentId) {
        Persona persona = obtenerUsuarioPorEmail(email).getPersona();
        return medioPagoRepository.findById(paymentId)
                .filter(medioPago -> medioPago.getPersona().getIdentificador().equals(persona.getIdentificador()))
                .orElseThrow(() -> new ResourceNotFoundException("Medio de pago no encontrado con ID: " + paymentId));
    }

    private Usuario obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
    }

    private void validarNoUsadoEnOperacion(MedioPago medioPago) {
        if (Boolean.TRUE.equals(medioPago.getUsadoEnOperacion())) {
            throw new ConflictException("El medio de pago ya fue usado en una operación");
        }
    }

    private MedioPagoResponse toResponse(MedioPago medioPago) {
        return MedioPagoResponse.builder()
                .id(medioPago.getIdentificador())
                .tipo(medioPago.getTipo())
                .entidad(medioPago.getEntidad())
                .numeroIdentificacion(maskNumeroIdentificacion(medioPago.getNumeroIdentificacion()))
                .moneda(medioPago.getMoneda())
                .montoGarantia(medioPago.getMontoGarantia())
                .comprobante(medioPago.getComprobante())
                .verificado(medioPago.getVerificado())
                .activo(medioPago.getActivo())
                .build();
    }

    private String maskNumeroIdentificacion(String numeroIdentificacion) {
        if (numeroIdentificacion == null || numeroIdentificacion.length() <= 4) {
            return numeroIdentificacion;
        }
        String lastDigits = numeroIdentificacion.substring(numeroIdentificacion.length() - 4);
        return "**** **** **** " + lastDigits;
    }

    private String normalizeRequired(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Los campos obligatorios no pueden estar vacíos");
        }
        return value.trim();
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
