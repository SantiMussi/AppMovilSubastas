package com.subastas.backend.service.impl;

import com.subastas.backend.dto.response.producto.ItemFotoProductoResponse;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.FotoRepository;
import com.subastas.backend.service.FotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class FotoServiceImpl implements FotoService {

    private final FotoRepository fotoRepository;

    @Override
    public List<ItemFotoProductoResponse> obtenerFotosProducto(Integer productId) {
        return fotoRepository.findIdsByProductoIdentificadorOrderByIdentificadorAsc(productId)
                .stream()
                .map(this::mapPhoto)
                .toList();
    }

    @Override
    public Map<Integer, String> obtenerUrlsPrimerasFotos(Set<Integer> productIds) {
        if (productIds == null || productIds.isEmpty()) return Map.of();
        return fotoRepository.findFirstIdsByProductoIdentificadorIn(productIds).stream()
                .collect(Collectors.toMap(
                        FotoRepository.FotoPrincipalProjection::getProductoId,
                        foto -> buildPhotoUrl(foto.getPhotoId())));
    }

    @Override
    public ContenidoFoto obtenerContenido(Integer photoId) {
        byte[] bytes = fotoRepository.findContentByIdentificador(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Foto no encontrada con id: " + photoId));
        if (bytes.length == 0) {
            throw new ResourceNotFoundException("La foto " + photoId + " no contiene datos");
        }
        return new ContenidoFoto(bytes, detectContentType(bytes), DigestUtils.md5DigestAsHex(bytes));
    }

    private ItemFotoProductoResponse mapPhoto(Integer photoId) {
        ItemFotoProductoResponse response = new ItemFotoProductoResponse();
        response.setPhotoId(photoId);
        response.setUrl(buildPhotoUrl(photoId));
        return response;
    }

    private String buildPhotoUrl(Integer photoId) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/products/photos/{photoId}/content")
                .buildAndExpand(photoId)
                .toUriString();
    }

    static String detectContentType(byte[] bytes) {
        if (startsWith(bytes, 0xFF, 0xD8, 0xFF)) return "image/jpeg";
        if (startsWith(bytes, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) return "image/png";
        if (startsWithAscii(bytes, "GIF87a") || startsWithAscii(bytes, "GIF89a")) return "image/gif";
        if (bytes.length >= 12 && startsWithAscii(bytes, "RIFF") && asciiAt(bytes, 8, "WEBP")) return "image/webp";
        if (startsWithAscii(bytes, "BM")) return "image/bmp";
        if (startsWith(bytes, 0x00, 0x00, 0x00) && bytes.length >= 12
                && (asciiAt(bytes, 4, "ftypavif") || asciiAt(bytes, 4, "ftypavis"))) return "image/avif";
        return "application/octet-stream";
    }

    private static boolean startsWith(byte[] bytes, int... signature) {
        if (bytes.length < signature.length) return false;
        for (int i = 0; i < signature.length; i++) {
            if (Byte.toUnsignedInt(bytes[i]) != signature[i]) return false;
        }
        return true;
    }

    private static boolean startsWithAscii(byte[] bytes, String value) {
        return asciiAt(bytes, 0, value);
    }

    private static boolean asciiAt(byte[] bytes, int offset, String value) {
        byte[] expected = value.getBytes(StandardCharsets.US_ASCII);
        if (bytes.length < offset + expected.length) return false;
        for (int i = 0; i < expected.length; i++) {
            if (bytes[offset + i] != expected[i]) return false;
        }
        return true;
    }
}