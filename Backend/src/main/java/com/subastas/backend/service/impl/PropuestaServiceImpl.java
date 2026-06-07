package com.subastas.backend.service.impl;

import com.subastas.backend.dto.request.CrearPropuestaRequest;
import com.subastas.backend.dto.request.TerminosPropuestaRequest;
import com.subastas.backend.dto.response.propuesta.CrearPropuestaResponse;
import com.subastas.backend.dto.response.propuesta.DetallePropuestaResponse;
import com.subastas.backend.dto.response.propuesta.ItemListaPropuestaResponse;
import com.subastas.backend.dto.response.propuesta.ListaPropuestaResponse;
import com.subastas.backend.dto.response.propuesta.TerminosPropuestaResponse;
import com.subastas.backend.entity.*;
import com.subastas.backend.exception.ConflictException;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.ClienteRepository;
import com.subastas.backend.repository.FotoPropuestaRepository;
import com.subastas.backend.repository.PropuestaRepository;
import com.subastas.backend.repository.UsuarioRepository;
import com.subastas.backend.service.PropuestaService;
import lombok.RequiredArgsConstructor;

import java.util.Base64;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PropuestaServiceImpl implements PropuestaService {
    private final PropuestaRepository propuestaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final FotoPropuestaRepository fotoPropuestaRepository;

    @Override
    @Transactional
    public CrearPropuestaResponse create(CrearPropuestaRequest request, String email) {
        if (request.getFotos() == null || request.getFotos().size() < 6) {
            throw new ResourceNotFoundException("400 (faltan fotos o declaracion)");
        }

        Cliente cliente = resolveCliente(email);
        Propuesta p = new Propuesta();
        p.setCliente(cliente);
        p.setTitulo(request.getTitulo());
        p.setDescripcion(request.getDescripcion());
        p.setHistoria(request.getHistoria());
        p.setDeclaracionPropiedad(request.isDeclaracionPropiedad());
        p.setAcuerdoEnvio(request.isAcuerdoEnvio());
        p.setOrigenLicitoUrl(request.getOrigenLicitoAdjunto());
        p.setEstado("en_revision");

        request.getFotos().forEach(f -> {
            FotoPropuesta foto = new FotoPropuesta();
            foto.setPropuesta(p);
            foto.setFoto(java.util.Base64.getDecoder().decode(f));
            p.getFotos().add(foto);
        });

        propuestaRepository.save(p);
        return new CrearPropuestaResponse("Propuesta enviada correctamente", p.getIdentificador(), "en_revision");
    }

    @Override
    @Transactional(readOnly = true)
    public ListaPropuestaResponse listMine(String email) {
        Cliente cliente = resolveCliente(email);
        var items = propuestaRepository.findByClienteIdentificador(cliente.getIdentificador()).stream().map(p -> {
            ItemListaPropuestaResponse i = new ItemListaPropuestaResponse();
            i.setProposalId(p.getIdentificador());
            i.setTitulo(p.getTitulo());
            i.setStatus(p.getEstado());
            i.setCreatedAt(p.getFechaCreacion());
            return i;
        }).toList();
        return new ListaPropuestaResponse(items);
    }

    @Override
    @Transactional(readOnly = true)
    public DetallePropuestaResponse getMine(Integer proposalId, String email) {
        Cliente cliente = resolveCliente(email);
        Propuesta p = propuestaRepository.findByIdentificadorAndClienteIdentificador(proposalId, cliente.getIdentificador())
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta no encontrada"));
        return mapDetail(p);
    }

    @Override
    @Transactional
    public TerminosPropuestaResponse respondTerms(Integer proposalId, TerminosPropuestaRequest request, String email) {
        Cliente cliente = resolveCliente(email);
        Propuesta p = propuestaRepository.findByIdentificadorAndClienteIdentificador(proposalId, cliente.getIdentificador())
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta no encontrada"));

        if (!"aceptada".equals(p.getEstado())) {
            throw new ConflictException("409 (propuesta aun no validada)");
        }

        boolean acepta = Boolean.TRUE.equals(request.getAcceptBasePriceAndCommission());
        p.setAceptadoPorUsuario(acepta);
        p.setEstado(acepta ? "condiciones_aceptadas" : "rechazada");
        propuestaRepository.save(p);
        return new TerminosPropuestaResponse("Condiciones respondidas correctamente", p.getEstado());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getPhotos(Integer proposalId, String email) {
        Cliente cliente = resolveCliente(email);
        Propuesta p = propuestaRepository
            .findByIdentificadorAndClienteIdentificador(proposalId, cliente.getIdentificador())
            .orElseThrow(() -> new ResourceNotFoundException("Propuesta no encontrada"));

        return fotoPropuestaRepository.findByPropuesta(p).stream()
            .map(f -> Base64.getEncoder().encodeToString(f.getFoto()))
            .toList();
    }

    private DetallePropuestaResponse mapDetail(Propuesta p) {
        DetallePropuestaResponse r = new DetallePropuestaResponse();
        r.setProposalId(p.getIdentificador());
        r.setTitulo(p.getTitulo());
        r.setDescripcion(p.getDescripcion());
        r.setHistoria(p.getHistoria());
        r.setStatus(p.getEstado());
        r.setFeedback(p.getFeedback());
        r.setMoneda(p.getMoneda());
        r.setAceptadoPorUsuario(p.getAceptadoPorUsuario());
        r.setBasePrice(p.getPrecioBase());
        r.setCommission(p.getComision());
        if (p.getSubastaAsignada() != null) {
            DetallePropuestaResponse.AssignedAuctionResponse a = new DetallePropuestaResponse.AssignedAuctionResponse();
            a.setAuctionId(p.getSubastaAsignada().getIdentificador());
            if (p.getSubastaAsignada().getFecha() != null) a.setFecha(p.getSubastaAsignada().getFecha().toString());
            if (p.getSubastaAsignada().getHora() != null) a.setHora(p.getSubastaAsignada().getHora().toString());
            r.setAssignedAuction(a);
        }
        return r;
    }

    private Cliente resolveCliente(String email) {
        Usuario user = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return clienteRepository.findById(user.getPersona().getIdentificador())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
    }
}