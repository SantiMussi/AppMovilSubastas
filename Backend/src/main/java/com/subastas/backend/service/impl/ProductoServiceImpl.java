package com.subastas.backend.service.impl;

import com.subastas.backend.dto.request.AumentarSeguroRequest;
import com.subastas.backend.dto.response.producto.*;
import com.subastas.backend.entity.*;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.*;
import com.subastas.backend.service.FotoService;
import com.subastas.backend.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private static final String DEPOSITO_DEFAULT = "Depósito Central";
    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;
    private final FotoService fotoService;
    private final UsuarioRepository usuarioRepository;
    private final RegistroDeSubastaRepository registroDeSubastaRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;

    @Override
    public DetalleProductoResponse obtenerDetalle(Integer productId) {
        Producto product = obtenerProducto(productId);

        DetalleProductoResponse response = new DetalleProductoResponse();
        response.setProductId(product.getIdentificador());
        response.setDescripcion(product.getDescripcionCatalogo());
        response.setDescripcionCatalogo(product.getDescripcionCatalogo());
        response.setDescripcionCompleta(product.getDescripcionCompleta());
        response.setHistoria(product.getDescripcionCompleta());
        response.setFechaRegistro(product.getFecha());
        response.setDisponible(esSi(product.getDisponible()));
        response.setPhotosCount(fotoRepository.countByProductoIdentificador(productId));
        completarDatosSubastaYValores(response, product);

        if (product.getDuenio() != null) {
            DueñoProductoResponse owner = new DueñoProductoResponse();
            owner.setOwnerId(product.getDuenio().getIdentificador());
            if (product.getDuenio().getPersona() != null) {
                owner.setNombre(product.getDuenio().getPersona().getNombre());
            }
            response.setOwner(owner);
        }

        if (product.getRevisor() != null) {
            RevisionProductoResponse review = new RevisionProductoResponse();
            review.setReviewerId(product.getRevisor().getIdentificador());
            review.setReviewStatus("aprobado");
            response.setReview(review);
        }

        if (product.getSeguro() != null) {
            response.setInsurance(mapInsurance(product.getSeguro()));
        }

        return response;
    }

    @Override
    public FotosProductoResponse obtenerFotos(Integer productId) {
        obtenerProducto(productId);
        List<ItemFotoProductoResponse> photos = fotoService.obtenerFotosProducto(productId);

        FotosProductoResponse response = new FotosProductoResponse();
        response.setProductId(productId);
        response.setItems(photos);
        return response;
    }

    @Override
    public SeguroConsignedItemResponse obtenerSeguroProductoConsignado(Integer productId, String email) {
        Producto product = obtenerProductoConsignado(productId, email);
        SeguroProductoResponse insurance = mapInsurance(obtenerSeguro(product));

        SeguroConsignedItemResponse response = new SeguroConsignedItemResponse();
        response.setProductId(product.getIdentificador());
        response.setInsurance(insurance);
        return response;
    }

    @Override
    @Transactional
    public AumentoSeguroResponse solicitarAumentoSeguro(Integer productId, AumentarSeguroRequest request, String email) {
        if (request == null || request.getIncreaseAmount() == null) {
            throw new IllegalArgumentException("El importe de aumento es obligatorio");
        }
        if (request.getIncreaseAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El importe de aumento debe ser mayor a cero");
        }

        Producto product = obtenerProductoConsignado(productId, email);
        Seguro seguro = obtenerSeguro(product);
        BigDecimal nuevoImporte = seguro.getImporte().add(request.getIncreaseAmount());
        seguro.setImporte(nuevoImporte);

        AumentoSeguroResponse response = new AumentoSeguroResponse();
        response.setMessage("Solicitud de ampliación de póliza registrada");
        response.setNewRequestedAmount(nuevoImporte);
        return response;
    }

    @Override
    public UbicacionProductoResponse obtenerUbicacionProductoConsignado(Integer productId, String email) {
        Producto product = obtenerProductoConsignado(productId, email);

        UbicacionProductoResponse response = new UbicacionProductoResponse();
        response.setProductId(product.getIdentificador());
        response.setDeposito(DEPOSITO_DEFAULT);
        response.setSector(obtenerNombreSector(product));
        LocalDateTime ultimaActualizacion = product.getFecha() != null
                ? product.getFecha().atStartOfDay()
                : LocalDateTime.now();
        response.setUltimaActualizacion(ultimaActualizacion);
        return response;
    }

    private void completarDatosSubastaYValores(DetalleProductoResponse response, Producto product) {
        RegistroDeSubasta registro = registroDeSubastaRepository
                .findByProductoIdentificador(product.getIdentificador())
                .stream()
                .findFirst()
                .orElse(null);

        if (registro != null) {
            response.setPrecioAdjudicado(registro.getImporte());
            response.setComisionVenta(registro.getComision());
            if (registro.getSubasta() != null) {
                response.setSubastaId(registro.getSubasta().getIdentificador());
                if (registro.getSubasta().getCategoria() != null) {
                    response.setCategoriaSubasta(registro.getSubasta().getCategoria().toString());
                }
            }
        }

        ItemCatalogo itemCatalogo = itemCatalogoRepository
                .findByProductoIdentificador(product.getIdentificador())
                .stream()
                .findFirst()
                .orElse(null);
        if (itemCatalogo != null) {
            response.setPrecioBasePropuesto(itemCatalogo.getPrecioBase());
            if (response.getComisionVenta() == null) {
                response.setComisionVenta(itemCatalogo.getComision());
            }
        }

        if (product.getSeguro() != null) {
            response.setSeguroAdministracion("Included");
            response.setValorEstimado(product.getSeguro().getImporte());
        } else {
            response.setSeguroAdministracion("No incluido");
            response.setValorEstimado(response.getPrecioAdjudicado() != null
                    ? response.getPrecioAdjudicado()
                    : response.getPrecioBasePropuesto());
        }
    }

    private Producto obtenerProducto(Integer productId) {
        return productoRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + productId));
    }

    private Producto obtenerProductoConsignado(Integer productId, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Producto product = obtenerProducto(productId);
        Integer personaId = usuario.getPersona() != null ? usuario.getPersona().getIdentificador() : null;
        Integer duenioId = product.getDuenio() != null ? product.getDuenio().getIdentificador() : null;
        if (personaId == null || !personaId.equals(duenioId)) {
            throw new ResourceNotFoundException("Producto consignado no encontrado con id: " + productId);
        }
        return product;
    }

    private Seguro obtenerSeguro(Producto product) {
        if (product.getSeguro() == null) {
            throw new ResourceNotFoundException(
                    "Seguro no encontrado para el producto con id: " + product.getIdentificador());
        }
        return product.getSeguro();
    }

    private SeguroProductoResponse mapInsurance(Seguro seguro) {
        SeguroProductoResponse insurance = new SeguroProductoResponse();
        insurance.setNroPoliza(seguro.getNroPoliza());
        insurance.setCompania(seguro.getCompania());
        insurance.setPolizaCombinada(seguro.getPolizaCombinada());
        insurance.setImporte(seguro.getImporte());
        return insurance;
    }

    private String obtenerNombreSector(Producto product) {
        if (product.getRevisor() == null || product.getRevisor().getSector() == null) {
            return null;
        }
        return product.getRevisor().getSector().getNombreSector();
    }

    private boolean esSi(String value) {
        return "si".equalsIgnoreCase(value);
    }
}