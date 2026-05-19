package com.subastas.backend.service.impl;

import com.subastas.backend.dto.response.ProductDetailResponse;
import com.subastas.backend.dto.response.ProductInsuranceResponse;
import com.subastas.backend.dto.response.ProductOwnerResponse;
import com.subastas.backend.dto.response.ProductPhotoItemResponse;
import com.subastas.backend.dto.response.ProductPhotosResponse;
import com.subastas.backend.dto.response.ProductReviewResponse;
import com.subastas.backend.entity.Foto;
import com.subastas.backend.entity.Producto;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.FotoRepository;
import com.subastas.backend.repository.ProductoRepository;
import com.subastas.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;

    @Override
    public ProductDetailResponse obtenerDetalle(Integer productId) {
        Producto product = obtenerProducto(productId);

        ProductDetailResponse response = new ProductDetailResponse();
        response.setProductId(product.getIdentificador());
        response.setDescripcion(product.getDescripcionCatalogo());
        response.setDescripcionCatalogo(product.getDescripcionCatalogo());
        response.setDescripcionCompleta(product.getDescripcionCompleta());
        response.setHistoria(product.getDescripcionCompleta());
        response.setFechaRegistro(product.getFecha());
        response.setDisponible(esSi(product.getDisponible()));
        response.setPhotosCount(fotoRepository.countByProductoIdentificador(productId));

        if (product.getDuenio() != null) {
            ProductOwnerResponse owner = new ProductOwnerResponse();
            owner.setOwnerId(product.getDuenio().getIdentificador());
            if (product.getDuenio().getPersona() != null) {
                owner.setNombre(product.getDuenio().getPersona().getNombre());
            }
            response.setOwner(owner);
        }

        if (product.getRevisor() != null) {
            ProductReviewResponse review = new ProductReviewResponse();
            review.setReviewerId(product.getRevisor().getIdentificador());
            review.setReviewStatus("aprobado");
            response.setReview(review);
        }

        if (product.getSeguro() != null) {
            ProductInsuranceResponse insurance = new ProductInsuranceResponse();
            insurance.setNroPoliza(product.getSeguro().getNroPoliza());
            insurance.setCompania(product.getSeguro().getCompania());
            insurance.setPolizaCombinada(product.getSeguro().getPolizaCombinada());
            insurance.setImporte(product.getSeguro().getImporte());
            response.setInsurance(insurance);
        }

        return response;
    }

    @Override
    public ProductPhotosResponse obtenerFotos(Integer productId) {
        obtenerProducto(productId);
        List<ProductPhotoItemResponse> photos = fotoRepository.findByProductoIdentificadorOrderByIdentificadorAsc(productId)
                .stream()
                .map(this::mapPhoto)
                .toList();

        ProductPhotosResponse response = new ProductPhotosResponse();
        response.setProductId(productId);
        response.setItems(photos);
        return response;
    }

    private Producto obtenerProducto(Integer productId) {
        return productoRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + productId));
    }

    private ProductPhotoItemResponse mapPhoto(Foto foto) {
        ProductPhotoItemResponse response = new ProductPhotoItemResponse();
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