package com.subastas.backend.service.impl;

import com.subastas.backend.dto.request.CrearPropuestaRequest;
import com.subastas.backend.dto.request.SolicitarDevolucionRequest;
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
import com.subastas.backend.repository.DuenioRepository;
import com.subastas.backend.repository.FotoPropuestaRepository;
import com.subastas.backend.repository.FotoRepository;
import com.subastas.backend.repository.ProductoRepository;
import com.subastas.backend.repository.PropuestaRepository;
import com.subastas.backend.repository.RegistroDeSubastaRepository;
import com.subastas.backend.repository.UsuarioRepository;
import com.subastas.backend.service.PropuestaService;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
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
    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;
    private final DuenioRepository duenioRepository;
    private final RegistroDeSubastaRepository registroDeSubastaRepository;

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
        p.setOrigenLicitoUrl(request.getOrigenLicitoUrl()); // puede ser null, está ok
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
        Propuesta p = propuestaRepository
                .findByIdentificadorAndClienteIdentificador(proposalId, cliente.getIdentificador())
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta no encontrada"));

        if (!"aceptada".equals(p.getEstado())) {
            throw new ConflictException("409 (propuesta aun no validada)");
        }

        boolean acepta = Boolean.TRUE.equals(request.getAcceptBasePriceAndCommission());
        p.setAceptadoPorUsuario(acepta);
        p.setEstado(acepta ? "condiciones_aceptadas" : "condiciones_rechazadas");

        if (acepta) {
            Producto producto = crearProductoDesdePropuesta(p);
            p.setProductoGenerado(producto);
        }

        propuestaRepository.save(p);
        return new TerminosPropuestaResponse("Condiciones respondidas correctamente", p.getEstado());
    }   

    private Producto crearProductoDesdePropuesta(Propuesta p) {
        // El dueño del producto es la misma persona que es cliente
        Duenio duenio = duenioRepository.findById(p.getCliente().getIdentificador())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "El usuario no tiene perfil de dueño. Contacte al administrador."));

        // El revisor es quien aprobó la propuesta
        Empleado revisor = p.getRevisor();
        if (revisor == null) {
            throw new IllegalStateException("La propuesta no tiene revisor asignado.");
        }   

        Producto producto = new Producto();
        producto.setFecha(LocalDate.now());
        producto.setDisponible("si");
        producto.setDescripcionCatalogo(p.getTitulo());
        producto.setDescripcionCompleta(p.getDescripcion() + "\n\n" + p.getHistoria());
        producto.setDuenio(duenio);
        producto.setRevisor(revisor);
        productoRepository.save(producto);

        // Migrar fotos de FotoPropuesta → Foto
        fotoPropuestaRepository.findByPropuesta(p).forEach(fp -> {
            Foto foto = new Foto();
            foto.setProducto(producto);
            foto.setFoto(fp.getFoto());
            fotoRepository.save(foto);
        });

        return producto;
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
        r.setTipoDevolucion(p.getTipoDevolucion());
        r.setDireccionDevolucion(p.getDireccionDevolucion());

        if (p.getProductoGenerado() != null) {
            r.setProductoId(p.getProductoGenerado().getIdentificador());
        }

        if (p.getSubastaAsignada() != null) {
            DetallePropuestaResponse.AssignedAuctionResponse a = new DetallePropuestaResponse.AssignedAuctionResponse();
            a.setAuctionId(p.getSubastaAsignada().getIdentificador());
            a.setNombreSubasta(p.getSubastaAsignada().getUbicacion()); // nombre descriptivo de la subasta
            if (p.getSubastaAsignada().getFecha() != null) a.setFecha(p.getSubastaAsignada().getFecha().toString());
            if (p.getSubastaAsignada().getHora() != null) a.setHora(p.getSubastaAsignada().getHora().toString());
            r.setAssignedAuction(a);
        }

        // Resultado de venta: buscar en registroDeSubasta por el producto generado
        if (p.getProductoGenerado() != null) {
            registroDeSubastaRepository
                    .findByProductoIdentificador(p.getProductoGenerado().getIdentificador())
                    .stream()
                    .findFirst()
                    .ifPresent(registro -> {
                        DetallePropuestaResponse.SaleResult sale = new DetallePropuestaResponse.SaleResult();
                        sale.setMontoFinal(registro.getImporte());
                        sale.setMoneda(p.getMoneda() != null ? p.getMoneda() : "ARS");
                        boolean esEmpresa = registro.getCliente() != null
                                && registro.getCliente().getPersona() != null
                                && "Vantage Fine Auctions".equals(
                                        registro.getCliente().getPersona().getNombre());
                        sale.setEsEmpresa(esEmpresa);
                        if (!esEmpresa && registro.getCliente() != null
                                && registro.getCliente().getPersona() != null) {
                            sale.setNombreGanador(registro.getCliente().getPersona().getNombre());
                        }
                        r.setSaleResult(sale);
                    });
        }

        return r;
    }

    @Override
    @Transactional
    public TerminosPropuestaResponse solicitarDevolucion(Integer proposalId,
                                                        SolicitarDevolucionRequest request,
                                                        String email) {
        Cliente cliente = resolveCliente(email);
        Propuesta p = propuestaRepository
            .findByIdentificadorAndClienteIdentificador(proposalId, cliente.getIdentificador())
            .orElseThrow(() -> new ResourceNotFoundException("Propuesta no encontrada"));

        if (!"condiciones_rechazadas".equals(p.getEstado()) && !"rechazada".equals(p.getEstado())) {
            throw new ConflictException("La propuesta no está en un estado que permita solicitar devolución");
        }

        String tipo = request.getTipo();
        if (!"sucursal".equals(tipo) && !"envio".equals(tipo)) {
            throw new IllegalArgumentException("tipo debe ser 'sucursal' o 'envio'");
        }
        if ("envio".equals(tipo) && (request.getDireccion() == null || request.getDireccion().isBlank())) {
            throw new IllegalArgumentException("Se requiere dirección para solicitar envío");
        }

        p.setTipoDevolucion(tipo);
        p.setDireccionDevolucion("envio".equals(tipo) ? request.getDireccion().trim() : null);
        p.setEstado("envio".equals(tipo) ? "envio_solicitado" : "retiro_sucursal");
        propuestaRepository.save(p);

        return new TerminosPropuestaResponse("Devolución registrada correctamente", p.getEstado());
    }

    private Cliente resolveCliente(String email) {
        Usuario user = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return clienteRepository.findById(user.getPersona().getIdentificador())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
    }
}