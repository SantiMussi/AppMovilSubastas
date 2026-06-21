package com.subastas.backend.service.impl;

import com.subastas.backend.dto.request.*;
import com.subastas.backend.dto.response.MessageResponse;
import com.subastas.backend.dto.response.admin.AdminUserResponse;
import com.subastas.backend.dto.response.multa.CrearMultaResponse;
import com.subastas.backend.dto.response.propuesta.AsignarPropuestaResponse;
import com.subastas.backend.dto.response.subasta.AdjudicarItemResponse;
import com.subastas.backend.dto.response.subasta.CerrarSubastaResponse;
import com.subastas.backend.dto.response.subasta.CrearSubastaResponse;
import com.subastas.backend.entity.*;
import com.subastas.backend.exception.ConflictException;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.event.LoteCerradoEvent;
import com.subastas.backend.event.SubastaCerradaEvent;
import com.subastas.backend.repository.*;
import com.subastas.backend.service.AdminService;
import com.subastas.backend.service.AuthenticationService;
import com.subastas.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final SubastaRepository subastaRepository;
    private final MonedaSubastaRepository monedaSubastaRepository;
    private final SubastadorRepository subastadorRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final CatalogoRepository catalogoRepository;
    private final PujoRepository pujoRepository;
    private final RegistroDeSubastaRepository registroDeSubastaRepository;
    private final ClienteRepository clienteRepository;
    private final MedioPagoRepository medioPagoRepository;
    private final PropuestaRepository propuestaRepository;
    private final EmpleadoRepository empleadoRepository;
    private final MultaRepository multaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailService emailService;
    private final AuthenticationService authenticationService;


    @Value("${app.empresa.cliente-id:1}")
    private Integer empresaClienteId;


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

        List<RegistroDeSubasta> registrosCreados = adjudicarGanadoresPendientes(subasta);

        subasta.setEstado("carrada");
        subastaRepository.save(subasta);
        eventPublisher.publishEvent(new SubastaCerradaEvent(subastaId, subasta.getEstado()));

        return CerrarSubastaResponse.builder()
                .mensaje(registrosCreados.isEmpty()
                        ? "Subasta cerrada correctamente"
                        : "Subasta cerrada correctamente. Ventas registradas: " + registrosCreados.size())
                .subastaId(subastaId)
                .estado(subasta.getEstado())
                .cerradaEn(LocalDateTime.now())
                .build();
    }

    
    private List<RegistroDeSubasta> adjudicarGanadoresPendientes(Subasta subasta) {
        return catalogoRepository.findBySubastaIdentificador(subasta.getIdentificador()).stream()
                .flatMap(catalogo -> itemCatalogoRepository.findByCatalogoIdentificador(catalogo.getIdentificador()).stream())
                .filter(item -> !"si".equalsIgnoreCase(item.getSubastado()))
                .map(item -> adjudicarGanadorSiTienePuja(item, subasta))
                .flatMap(java.util.Optional::stream)
                .toList();
    }

    private java.util.Optional<RegistroDeSubasta> adjudicarGanadorSiTienePuja(ItemCatalogo item, Subasta subasta) {
        java.util.Optional<RegistroDeSubasta> registroExistente = registroDeSubastaRepository
                .findByProductoIdentificador(item.getProducto().getIdentificador())
                .stream()
                .filter(registro -> registro.getSubasta() != null
                        && registro.getSubasta().getIdentificador().equals(subasta.getIdentificador()))
                .findFirst();
        if (registroExistente.isPresent()) {
            item.setSubastado("si");
            itemCatalogoRepository.save(item);
            return java.util.Optional.empty();
        }

        return pujoRepository.findFirstByItemIdentificadorOrderByImporteDescIdentificadorDesc(item.getIdentificador())
                .map(mejorPujo -> {
                    mejorPujo.setGanador("si");
                    pujoRepository.save(mejorPujo);

                    RegistroDeSubasta registro = crearRegistro(
                            subasta,
                            item.getProducto(),
                            mejorPujo.getAsistente().getCliente(),
                            mejorPujo.getImporte(),
                            item.getComision()
                    );

                    item.setSubastado("si");
                    itemCatalogoRepository.save(item);
                    return registro;
                });
    }
    
    @Transactional
    public AdjudicarItemResponse adjudicarItem(Integer empleadoId, Integer itemId, AdjudicarItemRequest req) {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem de catálogo no encontrado"));

        if ("si".equalsIgnoreCase(item.getSubastado())) {
            throw new ConflictException("El ítem ya fue adjudicado");
        }

        Subasta subasta = item.getCatalogo().getSubasta();

        AdjudicarItemResponse response;
        if ("empresa".equalsIgnoreCase(req.getAdjudicarA())) {
            response = adjudicarAEmpresa(item, subasta);
        } else if ("ganador".equalsIgnoreCase(req.getAdjudicarA())) {
            response = adjudicarAGanador(item, subasta);
        } else {
            throw new IllegalArgumentException("'adjudicarA' debe ser 'ganador' o 'empresa'");
        }

        // Buscar el siguiente ítem no adjudicado del mismo catálogo, en orden de identificador
        Integer nextItemId = itemCatalogoRepository
                .findByCatalogoIdentificador(item.getCatalogo().getIdentificador())
                .stream()
                .filter(i -> !"si".equalsIgnoreCase(i.getSubastado())
                        && !i.getIdentificador().equals(itemId))
                .map(ItemCatalogo::getIdentificador)
                .min(Integer::compareTo)
                .orElse(null);

        response.setNextItemId(nextItemId);

        // Publicar evento para que el WebSocket notifique a los conectados
        eventPublisher.publishEvent(new LoteCerradoEvent(subasta.getIdentificador(), itemId, nextItemId));

        return response;
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


    @Transactional(readOnly = true)
    public List<AdminUserResponse> obtenerUsuarios() {
        Map<Integer, Cliente> clientesPorPersonaId = clienteRepository.findAll().stream()
                .collect(Collectors.toMap(Cliente::getIdentificador, Function.identity()));

        return usuarioRepository.findAll().stream()
                .map(usuario -> toAdminUserResponse(usuario, clientesPorPersonaId.get(getPersonaId(usuario))))
                .toList();
    }

    private AdminUserResponse toAdminUserResponse(Usuario usuario, Cliente cliente) {
        Persona persona = usuario.getPersona();

        return AdminUserResponse.builder()
                .usuarioId(usuario.getIdentificador())
                .email(usuario.getEmail())
                .password(usuario.getPassword())
                .apellido(usuario.getApellido())
                .personaId(persona != null ? persona.getIdentificador() : null)
                .documento(persona != null ? persona.getDocumento() : null)
                .nombre(persona != null ? persona.getNombre() : null)
                .direccion(persona != null ? persona.getDireccion() : null)
                .estado(persona != null ? persona.getEstado() : null)
                .foto(toBase64Photo(persona))
                .cliente(toClienteData(cliente))
                .build();
    }

    private Integer getPersonaId(Usuario usuario) {
        return usuario.getPersona() != null ? usuario.getPersona().getIdentificador() : null;
    }

    private String toBase64Photo(Persona persona) {
        if (persona == null || persona.getFoto() == null) {
            return null;
        }
        return "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(persona.getFoto());
    }

    private AdminUserResponse.ClienteData toClienteData(Cliente cliente) {
        if (cliente == null) {
            return null;
        }

        return AdminUserResponse.ClienteData.builder()
                .clienteId(cliente.getIdentificador())
                .admitido(cliente.getAdmitido())
                .categoria(cliente.getCategoria())
                .pais(toPaisData(cliente.getPais()))
                .verificador(toEmpleadoData(cliente.getVerificador()))
                .build();
    }

    private AdminUserResponse.PaisData toPaisData(Pais pais) {
        if (pais == null) {
            return null;
        }

        return AdminUserResponse.PaisData.builder()
                .numero(pais.getNumero())
                .nombre(pais.getNombre())
                .nombreCorto(pais.getNombreCorto())
                .capital(pais.getCapital())
                .nacionalidad(pais.getNacionalidad())
                .idiomas(pais.getIdiomas())
                .build();
    }

    private AdminUserResponse.EmpleadoData toEmpleadoData(Empleado empleado) {
        if (empleado == null) {
            return null;
        }

        Persona persona = empleado.getPersona();
        return AdminUserResponse.EmpleadoData.builder()
                .empleadoId(empleado.getIdentificador())
                .documento(persona != null ? persona.getDocumento() : null)
                .nombre(persona != null ? persona.getNombre() : null)
                .direccion(persona != null ? persona.getDireccion() : null)
                .estado(persona != null ? persona.getEstado() : null)
                .cargo(empleado.getCargo())
                .sector(empleado.getSector() != null ? empleado.getSector().getNombreSector() : null)
                .build();
    }


    @Transactional
    public MessageResponse cambiarCategoria(Integer empleadoId, Integer usuarioId,
                                            CambiarCategoriaRequest req) {
        Cliente cliente = findClienteByUsuarioOrClienteId(usuarioId);
        cliente.setCategoria(req.getNuevaCategoria());
        clienteRepository.save(cliente);
        return new MessageResponse("Categoría actualizada a: " + req.getNuevaCategoria());
    }

	@Transactional
    public MessageResponse admitirUsuario(Integer empleadoId, Integer usuarioId) {
        Cliente cliente = findClienteByUsuarioOrClienteId(usuarioId);
        Empleado verificador = empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado verificador no encontrado"));

        cliente.setAdmitido("si");
        cliente.setVerificador(verificador);
        clienteRepository.save(cliente);

        Usuario usuario = usuarioRepository.findByPersonaIdentificador(cliente.getIdentificador())
                .orElse(null);
        if (usuario != null) {
            String code = authenticationService.generateAndStoreRegistrationCode(usuario.getEmail());
            String subject = "Tu registro ha sido aprobado - VANTAGE";
            String body = "Hola " + (usuario.getPersona() != null ? usuario.getPersona().getNombre() : "") + ",\n\n" +
                    "Te informamos que tu registro en VANTAGE ha sido aprobado por nuestro equipo.\n" +
                    "Para completar tu registro y establecer tu contraseña, ingresa en la app con tu email y el siguiente código de verificación: " + code + "\n\n" +
                    "Saludos,\nEl equipo de VANTAGE.";
            emailService.sendEmail(usuario.getEmail(), subject, body);
        }

        return new MessageResponse("Usuario admitido correctamente");
    }

    private Cliente findClienteByUsuarioOrClienteId(Integer usuarioId) {
        return clienteRepository.findById(usuarioId)
                .or(() -> usuarioRepository.findById(usuarioId)
                        .map(Usuario::getPersona)
                        .flatMap(persona -> clienteRepository.findById(persona.getIdentificador())))
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
    }

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

    @Transactional
    public AsignarPropuestaResponse asignarPropuesta(Integer empleadoId, Integer propuestaId, AsignarPropuestaRequest req) {
        Propuesta propuesta = propuestaRepository.findById(propuestaId)
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta no encontrada"));

        if (!"condiciones_aceptadas".equals(propuesta.getEstado())) {
            throw new ConflictException("La propuesta debe estar en estado 'condiciones_aceptadas'");
        }

        if (propuesta.getProductoGenerado() == null) {
            throw new ConflictException("La propuesta no tiene un producto generado. El usuario aún no aceptó los términos.");
        }

        Catalogo catalogo = catalogoRepository.findById(req.getCatalogoId())
                .orElseThrow(() -> new ResourceNotFoundException("Catálogo no encontrado"));

        Subasta subasta = catalogo.getSubasta();
        if (subasta == null) {
            throw new ConflictException("El catálogo no tiene una subasta asignada");
        }

        // Verificar que no esté ya asignado
        boolean yaAsignado = itemCatalogoRepository
                .findByCatalogoIdentificador(catalogo.getIdentificador())
                .stream()
                .anyMatch(i -> i.getProducto().getIdentificador()
                        .equals(propuesta.getProductoGenerado().getIdentificador()));
        if (yaAsignado) {
            throw new ConflictException("Este producto ya está asignado a ese catálogo");
        }

        // Crear el ítem de catálogo
        ItemCatalogo item = new ItemCatalogo();
        item.setCatalogo(catalogo);
        item.setProducto(propuesta.getProductoGenerado());
        item.setPrecioBase(propuesta.getPrecioBase());
        item.setComision(propuesta.getComision());
        item.setSubastado("no");
        itemCatalogoRepository.save(item);

        // Actualizar la propuesta con la subasta asignada (para que el usuario la vea)
        propuesta.setSubastaAsignada(subasta);
        propuestaRepository.save(propuesta);

        return AsignarPropuestaResponse.builder()
                .mensaje("Producto asignado al catálogo correctamente")
                .propuestaId(propuestaId)
                .productoId(propuesta.getProductoGenerado().getIdentificador())
                .itemCatalogoId(item.getIdentificador())
                .subastaId(subasta.getIdentificador())
                .nombreSubasta(subasta.getUbicacion())
                .build();
    }

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
            propuesta.setMoneda(req.getMoneda());
            propuesta.setSubastaAsignada(subastaAsignada);
            propuesta.setFeedback(req.getFeedback());
        } else {
            if (req.getFeedback() == null || req.getFeedback().isBlank()) {
                throw new IllegalArgumentException(
                        "Para rechazar una propuesta se requiere motivoRechazo");
            }
            propuesta.setEstado("rechazada");
            propuesta.setFeedback(req.getFeedback());
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
