-- ================================================================
-- CARGA MASIVA DE SUBASTAS DEMO
-- Agrega 30 subastas en distintos estados, cada una con catálogo,
-- producto, item de catálogo y la misma imagen PNG 1x1 en base64.
-- Requiere haber ejecutado las queries base de personas/empleados y
-- CreacionSubastas.sql para disponer de subastador y dueños demo.
-- ================================================================

USE subastas;

SET @foto_placeholder_base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
SET @foto_placeholder = FROM_BASE64(@foto_placeholder_base64);

SET @id_subastador = (SELECT identificador FROM personas WHERE documento = '41000001' LIMIT 1);
SET @id_duenio1    = (SELECT identificador FROM personas WHERE documento = '42000001' LIMIT 1);
SET @id_duenio2    = (SELECT identificador FROM personas WHERE documento = '43000001' LIMIT 1);

CREATE TEMPORARY TABLE IF NOT EXISTS tmp_subastas_masivas (
    seq INT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(10) NOT NULL,
    subastador INT NOT NULL,
    ubicacion VARCHAR(350) NOT NULL,
    capacidad_asistentes INT NOT NULL,
    tiene_deposito VARCHAR(2) NOT NULL,
    seguridad_propia VARCHAR(2) NOT NULL,
    categoria VARCHAR(10) NOT NULL,
    nombre VARCHAR(120) NOT NULL
);

TRUNCATE TABLE tmp_subastas_masivas;

INSERT INTO tmp_subastas_masivas
(seq, fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria, nombre)
VALUES
(1, '2026-11-01', '18:00:00', 'abierta', @id_subastador, 'Centro Cultural Recoleta, Junín 1930, CABA', 120, 'si', 'si', 'comun', 'Colección de Arte Urbano'),
(2, '2026-11-02', '19:30:00', 'abierta', @id_subastador, 'Hotel Madero, Rosario Vera Peñaloza 360, CABA', 90, 'si', 'si', 'especial', 'Joyas de Autor'),
(3, '2026-11-03', '16:00:00', 'abierta', @id_subastador, 'La Rural, Av. Sarmiento 2704, CABA', 250, 'si', 'si', 'platino', 'Autos Clásicos'),
(4, '2026-11-04', '20:00:00', 'abierta', @id_subastador, 'Bodega Vistalba, Luján de Cuyo, Mendoza', 80, 'si', 'no', 'oro', 'Vinos de Guarda'),
(5, '2026-11-05', '17:30:00', 'abierta', @id_subastador, 'Usina del Arte, Agustín Caffarena 1, CABA', 140, 'no', 'si', 'plata', 'Diseño Escandinavo'),
(6, '2026-11-06', '18:15:00', 'abierta', @id_subastador, 'Museo Larreta, Juramento 2291, CABA', 70, 'no', 'si', 'comun', 'Fotografía Histórica'),
(7, '2026-11-07', '19:00:00', 'abierta', @id_subastador, 'Teatro San Martín, Av. Corrientes 1530, CABA', 160, 'si', 'si', 'especial', 'Instrumentos Vintage'),
(8, '2026-11-08', '15:30:00', 'abierta', @id_subastador, 'Biblioteca Nacional, Agüero 2502, CABA', 100, 'no', 'si', 'oro', 'Libros Raros'),
(9, '2026-11-09', '20:30:00', 'abierta', @id_subastador, 'Four Seasons, Posadas 1086, CABA', 60, 'si', 'si', 'platino', 'Alta Relojería Suiza'),
(10, '2026-11-10', '18:45:00', 'abierta', @id_subastador, 'MALBA, Av. Figueroa Alcorta 3415, CABA', 110, 'no', 'si', 'plata', 'Cerámica Contemporánea'),
(11, '2026-11-11', '17:00:00', 'abierta', @id_subastador, 'Palacio Paz, Av. Santa Fe 750, CABA', 130, 'si', 'si', 'oro', 'Numismática Premium'),
(12, '2026-11-12', '19:15:00', 'abierta', @id_subastador, 'Distrito Arenales, Arenales 1239, CABA', 95, 'no', 'si', 'especial', 'Moda de Archivo'),
(13, '2026-11-13', '18:30:00', 'abierta', @id_subastador, 'Palacio Duhau, Av. Alvear 1661, CABA', 85, 'si', 'si', 'platino', 'Muebles Art Decó'),
(14, '2026-11-14', '16:45:00', 'abierta', @id_subastador, 'Centro Metropolitano de Diseño, Algarrobo 1041, CABA', 180, 'no', 'no', 'comun', 'Cómics y Originales'),
(15, '2026-11-15', '17:45:00', 'abierta', @id_subastador, 'Jardín Japonés, Av. Casares 3450, CABA', 150, 'si', 'si', 'plata', 'Esculturas de Jardín'),
(16, '2026-11-16', '18:00:00', 'carrada', @id_subastador, 'Cierre Test 01, San Telmo, CABA', 120, 'si', 'si', 'especial', 'Arte Latinoamericano'),
(17, '2026-11-17', '19:30:00', 'carrada', @id_subastador, 'Cierre Test 02, Palermo, CABA', 90, 'si', 'no', 'oro', 'Platería Criolla'),
(18, '2026-11-18', '16:00:00', 'carrada', @id_subastador, 'Cierre Test 03, Retiro, CABA', 75, 'no', 'si', 'comun', 'Mapas Antiguos'),
(19, '2026-11-19', '20:00:00', 'carrada', @id_subastador, 'Cierre Test 04, Belgrano, CABA', 105, 'si', 'si', 'plata', 'Tapices Orientales'),
(20, '2026-11-20', '17:30:00', 'carrada', @id_subastador, 'Cierre Test 05, Puerto Madero, CABA', 65, 'no', 'si', 'platino', 'Arte Digital Certificado'),
(21, '2026-11-21', '18:15:00', 'carrada', @id_subastador, 'Cierre Test 06, Recoleta, CABA', 115, 'si', 'si', 'especial', 'Cristalería Europea'),
(22, '2026-11-22', '19:00:00', 'carrada', @id_subastador, 'Cierre Test 07, Caballito, CABA', 200, 'no', 'no', 'comun', 'Juguetes de Colección'),
(23, '2026-11-23', '15:30:00', 'carrada', @id_subastador, 'Cierre Test 08, Vicente López, Buenos Aires', 170, 'si', 'si', 'oro', 'Motos Históricas'),
(24, '2026-11-24', '20:30:00', 'carrada', @id_subastador, 'Cierre Test 09, Tigre, Buenos Aires', 145, 'si', 'si', 'plata', 'Objetos Navales'),
(25, '2026-11-25', '18:45:00', 'carrada', @id_subastador, 'Cierre Test 10, La Plata, Buenos Aires', 100, 'no', 'si', 'especial', 'Pintura Rioplatense'),
(26, '2026-11-26', '17:00:00', 'carrada', @id_subastador, 'Cierre Test 11, Córdoba Capital', 90, 'si', 'si', 'oro', 'Minerales y Gemas'),
(27, '2026-11-27', '19:15:00', 'carrada', @id_subastador, 'Cierre Test 12, Salta Capital', 80, 'si', 'si', 'platino', 'Arte Sacro'),
(28, '2026-11-28', '18:30:00', 'carrada', @id_subastador, 'Cierre Test 13, Rosario, Santa Fe', 150, 'no', 'si', 'plata', 'Diseño Industrial'),
(29, '2026-12-01', '16:45:00', 'carrada', @id_subastador, 'Cierre Test 14, Mar del Plata, Buenos Aires', 220, 'no', 'no', 'comun', 'Colección Pop'),
(30, '2026-12-02', '17:45:00', 'carrada', @id_subastador, 'Cierre Test 15, Bahía Blanca, Buenos Aires', 110, 'si', 'si', 'especial', 'Militaria Histórica');

INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria)
SELECT fecha, hora, estado, subastador, CONCAT('[DEMO MASIVA] ', ubicacion), capacidad_asistentes, tiene_deposito, seguridad_propia, categoria
FROM tmp_subastas_masivas
WHERE NOT EXISTS (
    SELECT 1
    FROM subastas s
    WHERE s.ubicacion = CONCAT('[DEMO MASIVA] ', tmp_subastas_masivas.ubicacion)
);

CREATE TEMPORARY TABLE IF NOT EXISTS tmp_productos_masivos (
    seq INT PRIMARY KEY,
    fecha DATE NOT NULL,
    disponible VARCHAR(2) NOT NULL,
    descripcion_catalogo VARCHAR(500) NOT NULL,
    descripcion_completa VARCHAR(300) NOT NULL,
    revisor INT NOT NULL,
    duenio INT NOT NULL,
    precio_base DECIMAL(18,2) NOT NULL,
    comision DECIMAL(18,2) NOT NULL
);

TRUNCATE TABLE tmp_productos_masivos;

INSERT INTO tmp_productos_masivos
(seq, fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio, precio_base, comision)
VALUES
(1, '2026-11-01', 'si', 'Lote demo Colección de Arte Urbano', 'Producto de prueba para la subasta demo "Colección de Arte Urbano". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 12, CASE WHEN MOD(1, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 17500, 1750),
(2, '2026-11-02', 'si', 'Lote demo Joyas de Autor', 'Producto de prueba para la subasta demo "Joyas de Autor". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 13, CASE WHEN MOD(2, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 25000, 2500),
(3, '2026-11-03', 'si', 'Lote demo Autos Clásicos', 'Producto de prueba para la subasta demo "Autos Clásicos". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 14, CASE WHEN MOD(3, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 32500, 3250),
(4, '2026-11-04', 'si', 'Lote demo Vinos de Guarda', 'Producto de prueba para la subasta demo "Vinos de Guarda". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 15, CASE WHEN MOD(4, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 40000, 4000),
(5, '2026-11-05', 'si', 'Lote demo Diseño Escandinavo', 'Producto de prueba para la subasta demo "Diseño Escandinavo". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 11, CASE WHEN MOD(5, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 47500, 4750),
(6, '2026-11-06', 'si', 'Lote demo Fotografía Histórica', 'Producto de prueba para la subasta demo "Fotografía Histórica". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 12, CASE WHEN MOD(6, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 55000, 5500),
(7, '2026-11-07', 'si', 'Lote demo Instrumentos Vintage', 'Producto de prueba para la subasta demo "Instrumentos Vintage". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 13, CASE WHEN MOD(7, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 62500, 6250),
(8, '2026-11-08', 'si', 'Lote demo Libros Raros', 'Producto de prueba para la subasta demo "Libros Raros". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 14, CASE WHEN MOD(8, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 70000, 7000),
(9, '2026-11-09', 'si', 'Lote demo Alta Relojería Suiza', 'Producto de prueba para la subasta demo "Alta Relojería Suiza". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 15, CASE WHEN MOD(9, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 77500, 7750),
(10, '2026-11-10', 'si', 'Lote demo Cerámica Contemporánea', 'Producto de prueba para la subasta demo "Cerámica Contemporánea". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 11, CASE WHEN MOD(10, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 85000, 8500),
(11, '2026-11-11', 'si', 'Lote demo Numismática Premium', 'Producto de prueba para la subasta demo "Numismática Premium". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 12, CASE WHEN MOD(11, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 92500, 9250),
(12, '2026-11-12', 'si', 'Lote demo Moda de Archivo', 'Producto de prueba para la subasta demo "Moda de Archivo". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 13, CASE WHEN MOD(12, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 100000, 10000),
(13, '2026-11-13', 'si', 'Lote demo Muebles Art Decó', 'Producto de prueba para la subasta demo "Muebles Art Decó". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 14, CASE WHEN MOD(13, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 107500, 10750),
(14, '2026-11-14', 'si', 'Lote demo Cómics y Originales', 'Producto de prueba para la subasta demo "Cómics y Originales". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 15, CASE WHEN MOD(14, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 115000, 11500),
(15, '2026-11-15', 'si', 'Lote demo Esculturas de Jardín', 'Producto de prueba para la subasta demo "Esculturas de Jardín". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 11, CASE WHEN MOD(15, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 122500, 12250),
(16, '2026-11-16', 'si', 'Lote demo Arte Latinoamericano', 'Producto de prueba para la subasta demo "Arte Latinoamericano". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 12, CASE WHEN MOD(16, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 130000, 13000),
(17, '2026-11-17', 'si', 'Lote demo Platería Criolla', 'Producto de prueba para la subasta demo "Platería Criolla". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 13, CASE WHEN MOD(17, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 137500, 13750),
(18, '2026-11-18', 'si', 'Lote demo Mapas Antiguos', 'Producto de prueba para la subasta demo "Mapas Antiguos". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 14, CASE WHEN MOD(18, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 145000, 14500),
(19, '2026-11-19', 'si', 'Lote demo Tapices Orientales', 'Producto de prueba para la subasta demo "Tapices Orientales". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 15, CASE WHEN MOD(19, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 152500, 15250),
(20, '2026-11-20', 'si', 'Lote demo Arte Digital Certificado', 'Producto de prueba para la subasta demo "Arte Digital Certificado". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 11, CASE WHEN MOD(20, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 160000, 16000),
(21, '2026-11-21', 'si', 'Lote demo Cristalería Europea', 'Producto de prueba para la subasta demo "Cristalería Europea". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 12, CASE WHEN MOD(21, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 167500, 16750),
(22, '2026-11-22', 'si', 'Lote demo Juguetes de Colección', 'Producto de prueba para la subasta demo "Juguetes de Colección". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 13, CASE WHEN MOD(22, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 175000, 17500),
(23, '2026-11-23', 'si', 'Lote demo Motos Históricas', 'Producto de prueba para la subasta demo "Motos Históricas". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 14, CASE WHEN MOD(23, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 182500, 18250),
(24, '2026-11-24', 'si', 'Lote demo Objetos Navales', 'Producto de prueba para la subasta demo "Objetos Navales". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 15, CASE WHEN MOD(24, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 190000, 19000),
(25, '2026-11-25', 'si', 'Lote demo Pintura Rioplatense', 'Producto de prueba para la subasta demo "Pintura Rioplatense". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 11, CASE WHEN MOD(25, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 197500, 19750),
(26, '2026-11-26', 'si', 'Lote demo Minerales y Gemas', 'Producto de prueba para la subasta demo "Minerales y Gemas". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 12, CASE WHEN MOD(26, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 205000, 20500),
(27, '2026-11-27', 'si', 'Lote demo Arte Sacro', 'Producto de prueba para la subasta demo "Arte Sacro". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 13, CASE WHEN MOD(27, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 212500, 21250),
(28, '2026-11-28', 'si', 'Lote demo Diseño Industrial', 'Producto de prueba para la subasta demo "Diseño Industrial". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 14, CASE WHEN MOD(28, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 220000, 22000),
(29, '2026-12-01', 'si', 'Lote demo Colección Pop', 'Producto de prueba para la subasta demo "Colección Pop". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 15, CASE WHEN MOD(29, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 227500, 22750),
(30, '2026-12-02', 'si', 'Lote demo Militaria Histórica', 'Producto de prueba para la subasta demo "Militaria Histórica". Incluye descripción completa, procedencia simulada y foto placeholder genérica.', 11, CASE WHEN MOD(30, 2) = 0 THEN @id_duenio1 ELSE @id_duenio2 END, 235000, 23500);

INSERT INTO productos (fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio)
SELECT fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio
FROM tmp_productos_masivos
WHERE NOT EXISTS (
    SELECT 1
    FROM productos p
    WHERE p.descripcion_catalogo = tmp_productos_masivos.descripcion_catalogo
);

INSERT INTO fotos (producto, foto)
SELECT p.identificador, @foto_placeholder
FROM tmp_productos_masivos t
JOIN productos p ON p.descripcion_catalogo = t.descripcion_catalogo
WHERE NOT EXISTS (
    SELECT 1
    FROM fotos f
    WHERE f.producto = p.identificador
);

INSERT INTO catalogos (descripcion, subasta, responsable)
SELECT CONCAT('Catálogo demo masivo — ', t.nombre), s.identificador, 14
FROM tmp_subastas_masivas t
JOIN subastas s ON s.ubicacion = CONCAT('[DEMO MASIVA] ', t.ubicacion)
WHERE NOT EXISTS (
    SELECT 1
    FROM catalogos c
    WHERE c.descripcion = CONCAT('Catálogo demo masivo — ', t.nombre)
);

INSERT INTO items_catalogo (catalogo, producto, precio_base, comision, subastado)
SELECT c.identificador, p.identificador, t.precio_base, t.comision, IF(s.estado = 'carrada', 'si', 'no')
FROM tmp_productos_masivos t
JOIN productos p ON p.descripcion_catalogo = t.descripcion_catalogo
JOIN tmp_subastas_masivas ts ON ts.seq = t.seq
JOIN subastas s ON s.ubicacion = CONCAT('[DEMO MASIVA] ', ts.ubicacion)
JOIN catalogos c ON c.subasta = s.identificador AND c.descripcion = CONCAT('Catálogo demo masivo — ', ts.nombre)
WHERE NOT EXISTS (
    SELECT 1
    FROM items_catalogo i
    WHERE i.catalogo = c.identificador
      AND i.producto = p.identificador
);

DROP TEMPORARY TABLE IF EXISTS tmp_productos_masivos;
DROP TEMPORARY TABLE IF EXISTS tmp_subastas_masivas;

SELECT 'subastas demo masivas' AS tabla, estado, COUNT(*) AS total
FROM subastas
WHERE ubicacion LIKE '[DEMO MASIVA]%'
GROUP BY estado
UNION ALL
SELECT 'fotos demo masivas', 'todas', COUNT(*)
FROM fotos f
JOIN productos p ON p.identificador = f.producto
WHERE p.descripcion_catalogo LIKE 'Lote demo %';