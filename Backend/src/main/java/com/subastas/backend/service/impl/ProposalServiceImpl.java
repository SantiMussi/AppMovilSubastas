package com.subastas.backend.service.impl;

import com.subastas.backend.dto.request.CreateProposalRequest;
import com.subastas.backend.dto.request.ProposalTermsRequest;
import com.subastas.backend.dto.response.*;
import com.subastas.backend.entity.*;
import com.subastas.backend.exception.ConflictException;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.ClienteRepository;
import com.subastas.backend.repository.PropuestaRepository;
import com.subastas.backend.repository.UsuarioRepository;
import com.subastas.backend.service.ProposalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProposalServiceImpl implements ProposalService {
    private final PropuestaRepository propuestaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;

    @Override
    @Transactional
    public CreateProposalResponse create(CreateProposalRequest request, String email) {
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
            foto.setFoto(f.getBytes());
            p.getFotos().add(foto);
        });

        propuestaRepository.save(p);
        return new CreateProposalResponse("Propuesta enviada correctamente", p.getIdentificador(), "en_revision");
    }

    @Override
    @Transactional(readOnly = true)
    public ProposalListResponse listMine(String email) {
        Cliente cliente = resolveCliente(email);
        var items = propuestaRepository.findByClienteIdentificador(cliente.getIdentificador()).stream().map(p -> {
            ProposalListItemResponse i = new ProposalListItemResponse();
            i.setProposalId(p.getIdentificador());
            i.setTitulo(p.getTitulo());
            i.setStatus(p.getEstado());
            i.setCreatedAt(p.getFechaCreacion());
            return i;
        }).toList();
        return new ProposalListResponse(items);
    }

    @Override
    @Transactional(readOnly = true)
    public ProposalDetailResponse getMine(Integer proposalId, String email) {
        Cliente cliente = resolveCliente(email);
        Propuesta p = propuestaRepository.findByIdentificadorAndClienteIdentificador(proposalId, cliente.getIdentificador())
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta no encontrada"));
        return mapDetail(p);
    }

    @Override
    @Transactional
    public ProposalTermsResponse respondTerms(Integer proposalId, ProposalTermsRequest request, String email) {
        Cliente cliente = resolveCliente(email);
        Propuesta p = propuestaRepository.findByIdentificadorAndClienteIdentificador(proposalId, cliente.getIdentificador())
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta no encontrada"));

        if (!"aceptada".equals(p.getEstado())) {
            throw new ConflictException("409 (propuesta aun no validada)");
        }
        p.setEstado(Boolean.TRUE.equals(request.getAcceptBasePriceAndCommission()) ? "condiciones_aceptadas" : "rechazada");
        propuestaRepository.save(p);
        return new ProposalTermsResponse("Condiciones respondidas correctamente", p.getEstado());
    }

    private ProposalDetailResponse mapDetail(Propuesta p) {
        ProposalDetailResponse r = new ProposalDetailResponse();
        r.setProposalId(p.getIdentificador());
        r.setTitulo(p.getTitulo());
        r.setDescripcion(p.getDescripcion());
        r.setHistoria(p.getHistoria());
        r.setStatus(p.getEstado());
        r.setRejectionReason(p.getMotivoRechazo());
        r.setBasePrice(p.getPrecioBase());
        r.setCommission(p.getComision());
        if (p.getSubastaAsignada() != null) {
            ProposalDetailResponse.AssignedAuctionResponse a = new ProposalDetailResponse.AssignedAuctionResponse();
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