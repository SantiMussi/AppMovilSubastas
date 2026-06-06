-- ================================================================
-- CARGA EXTRA DE SUBASTAS DEMO
-- Agrega 5 subastas:
-- 1 hoy ahora, 1 mañana, 1 semana que viene, 2 en el pasado
-- ================================================================

USE subastas;

SET @foto_placeholder_base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
SET @foto_placeholder = FROM_BASE64(@foto_placeholder_base64);

SET @id_subastador = (SELECT identificador FROM personas WHERE documento = '41000001' LIMIT 1);
SET @id_duenio1    = (SELECT identificador FROM personas WHERE documento = '42000001' LIMIT 1);
SET @id_duenio2    = (SELECT identificador FROM personas WHERE documento = '43000001' LIMIT 1);

CREATE TEMPORARY TABLE IF NOT EXISTS tmp_subastas_extra (
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

TRUNCATE TABLE tmp_subastas_extra;

INSERT INTO tmp_subastas_extra
(seq, fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria, nombre)
VALUES
-- Hoy, ahora
(1, CURDATE(), CURTIME(), 'abierta', @id_subastador,
 'Evento Ahora Test, Microcentro, CABA', 100, 'si', 'si', 'comun',
 'Subasta Hoy Ahora'),

-- Mañana
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', 'abierta', @id_subastador,
 'Evento Mañana Test, Palermo, CABA', 120, 'si', 'si', 'especial',
 'Subasta Mañana'),

-- Semana que viene
(3, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '19:30:00', 'abierta', @id_subastador,
 'Evento Semana Próxima Test, Recoleta, CABA', 150, 'no', 'si', 'oro',
 'Subasta Semana que Viene'),

-- Pasado 1
(4, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '17:00:00', 'carrada', @id_subastador,
 'Evento Pasado Test 01, San Telmo, CABA', 80, 'si', 'no', 'plata',
 'Subasta Pasada Reciente'),

-- Pasado 2
(5, DATE_SUB(CURDATE(), INTERVAL 15 DAY), '16:30:00', 'carrada', @id_subastador,
 'Evento Pasado Test 02, Belgrano, CABA', 90, 'no', 'si', 'platino',
 'Subasta Pasada Antigua');

INSERT INTO subastas
(fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria)
SELECT
    fecha,
    hora,
    estado,
    subastador,
    CONCAT('[DEMO EXTRA FECHAS] ', ubicacion),
    capacidad_asistentes,
    tiene_deposito,
    seguridad_propia,
    categoria
FROM tmp_subastas_extra t
WHERE NOT EXISTS (
    SELECT 1
    FROM subastas s
    WHERE s.ubicacion = CONCAT('[DEMO EXTRA FECHAS] ', t.ubicacion)
);

CREATE TEMPORARY TABLE IF NOT EXISTS tmp_productos_extra (
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

TRUNCATE TABLE tmp_productos_extra;

INSERT INTO tmp_productos_extra
(seq, fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio, precio_base, comision)
VALUES
(1, CURDATE(), 'si',
 'Lote demo extra Subasta Hoy Ahora',
 'Producto de prueba para la subasta demo extra "Subasta Hoy Ahora". Incluye foto placeholder genérica.',
 12, @id_duenio1, 30000, 3000),

(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'si',
 'Lote demo extra Subasta Mañana',
 'Producto de prueba para la subasta demo extra "Subasta Mañana". Incluye foto placeholder genérica.',
 13, @id_duenio2, 45000, 4500),

(3, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'si',
 'Lote demo extra Subasta Semana que Viene',
 'Producto de prueba para la subasta demo extra "Subasta Semana que Viene". Incluye foto placeholder genérica.',
 14, @id_duenio1, 60000, 6000),

(4, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'si',
 'Lote demo extra Subasta Pasada Reciente',
 'Producto de prueba para la subasta demo extra "Subasta Pasada Reciente". Incluye foto placeholder genérica.',
 15, @id_duenio2, 75000, 7500),

(5, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'si',
 'Lote demo extra Subasta Pasada Antigua',
 'Producto de prueba para la subasta demo extra "Subasta Pasada Antigua". Incluye foto placeholder genérica.',
 11, @id_duenio1, 90000, 9000);

INSERT INTO productos
(fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio)
SELECT
    fecha,
    disponible,
    descripcion_catalogo,
    descripcion_completa,
    revisor,
    duenio
FROM tmp_productos_extra t
WHERE NOT EXISTS (
    SELECT 1
    FROM productos p
    WHERE p.descripcion_catalogo = t.descripcion_catalogo
);

INSERT INTO fotos
(producto, foto)
SELECT
    p.identificador,
    @foto_placeholder
FROM tmp_productos_extra t
JOIN productos p
    ON p.descripcion_catalogo = t.descripcion_catalogo
WHERE NOT EXISTS (
    SELECT 1
    FROM fotos f
    WHERE f.producto = p.identificador
);

INSERT INTO catalogos
(descripcion, subasta, responsable)
SELECT
    CONCAT('Catálogo demo extra fechas — ', t.nombre),
    s.identificador,
    14
FROM tmp_subastas_extra t
JOIN subastas s
    ON s.ubicacion = CONCAT('[DEMO EXTRA FECHAS] ', t.ubicacion)
WHERE NOT EXISTS (
    SELECT 1
    FROM catalogos c
    WHERE c.descripcion = CONCAT('Catálogo demo extra fechas — ', t.nombre)
);

INSERT INTO items_catalogo
(catalogo, producto, precio_base, comision, subastado)
SELECT
    c.identificador,
    p.identificador,
    tp.precio_base,
    tp.comision,
    IF(s.estado = 'carrada', 'si', 'no')
FROM tmp_productos_extra tp
JOIN productos p
    ON p.descripcion_catalogo = tp.descripcion_catalogo
JOIN tmp_subastas_extra ts
    ON ts.seq = tp.seq
JOIN subastas s
    ON s.ubicacion = CONCAT('[DEMO EXTRA FECHAS] ', ts.ubicacion)
JOIN catalogos c
    ON c.subasta = s.identificador
   AND c.descripcion = CONCAT('Catálogo demo extra fechas — ', ts.nombre)
WHERE NOT EXISTS (
    SELECT 1
    FROM items_catalogo i
    WHERE i.catalogo = c.identificador
      AND i.producto = p.identificador
);

DROP TEMPORARY TABLE IF EXISTS tmp_productos_extra;
DROP TEMPORARY TABLE IF EXISTS tmp_subastas_extra;

-- Moneda para las subastas demo (requerido por el backend)
INSERT INTO moneda_subasta (subasta, moneda)
SELECT identificador, 'ARS'
FROM subastas
WHERE ubicacion LIKE '[DEMO EXTRA FECHAS]%'
AND NOT EXISTS (
    SELECT 1 FROM moneda_subasta ms WHERE ms.subasta = subastas.identificador
);

SELECT
    'subastas demo extra fechas' AS tabla,
    estado,
    COUNT(*) AS total
FROM subastas
WHERE ubicacion LIKE '[DEMO EXTRA FECHAS]%'
GROUP BY estado;