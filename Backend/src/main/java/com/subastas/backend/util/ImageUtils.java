package com.subastas.backend.util;

import org.springframework.web.multipart.MultipartFile;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;

public class ImageUtils {

    private static final int MAX_BLOB_SIZE = 65000;

    public static byte[] procesarImagen(MultipartFile archivo) throws IOException {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo de imagen no puede estar vacío");
        }

        String contentType = archivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen válida (JPG, PNG, etc.)");
        }

        byte[] originalBytes = archivo.getBytes();
        if (originalBytes.length <= MAX_BLOB_SIZE) {
            return originalBytes;
        }

        BufferedImage originalImage = ImageIO.read(archivo.getInputStream());
        if (originalImage == null) {
            throw new IllegalArgumentException("No se pudo leer la imagen");
        }

        return compressImage(originalImage, MAX_BLOB_SIZE);
    }

    private static byte[] compressImage(BufferedImage image, int maxSize) throws IOException {
        int targetWidth = 400;

        while (targetWidth >= 100) {
            int targetHeight = (int) (image.getHeight() * ((double) targetWidth / image.getWidth()));

            Image resultingImage = image.getScaledInstance(targetWidth, targetHeight, Image.SCALE_SMOOTH);
            BufferedImage outputImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);

            Graphics2D g2d = outputImage.createGraphics();
            g2d.setColor(java.awt.Color.WHITE);
            g2d.fillRect(0, 0, targetWidth, targetHeight);
            g2d.drawImage(resultingImage, 0, 0, null);
            g2d.dispose();

            float quality = 0.9f;
            byte[] imageBytes;

            do {
                imageBytes = writeJpegWithQuality(outputImage, quality);
                quality -= 0.2f;
            } while (imageBytes.length > maxSize && quality > 0.1f);

            if (imageBytes.length <= maxSize) {
                return imageBytes;
            }

            targetWidth /= 2;
        }

        throw new IllegalArgumentException(
                "La imagen es demasiado compleja para ser comprimida al tamaño requerido por la base de datos.");
    }

    private static byte[] writeJpegWithQuality(BufferedImage image, float quality) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext())
            throw new IllegalStateException("No writers found");

        ImageWriter writer = writers.next();
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {
            writer.setOutput(ios);
            ImageWriteParam param = writer.getDefaultWriteParam();
            if (param.canWriteCompressed()) {
                param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                param.setCompressionQuality(quality);
            }
            writer.write(null, new IIOImage(image, null, null), param);
        } finally {
            writer.dispose();
        }
        return baos.toByteArray();
    }
}