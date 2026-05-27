package com.subastas.backend.service.impl;

import com.subastas.backend.dto.response.*;
import com.subastas.backend.dto.request.*;
import com.subastas.backend.dto.response.MessageResponse;
import com.subastas.backend.dto.response.multa.CrearMultaResponse;
import com.subastas.backend.dto.response.subasta.AdjudicarItemResponse;
import com.subastas.backend.dto.response.subasta.CerrarSubastaResponse;
import com.subastas.backend.dto.response.subasta.CrearSubastaResponse;
import com.subastas.backend.entity.*;
import com.subastas.backend.exception.ConflictException;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.*;
import com.subastas.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final SubastaRepository subastaRepository;
    private final MonedaSubastaRepository monedaSubastaRepository;
    private final SubastadorRepository subastadorRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final PujoRepository pujoRepository;
    private final RegistroDeSubastaRepository registroDeSubastaRepository;
    private final ClienteRepository clienteRepository;
    private final MedioPagoRepository medioPagoRepository;
    private final PropuestaRepository propuestaRepository;
    private final EmpleadoRepository empleadoRepository;
    private final MultaRepository multaRepository;
    private final UsuarioRepository usuarioRepository;


    @Value("${app.empresa.cliente-id:1}")
    private Integer empresaClienteId;


    //  SUBASTAS

    @Transactional
    public CrearSubastaResponse crearSubasta(Integer empleadoId, CrearSubastaRequest req) {
        if (!req.getFecha().isAfter(LocalDate.now().plusDays(10))) {
            throw new IllegalArgumentException(
                    "La subasta debe crearse con al menos 10 días de anticipación");
        }

        Subastador subastador = null;
        if (req.getSubastadorId() != null) {
            subastador = subastadorRepository.findById(req.getSubastadorId())
                    .orElseThrow(() -> new IllegalArgumentException("Subastador no encontrado"));
        }

        Subasta subasta = new Subasta();
        subasta.setFecha(req.getFecha());
        subasta.setHora(req.getHora());
        subasta.setEstado("abierta");
        subasta.setSubastador(subastador);
        subasta.setUbicacion(req.getUbicacion());
        subasta.setCapacidadAsistentes(req.getCapacidadAsistentes());
        subasta.setTieneDeposito(Boolean.TRUE.equals(req.getTieneDeposito()) ? "si" : "no");
        subasta.setSeguridadPropia(Boolean.TRUE.equals(req.getSeguridadPropia()) ? "si" : "no");
        subasta.setCategoria(req.getCategoria());
        subasta = subastaRepository.save(subasta);

        monedaSubastaRepository.save(MonedaSubasta.builder()
                .subasta(subasta)
                .moneda(req.getMoneda())
                .build());

        return CrearSubastaResponse.builder()
                .mensaje("Subasta creada correctamente")
                .subastaId(subasta.getIdentificador())
                .estado(subasta.getEstado())
                .moneda(req.getMoneda())
                .build();
    }

    
    @Transactional
    public CerrarSubastaResponse cerrarSubasta(Integer empleadoId, Integer subastaId) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada"));

        if (!"abierta".equals(subasta.getEstado())) {
            throw new ConflictException("La subasta no está abierta");
        }

        // "carrada" porque el profe puso en la BBDD original así en vez de "cerrada"
        subasta.setEstado("carrada");
        subastaRepository.save(subasta);

        return CerrarSubastaResponse.builder()
                .mensaje("Subasta cerrada correctamente")
                .subastaId(subastaId)
                .estado(subasta.getEstado())
                .cerradaEn(LocalDateTime.now())
                .build();
    }

    
    @Transactional
    public AdjudicarItemResponse adjudicarItem(Integer empleadoId, Integer itemId, AdjudicarItemRequest req) {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem de catálogo no encontrado"));

        if ("si".equalsIgnoreCase(item.getSubastado())) {
            throw new ConflictException("El ítem ya fue adjudicado");
        }

        Subasta subasta = item.getCatalogo().getSubasta();

        if ("empresa".equalsIgnoreCase(req.getAdjudicarA())) {
            return adjudicarAEmpresa(item, subasta);
        }

        if ("ganador".equalsIgnoreCase(req.getAdjudicarA())) {
            return adjudicarAGanador(item, subasta);
        }

        throw new IllegalArgumentException("'adjudicarA' debe ser 'ganador' o 'empresa'");
    }

    private AdjudicarItemResponse adjudicarAEmpresa(ItemCatalogo item, Subasta subasta) {
        Cliente empresaCliente = clienteRepository.findById(empresaClienteId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cliente empresa no configurado. Revisar 'app.empresa.cliente-id'"));

        RegistroDeSubasta registro = crearRegistro(subasta, item.getProducto(),
                empresaCliente, item.getPrecioBase(), item.getComision());

        item.setSubastado("si");
        itemCatalogoRepository.save(item);

        return AdjudicarItemResponse.builder()
        .mensaje("Ítem adjudicado a la empresa al precio base")
        .itemCatalogoId(item.getIdentificador())
        .clienteGanadorId(empresaClienteId)
        .montoGanador(item.getPrecioBase())
        .registroId(registro.getIdentificador())
        .build();
    }

    private AdjudicarItemResponse adjudicarAGanador(ItemCatalogo item, Subasta subasta) {
        Pujo mejorPujo = pujoRepository
                .findFirstByItemIdentificadorOrderByImporteDescIdentificadorDesc(
                        item.getIdentificador())
                .orElseThrow(() -> new ConflictException(
                        "No hay pujas para este ítem. Usar adjudicarA='empresa' si corresponde."));

        mejorPujo.setGanador("si");
        pujoRepository.save(mejorPujo);

        Cliente clienteGanador = mejorPujo.getAsistente().getCliente();
        BigDecimal montoGanador = mejorPujo.getImporte();

        RegistroDeSubasta registro = crearRegistro(subasta, item.getProducto(),
                clienteGanador, montoGanador, item.getComision());

        item.setSubastado("si");
        itemCatalogoRepository.save(item);

        return AdjudicarItemResponse.builder()
                .mensaje("Ítem adjudicado al ganador")
                .itemCatalogoId(item.getIdentificador())
                .clienteGanadorId(clienteGanador.getIdentificador())
                .montoGanador(montoGanador)
                .registroId(registro.getIdentificador())
                .build();
    }

    private RegistroDeSubasta crearRegistro(Subasta subasta, Producto producto,
                                            Cliente cliente, BigDecimal importe,
                                            BigDecimal comision) {
        RegistroDeSubasta registro = new RegistroDeSubasta();
        registro.setSubasta(subasta);
        registro.setDuenio(producto.getDuenio());
        registro.setProducto(producto);
        registro.setCliente(cliente);
        registro.setImporte(importe);
        registro.setComision(comision);
        return registroDeSubastaRepository.save(registro);
    }


    //  USUARIOS

    @Transactional
    public MessageResponse cambiarCategoria(Integer empleadoId, Integer usuarioId,
                                            CambiarCategoriaRequest req) {
        Cliente cliente = clienteRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
        cliente.setCategoria(req.getNuevaCategoria());
        clienteRepository.save(cliente);
        return new MessageResponse("Categoría actualizada a: " + req.getNuevaCategoria());
    }


    //  MEDIOS DE PAGO

    @Transactional
    public MessageResponse verificarPago(Integer empleadoId, Integer pagoId, VerificarPagoRequest req) {
        MedioPago medioPago = medioPagoRepository.findById(pagoId)
                .orElseThrow(() -> new ResourceNotFoundException("Medio de pago no encontrado"));

        if (Boolean.TRUE.equals(req.getAprobar())) {
            medioPago.setVerificado(true);
            medioPago.setActivo(true);
        } else {
            medioPago.setVerificado(false);
            medioPago.setActivo(false);
        }
        medioPagoRepository.save(medioPago);

        return new MessageResponse(Boolean.TRUE.equals(req.getAprobar())
                ? "Medio de pago verificado correctamente"
                : "Medio de pago rechazado");
    }


    //  PROPUESTAS
    
    @Transactional
    public MessageResponse revisarPropuesta(Integer empleadoId, Integer propuestaId, RevisarPropuestaRequest req) {
        
        Propuesta propuesta = propuestaRepository.findById(propuestaId)
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta no encontrada"));

        if (!"en_revision".equals(propuesta.getEstado())) {
            throw new ConflictException(
                    "La propuesta no está en estado 'en_revision' (estado actual: "
                    + propuesta.getEstado() + ")");
        }

        if (Boolean.TRUE.equals(req.getAprobar())) {
            if (req.getPrecioBase() == null || req.getComision() == null) {
                throw new IllegalArgumentException(
                        "Para aprobar una propuesta se requieren precioBase y comision");
            }
            Subasta subastaAsignada = null;
            if (req.getSubastaAsignadaId() != null) {
                subastaAsignada = subastaRepository.findById(req.getSubastaAsignadaId())
                        .orElseThrow(() -> new IllegalArgumentException("La subasta asignada no existe"));
            }
            propuesta.setEstado("aceptada");
            propuesta.setPrecioBase(req.getPrecioBase());
            propuesta.setComision(req.getComision());
            propuesta.setSubastaAsignada(subastaAsignada);
        } else {
            if (req.getMotivoRechazo() == null || req.getMotivoRechazo().isBlank()) {
                throw new IllegalArgumentException(
                        "Para rechazar una propuesta se requiere motivoRechazo");
            }
            propuesta.setEstado("rechazada");
            propuesta.setMotivoRechazo(req.getMotivoRechazo());
        }

        Empleado revisor = empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado revisor no encontrado"));
        propuesta.setRevisor(revisor);
        propuesta.setFechaEvaluacion(LocalDateTime.now());
        propuestaRepository.save(propuesta);

        return new MessageResponse(Boolean.TRUE.equals(req.getAprobar())
                ? "Propuesta aprobada"
                : "Propuesta rechazada");
    }


    //  MULTAS

    @Transactional
    public CrearMultaResponse crearMulta(Integer empleadoId, CrearMultaRequest req) {
        Usuario usuario = usuarioRepository.findById(req.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Subasta subasta = subastaRepository.findById(req.getSubastaId())
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada"));

        Pujo pujo = pujoRepository.findById(req.getPujoId())
                .orElseThrow(() -> new ResourceNotFoundException("Puja no encontrada"));

        BigDecimal porcentaje = req.getPorcentajeMulta() != null
                ? req.getPorcentajeMulta()
                : BigDecimal.valueOf(10);

        BigDecimal montoMulta = req.getMontoOferta()
                .multiply(porcentaje)
                .divide(BigDecimal.valueOf(100));

        LocalDateTime ahora = LocalDateTime.now();

        Multa multa = new Multa();
        multa.setUsuario(usuario);
        multa.setSubasta(subasta);
        multa.setPujo(pujo);
        multa.setMoneda(req.getMoneda());
        multa.setMontoOferta(req.getMontoOferta());
        multa.setPorcentajeMulta(porcentaje);
        multa.setMontoMulta(montoMulta);
        multa.setFechaEmision(ahora);
        multa.setFechaLimite(ahora.plusHours(72));
        multa = multaRepository.save(multa);

        return CrearMultaResponse.builder()
                .mensaje("Multa creada correctamente")
                .multaId(multa.getIdentificador())
                .usuarioId(usuario.getIdentificador())
                .montoMulta(montoMulta)
                .fechaEmision(multa.getFechaEmision())
                .fechaLimite(multa.getFechaLimite())
                .build();
    }
}
