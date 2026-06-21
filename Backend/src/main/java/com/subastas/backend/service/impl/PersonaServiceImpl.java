package com.subastas.backend.service.impl;

import com.subastas.backend.entity.Persona;
import com.subastas.backend.entity.Usuario;
import com.subastas.backend.dto.request.PerfilRequest;
import com.subastas.backend.dto.response.PerfilResponse;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.AsistenteRepository;
import com.subastas.backend.repository.ClienteRepository;
import com.subastas.backend.repository.ItemCatalogoRepository;
import com.subastas.backend.repository.PersonaRepository;
import com.subastas.backend.repository.PujoRepository;
import com.subastas.backend.repository.RegistroDeSubastaRepository;
import com.subastas.backend.repository.UsuarioRepository;
import com.subastas.backend.service.FotoService;
import com.subastas.backend.service.PersonaService;
import com.subastas.backend.util.ImageUtils;

import lombok.RequiredArgsConstructor;

import java.io.IOException;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PersonaServiceImpl implements PersonaService {

    private final PersonaRepository personaRepository;

    private final UsuarioRepository usuarioRepository;

    private final ClienteRepository clienteRepository;

    private final AsistenteRepository asistenteRepository;

    private final PujoRepository pujoRepository;

    private final RegistroDeSubastaRepository registroDeSubastaRepository;

    private final FotoService fotoService;

    private final ItemCatalogoRepository itemCatalogoRepository;

    private Usuario obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
    }

    @Override
    public PerfilResponse obtenerPerfil(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Persona persona = usuario.getPersona();

        PerfilResponse response = new PerfilResponse();
        response.setIdentificador(persona.getIdentificador());
        response.setNombre(persona.getNombre());
        response.setApellido(usuario.getApellido());
        response.setEmail(usuario.getEmail());
        response.setDireccion(persona.getDireccion());
        response.setDocumento(persona.getDocumento());
        
        clienteRepository.findById(persona.getIdentificador())
                .ifPresent(cliente -> response.setCategoria(cliente.getCategoria()));
        
        if (persona.getFoto() != null) {
            String base64 = java.util.Base64.getEncoder().encodeToString(persona.getFoto());
            response.setFoto("data:image/jpeg;base64," + base64);
        }
        
        return response;
    }

    @Override
    @Transactional
    public PerfilResponse actualizarPerfil(String email, PerfilRequest datos) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Persona existente = usuario.getPersona();
        
        existente.setNombre(datos.getNombre());
        existente.setDireccion(datos.getDireccion());
        personaRepository.save(existente);

        usuario.setApellido(datos.getApellido());
        usuarioRepository.save(usuario);

        return obtenerPerfil(email);
    }

    @Override
    @Transactional
    public void actualizarFotoPerfil(String email, MultipartFile archivo) throws IOException {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Persona persona = usuario.getPersona();

        persona.setFoto(ImageUtils.procesarImagen(archivo));

        personaRepository.save(persona);
    }

    @Override
    @Transactional
    public void eliminarCuenta(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Persona persona = usuario.getPersona();
        
        usuario.setEmail("del_" + persona.getIdentificador() + "@deleted.com");
        usuario.setPassword("");
        usuarioRepository.save(usuario);
        
        persona.setDocumento("del_" + persona.getIdentificador());
        persona.setEstado("inactivo");
        personaRepository.save(persona);
        
        clienteRepository.findById(persona.getIdentificador()).ifPresent(cliente -> {
            cliente.setAdmitido("no");
            clienteRepository.save(cliente);
        });
    }

    @Override
    public com.subastas.backend.dto.response.metrics.UserStatsResponse obtenerStatsUsuario(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Integer clienteId = usuario.getPersona().getIdentificador();
        
        com.subastas.backend.dto.response.metrics.UserStatsResponse stats = new com.subastas.backend.dto.response.metrics.UserStatsResponse();
        
        Integer asistencia = asistenteRepository.countByClienteIdentificador(clienteId);
        stats.setAsistencia(asistencia != null ? asistencia : 0);
        
        java.util.List<com.subastas.backend.entity.RegistroDeSubasta> wins = registroDeSubastaRepository.findByClienteIdentificador(clienteId);
        stats.setVictorias(wins.size());
        
        java.math.BigDecimal valuacion = java.math.BigDecimal.ZERO;
        for (com.subastas.backend.entity.RegistroDeSubasta w : wins) {
            if (w.getImporte() != null) {
                valuacion = valuacion.add(w.getImporte());
            }
        }
        stats.setValuacionPortfolio(valuacion);
        
        Double avgPuja = pujoRepository.getAveragePujaByClienteId(clienteId);
        stats.setPromedioPuja(avgPuja != null ? java.math.BigDecimal.valueOf(avgPuja) : java.math.BigDecimal.ZERO);
        
        return stats;
    }

    @Override
    public com.subastas.backend.dto.response.metrics.UserWinsResponse obtenerWinsUsuario(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Integer clienteId = usuario.getPersona().getIdentificador();
        
        Integer asistencia = asistenteRepository.countByClienteIdentificador(clienteId);
        java.util.List<com.subastas.backend.entity.RegistroDeSubasta> wins = registroDeSubastaRepository.findByClienteIdentificador(clienteId);
        
        com.subastas.backend.dto.response.metrics.UserWinsResponse response = new com.subastas.backend.dto.response.metrics.UserWinsResponse();
        
        if (asistencia != null && asistencia > 0) {
            response.setTasaExito(((double) wins.size() / asistencia) * 100);
        } else {
            response.setTasaExito(0.0);
        }
        
        java.util.Map<String, java.math.BigDecimal> categoriasMap = new java.util.HashMap<>();
        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        for (com.subastas.backend.entity.RegistroDeSubasta w : wins) {
            if (w.getImporte() != null && w.getSubasta() != null && w.getSubasta().getCategoria() != null) {
                String cat = w.getSubasta().getCategoria().toString();
                categoriasMap.put(cat, categoriasMap.getOrDefault(cat, java.math.BigDecimal.ZERO).add(w.getImporte()));
                total = total.add(w.getImporte());
            }
        }
        
        java.util.List<com.subastas.backend.dto.response.metrics.InvestmentBreakdownDto> desglose = new java.util.ArrayList<>();
        if (total.compareTo(java.math.BigDecimal.ZERO) > 0) {
            for (java.util.Map.Entry<String, java.math.BigDecimal> entry : categoriasMap.entrySet()) {
                double pct = entry.getValue().doubleValue() / total.doubleValue() * 100;
                desglose.add(new com.subastas.backend.dto.response.metrics.InvestmentBreakdownDto(entry.getKey(), Math.round(pct * 10.0) / 10.0));
            }
        }
        response.setDesgloseInversiones(desglose);

        java.util.List<com.subastas.backend.dto.response.metrics.WinSaleDto> ventas = new java.util.ArrayList<>();
        for (com.subastas.backend.entity.RegistroDeSubasta win : wins) {
            java.math.BigDecimal importe = win.getImporte() != null ? win.getImporte() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal comision = win.getComision() != null ? win.getComision() : java.math.BigDecimal.ZERO;
            com.subastas.backend.entity.Producto producto = win.getProducto();
            java.util.List<com.subastas.backend.entity.ItemCatalogo> items = producto == null
                    ? java.util.Collections.emptyList()
                    : itemCatalogoRepository.findByProductoIdentificador(producto.getIdentificador());
            com.subastas.backend.entity.ItemCatalogo item = items.stream()
                    .filter(candidate -> candidate.getCatalogo() != null
                            && candidate.getCatalogo().getSubasta() != null
                            && win.getSubasta() != null
                            && candidate.getCatalogo().getSubasta().getIdentificador().equals(win.getSubasta().getIdentificador()))
                    .findFirst()
                    .orElse(items.isEmpty() ? null : items.get(0));

            ventas.add(new com.subastas.backend.dto.response.metrics.WinSaleDto(
                    win.getIdentificador(),
                    win.getIdentificador(),
                    item != null ? item.getIdentificador() : null,
                    win.getSubasta() != null ? win.getSubasta().getIdentificador() : null,
                    producto != null ? producto.getIdentificador() : null,
                    obtenerNombreProducto(producto),
                    importe,
                    comision,
                    importe.add(comision),
                    null
            ));
        }
        response.setVentas(ventas);

        return response;
    }

    @Override
    public com.subastas.backend.dto.response.metrics.UserCollectionResponse obtenerColeccionUsuario(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Integer clienteId = usuario.getPersona().getIdentificador();
        java.util.List<com.subastas.backend.entity.RegistroDeSubasta> wins = registroDeSubastaRepository.findByClienteIdentificador(clienteId);

        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        java.util.List<com.subastas.backend.dto.response.metrics.CollectionItemResponse> items = new java.util.ArrayList<>();

        for (com.subastas.backend.entity.RegistroDeSubasta win : wins) {
            java.math.BigDecimal importe = win.getImporte() != null ? win.getImporte() : java.math.BigDecimal.ZERO;
            total = total.add(importe);

            com.subastas.backend.entity.Producto producto = win.getProducto();
            com.subastas.backend.dto.response.metrics.CollectionItemResponse item = new com.subastas.backend.dto.response.metrics.CollectionItemResponse();
            item.setRegistroId(win.getIdentificador());
            item.setProductId(producto != null ? producto.getIdentificador() : null);
            item.setNombre(obtenerNombreProducto(producto));
            item.setDescripcion(producto != null ? producto.getDescripcionCompleta() : null);
            item.setPrecio(importe);
            item.setEstadoEntrega(obtenerEstadoEntrega(win.getIdentificador()));
            item.setImagenUrl(obtenerPrimeraFotoUrl(producto));
            items.add(item);
        }

        com.subastas.backend.dto.response.metrics.UserCollectionResponse response = new com.subastas.backend.dto.response.metrics.UserCollectionResponse();
        response.setValorPortfolio(total);
        response.setAdquisiciones(items.size());
        response.setItems(items);
        return response;
    }

    private String obtenerNombreProducto(com.subastas.backend.entity.Producto producto) {
        if (producto == null) {
            return "Artículo adquirido";
        }
        String descripcionCatalogo = producto.getDescripcionCatalogo();
        if (descripcionCatalogo != null && !descripcionCatalogo.isBlank()) {
            return descripcionCatalogo;
        }
        String descripcionCompleta = producto.getDescripcionCompleta();
        if (descripcionCompleta != null && !descripcionCompleta.isBlank()) {
            return descripcionCompleta.length() > 42 ? descripcionCompleta.substring(0, 42).trim() : descripcionCompleta;
        }
        return "Artículo adquirido";
    }

    private String obtenerEstadoEntrega(Integer registroId) {
        String[] estados = { "en depósito", "retirado", "enviado" };
        int index = registroId != null ? Math.floorMod(registroId - 1, estados.length) : 0;
        return estados[index];
    }

    private String obtenerPrimeraFotoUrl(com.subastas.backend.entity.Producto producto) {
        if (producto == null || producto.getIdentificador() == null) {
            return null;
        }
        return fotoService.obtenerFotosProducto(producto.getIdentificador()).stream()
                .findFirst()
                .map(com.subastas.backend.dto.response.producto.ItemFotoProductoResponse::getUrl)
                .orElse(null);
    }

    @Override
    public com.subastas.backend.dto.response.metrics.UserBidsResponse obtenerBidsHistory(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Integer clienteId = usuario.getPersona().getIdentificador();
        
        java.util.List<com.subastas.backend.entity.Pujo> userPujos = pujoRepository.findByAsistenteClienteIdentificador(clienteId);
        java.util.Map<Integer, java.util.List<com.subastas.backend.entity.Pujo>> pujosPerItem = userPujos.stream()
            .filter(p -> p.getItem() != null && p.getItem().getIdentificador() != null)
            .collect(java.util.stream.Collectors.groupingBy(p -> p.getItem().getIdentificador()));
        java.util.Map<Integer, com.subastas.backend.entity.Pujo> maxPujoPerItem = userPujos.stream()
            .filter(p -> p.getItem() != null && p.getItem().getIdentificador() != null)
            .collect(java.util.stream.Collectors.toMap(
                p -> p.getItem().getIdentificador(),
                p -> p,
                (p1, p2) -> p1.getImporte().compareTo(p2.getImporte()) > 0 ? p1 : p2
            ));

        java.util.List<com.subastas.backend.dto.response.metrics.BidItemDto> items = new java.util.ArrayList<>();
        
        for (com.subastas.backend.entity.Pujo maxBid : maxPujoPerItem.values()) {
            com.subastas.backend.entity.ItemCatalogo item = maxBid.getItem();
            com.subastas.backend.entity.Producto producto = item.getProducto();
            com.subastas.backend.entity.Catalogo catalogo = item.getCatalogo();
            com.subastas.backend.entity.Subasta subasta = catalogo != null ? catalogo.getSubasta() : null;
            
            com.subastas.backend.dto.response.metrics.BidItemDto dto = new com.subastas.backend.dto.response.metrics.BidItemDto();
            dto.setId(maxBid.getIdentificador());
            
            String auctionStatus = subasta != null ? subasta.getEstado() : null;
            boolean auctionClosed = auctionStatus != null && !"abierta".equalsIgnoreCase(auctionStatus);
            dto.setStatus(auctionClosed ? "CERRADA" : "ACTIVA");
            dto.setAuctionStatus(auctionStatus);
            
            dto.setLotNumber(String.valueOf(item.getIdentificador()));
            dto.setCategory(subasta != null && subasta.getCategoria() != null ? subasta.getCategoria().toString().replace("_", " ") : "GENERAL");
            dto.setTitle(obtenerNombreProducto(producto));
            dto.setDescription(producto != null ? producto.getDescripcionCompleta() : "Sin descripción");
            dto.setPrice(maxBid.getImporte());
            
            if (subasta != null && subasta.getSubastador() != null && subasta.getSubastador().getPersona() != null) {
                dto.setAuctioneer(subasta.getSubastador().getPersona().getNombre());
            } else {
                dto.setAuctioneer("Vantage Fine Auctions");
            }
            
            if (subasta != null && subasta.getFecha() != null) {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy", new java.util.Locale("es", "ES"));
                dto.setAuctionDate(subasta.getFecha().format(formatter));
            } else {
                dto.setAuctionDate("Por definir");
            }
            
            dto.setImage(obtenerPrimeraFotoUrl(producto));
            java.util.List<com.subastas.backend.dto.response.puja.ItemHistorialPujaResponse> bidHistory = pujosPerItem
                .getOrDefault(item.getIdentificador(), java.util.Collections.emptyList())
                .stream()
                .sorted((a, b) -> {
                    java.time.LocalDateTime fechaA = a.getMetadata() != null ? a.getMetadata().getFecha() : null;
                    java.time.LocalDateTime fechaB = b.getMetadata() != null ? b.getMetadata().getFecha() : null;
                    if (fechaA != null && fechaB != null) {
                        return fechaB.compareTo(fechaA);
                    }
                    return b.getIdentificador().compareTo(a.getIdentificador());
                })
                .map(pujo -> {
                    com.subastas.backend.dto.response.puja.ItemHistorialPujaResponse bidDto = new com.subastas.backend.dto.response.puja.ItemHistorialPujaResponse();
                    bidDto.setBidId(pujo.getIdentificador());
                    bidDto.setImporte(pujo.getImporte());
                    bidDto.setFecha(pujo.getMetadata() != null ? pujo.getMetadata().getFecha() : null);
                    if (pujo.getAsistente() != null) {
                        bidDto.setBidderNumber(pujo.getAsistente().getIdentificador());
                        if (pujo.getAsistente().getCliente() != null && pujo.getAsistente().getCliente().getPersona() != null) {
                            bidDto.setBidderName(pujo.getAsistente().getCliente().getPersona().getNombre());
                        }
                    }
                    return bidDto;
                })
                .toList();
            dto.setBidHistory(bidHistory);
            
            items.add(dto);
        }
        
        items.sort((a, b) -> b.getId().compareTo(a.getId()));

        com.subastas.backend.dto.response.metrics.UserBidsResponse response = new com.subastas.backend.dto.response.metrics.UserBidsResponse();
        response.setStatus("OK");
        response.setMessage("Historial recuperado exitosamente");
        response.setItems(items);
        return response;
    }
}