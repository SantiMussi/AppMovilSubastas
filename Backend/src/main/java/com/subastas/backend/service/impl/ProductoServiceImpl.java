package com.subastas.backend.service.impl;

import com.subastas.backend.dto.response.producto.DetalleProductoResponse;
import com.subastas.backend.dto.response.producto.DueñoProductoResponse;
import com.subastas.backend.dto.response.producto.FotosProductoResponse;
import com.subastas.backend.dto.response.producto.ItemFotoProductoResponse;
import com.subastas.backend.dto.response.producto.RevisionProductoResponse;
import com.subastas.backend.dto.response.producto.SeguroProductoResponse;
import com.subastas.backend.entity.Foto;
import com.subastas.backend.entity.Producto;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.FotoRepository;
import com.subastas.backend.repository.ProductoRepository;
import com.subastas.backend.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;

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
            SeguroProductoResponse insurance = new SeguroProductoResponse();
            insurance.setNroPoliza(product.getSeguro().getNroPoliza());
            insurance.setCompania(product.getSeguro().getCompania());
            insurance.setPolizaCombinada(product.getSeguro().getPolizaCombinada());
            insurance.setImporte(product.getSeguro().getImporte());
            response.setInsurance(insurance);
        }

        return response;
    }

    @Override
    public FotosProductoResponse obtenerFotos(Integer productId) {
        obtenerProducto(productId);
        List<ItemFotoProductoResponse> photos = fotoRepository.findByProductoIdentificadorOrderByIdentificadorAsc(productId)
                .stream()
                .map(this::mapPhoto)
                .toList();

        FotosProductoResponse response = new FotosProductoResponse();
        response.setProductId(productId);
        response.setItems(photos);
        return response;
    }

    private Producto obtenerProducto(Integer productId) {
        return productoRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + productId));
    }

    private ItemFotoProductoResponse mapPhoto(Foto foto) {
        ItemFotoProductoResponse response = new ItemFotoProductoResponse();
        response.setPhotoId(foto.getIdentificador());
        response.setUrl(buildPhotoUrl(foto));
        return response;
    }

    private String buildPhotoUrl(Foto foto) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/products/photos/{photoId}/content")
                .buildAndExpand(foto.getIdentificador())
                .toUriString();
    }

    private boolean esSi(String value) {
        return "si".equalsIgnoreCase(value);
    }
}