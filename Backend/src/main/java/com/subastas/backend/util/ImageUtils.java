package com.subastas.backend.util;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public class ImageUtils {

    // Método estático para procesar y validar cualquier imagen que llegue
    public static byte[] procesarImagen(MultipartFile archivo) throws IOException {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo de imagen no puede estar vacío");
        }
        
        String contentType = archivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen válida (JPG, PNG, etc.)");
        }

        // Retorna los bytes listos para guardar en la base de datos
        return archivo.getBytes();
    }
}