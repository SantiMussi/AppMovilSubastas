USE subastas;

-- ================================================================
-- 1. PERSONAS BASE (subastador + dueños + cliente de prueba)
-- ================================================================

INSERT INTO personas (documento, nombre, direccion, estado, foto) VALUES
('41000001', 'Carlos Méndez',  'Av. Corrientes 100, CABA', 'activo', NULL),
('42000001', 'Roberto Paz',    'Libertad 250, CABA',       'activo', NULL),
('43000001', 'Elena Vázquez',  'Santa Fe 800, CABA',       'activo', NULL),
('44000001', 'Miguel Torres',  'Callao 540, CABA',         'activo', NULL);

SET @id_subastador = (SELECT identificador FROM personas WHERE documento = '41000001');
SET @id_duenio1    = (SELECT identificador FROM personas WHERE documento = '42000001');
SET @id_duenio2    = (SELECT identificador FROM personas WHERE documento = '43000001');
SET @id_cliente    = (SELECT identificador FROM personas WHERE documento = '44000001');

-- ================================================================
-- 2. SUBASTADOR
-- ================================================================

INSERT INTO subastadores (identificador, matricula, region)
VALUES (@id_subastador, 'MAT-001', 'Buenos Aires');

-- ================================================================
-- 3. DUEÑOS
-- ================================================================

INSERT INTO duenios (identificador, numeroPais, verificacionFinanciera, verificacionJudicial, calificacionRiesgo, verificador)
VALUES
(@id_duenio1, 32, 'si', 'si', 1, 1),
(@id_duenio2, 32, 'si', 'si', 2, 1);

-- ================================================================
-- 4. SUBASTAS ACTIVAS (3)
-- ================================================================

INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidadAsistentes, tieneDeposito, seguridadPropia, categoria) VALUES
('2026-08-15', '18:00:00', 'abierta', @id_subastador, 'Palais de Glace, Posadas 1725, CABA',       200, 'si', 'si', 'especial'),
('2026-09-20', '19:00:00', 'abierta', @id_subastador, 'Faena Arts Center, Martha Salotti 445, CABA', 150, 'si', 'si', 'platino'),
('2026-10-10', '17:00:00', 'abierta', @id_subastador, 'Alvear Palace Hotel, Av. Alvear 1891, CABA',  100, 'no', 'si', 'oro');

SET @sub1 = (SELECT identificador FROM subastas WHERE ubicacion LIKE '%Palais%');
SET @sub2 = (SELECT identificador FROM subastas WHERE ubicacion LIKE '%Faena%');
SET @sub3 = (SELECT identificador FROM subastas WHERE ubicacion LIKE '%Alvear%');

-- ================================================================
-- 5. PRODUCTOS (3 por subasta)
-- ================================================================

-- Subasta 1 — Arte Contemporáneo
INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio) VALUES
('2026-01-10', 'si', 'Óleo sobre tela — Serie Azul N°3',
 'Obra de arte contemporáneo de Marta Minujín, firmada y certificada. Técnica mixta, 80x100cm. Incluye certificado de autenticidad y documentación de procedencia.',
 11, @id_duenio1),
('2026-01-11', 'si', 'Escultura en bronce — Tiempo',
 'Pieza única fundida en bronce por Jorge Noro. Peso 12kg, 45cm de altura. Peana de mármol incluida. Certificado de autoría y única copia existente.',
 11, @id_duenio1),
('2026-01-12', 'si', 'Acuarela — Paisaje pampeano',
 'Acuarela original de Florencia Vulich, circa 1990. Enmarcada en madera de cedro, 60x40cm. Excelente estado de conservación. Firmada al dorso.',
 12, @id_duenio2);

-- Subasta 2 — Antigüedades
INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio) VALUES
('2026-02-01', 'si', 'Reloj de pie inglés — Siglo XIX',
 'Reloj de pie estilo Victoriano en madera de roble, mecanismo original. Altura 195cm. Certificado de antigüedad fechado en 1872. Revisión técnica realizada en 2024.',
 12, @id_duenio2),
('2026-02-02', 'si', 'Vajilla porcelana Limoges — 24 piezas',
 'Juego completo de vajilla Limoges Francia, siglo XX temprano. Diseño floral dorado en relieve. Estado impecable, sin piezas faltantes.',
 13, @id_duenio1),
('2026-02-03', 'si', 'Escritorio estilo Luis XV',
 'Escritorio en madera de nogal macizo, patas cabriolé y herrajes originales dorados. Dimensiones: 120x70x80cm. Certificado de antigüedad 1890.',
 13, @id_duenio2);

-- Subasta 3 — Relojes de Colección
INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio) VALUES
('2026-03-01', 'si', 'Patek Philippe Calatrava 1960',
 'Reloj Patek Philippe modelo Calatrava en oro amarillo 18k. Movimiento manual calibre 12-600AT. Documentación original, caja de fábrica y papeles de época.',
 14, @id_duenio1),
('2026-03-02', 'si', 'Rolex Datejust 1975 Acero',
 'Rolex Datejust acero inoxidable, esfera plateada con índices de diamantes originales. Caja y papeles originales. Revisado por servicio oficial en 2023.',
 14, @id_duenio2),
('2026-03-03', 'si', 'Vacheron Constantin Overseas 2005',
 'Vacheron Constantin Overseas en acero, esfera azul, 42mm. Historial completo de servicio oficial. Segundo propietario, caja y documentación completos.',
 15, @id_duenio1);

-- IDs de productos
SET @p1 = (SELECT identificador FROM productos WHERE descripcionCatalogo = 'Óleo sobre tela — Serie Azul N°3');
SET @p2 = (SELECT identificador FROM productos WHERE descripcionCatalogo = 'Escultura en bronce — Tiempo');
SET @p3 = (SELECT identificador FROM productos WHERE descripcionCatalogo = 'Acuarela — Paisaje pampeano');
SET @p4 = (SELECT identificador FROM productos WHERE descripcionCatalogo = 'Reloj de pie inglés — Siglo XIX');
SET @p5 = (SELECT identificador FROM productos WHERE descripcionCatalogo = 'Vajilla porcelana Limoges — 24 piezas');
SET @p6 = (SELECT identificador FROM productos WHERE descripcionCatalogo = 'Escritorio estilo Luis XV');
SET @p7 = (SELECT identificador FROM productos WHERE descripcionCatalogo = 'Patek Philippe Calatrava 1960');
SET @p8 = (SELECT identificador FROM productos WHERE descripcionCatalogo = 'Rolex Datejust 1975 Acero');
SET @p9 = (SELECT identificador FROM productos WHERE descripcionCatalogo = 'Vacheron Constantin Overseas 2005');

-- ================================================================
-- 6. FOTOS (1 por producto — PNG 1x1 de placeholder)
-- ================================================================

INSERT INTO fotos (producto, foto) VALUES
(@p1, X'89504E470D0A1A0A0000000D494844520000000100000001080200000090775304000000194944415478016360F8CFFFFF000000FEFF01009A3B05100000000049454E44AE426082'),
(@p2, X'89504E470D0A1A0A0000000D494844520000000100000001080200000090775304000000194944415478016360F8CFFFFF000000FEFF01009A3B05100000000049454E44AE426082'),
(@p3, X'89504E470D0A1A0A0000000D494844520000000100000001080200000090775304000000194944415478016360F8CFFFFF000000FEFF01009A3B05100000000049454E44AE426082'),
(@p4, X'89504E470D0A1A0A0000000D494844520000000100000001080200000090775304000000194944415478016360F8CFFFFF000000FEFF01009A3B05100000000049454E44AE426082'),
(@p5, X'89504E470D0A1A0A0000000D494844520000000100000001080200000090775304000000194944415478016360F8CFFFFF000000FEFF01009A3B05100000000049454E44AE426082'),
(@p6, X'89504E470D0A1A0A0000000D494844520000000100000001080200000090775304000000194944415478016360F8CFFFFF000000FEFF01009A3B05100000000049454E44AE426082'),
(@p7, X'89504E470D0A1A0A0000000D494844520000000100000001080200000090775304000000194944415478016360F8CFFFFF000000FEFF01009A3B05100000000049454E44AE426082'),
(@p8, X'89504E470D0A1A0A0000000D494844520000000100000001080200000090775304000000194944415478016360F8CFFFFF000000FEFF01009A3B05100000000049454E44AE426082'),
(@p9, X'89504E470D0A1A0A0000000D494844520000000100000001080200000090775304000000194944415478016360F8CFFFFF000000FEFF01009A3B05100000000049454E44AE426082');

-- ================================================================
-- 7. CATÁLOGOS (1 por subasta)
-- ================================================================

INSERT INTO catalogos (descripcion, subasta, responsable) VALUES
('Catálogo Arte Contemporáneo — Agosto 2026',      @sub1, 14),
('Catálogo Antigüedades Europeas — Septiembre 2026', @sub2, 14),
('Catálogo Relojes de Colección — Octubre 2026',    @sub3, 14);

SET @cat1 = (SELECT identificador FROM catalogos WHERE descripcion LIKE '%Arte Contemporáneo%');
SET @cat2 = (SELECT identificador FROM catalogos WHERE descripcion LIKE '%Antigüedades%');
SET @cat3 = (SELECT identificador FROM catalogos WHERE descripcion LIKE '%Relojes%');

-- ================================================================
-- 8. ITEMS DE CATÁLOGO
-- ================================================================

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado) VALUES
(@cat1, @p1,  150000.00,  15000.00, 'no'),
(@cat1, @p2,  280000.00,  28000.00, 'no'),
(@cat1, @p3,   45000.00,   4500.00, 'no'),
(@cat2, @p4,  320000.00,  32000.00, 'no'),
(@cat2, @p5,   85000.00,   8500.00, 'no'),
(@cat2, @p6,  120000.00,  12000.00, 'no'),
(@cat3, @p7, 2500000.00, 250000.00, 'no'),
(@cat3, @p8, 1800000.00, 180000.00, 'no'),
(@cat3, @p9, 3200000.00, 320000.00, 'no');

-- ================================================================
-- 9. USUARIO DE PRUEBA
-- (password null — completar registro desde la app con código 1234)
-- ================================================================

INSERT INTO usuarios (idUsuario, email, password, apellido)
VALUES (@id_cliente, 'test@vantage.com', NULL, 'Torres');

INSERT INTO clientes (identificador, numeroPais, admitido, categoria, verificador)
VALUES (@id_cliente, 32, 'si', 'comun', 1);

-- ================================================================
-- 10. ASISTENTE + PUJOS DE PRUEBA (subasta 1, ítem 1)
-- ================================================================

INSERT INTO asistentes (numeroPostor, cliente, subasta)
VALUES (101, @id_cliente, @sub1);

SET @asistente1 = LAST_INSERT_ID();
SET @item1 = (SELECT identificador FROM itemsCatalogo WHERE producto = @p1);

INSERT INTO pujos (asistente, item, importe, ganador) VALUES
(@asistente1, @item1, 155000.00, 'no'),
(@asistente1, @item1, 163000.00, 'no'),
(@asistente1, @item1, 172000.00, 'no');

INSERT INTO pujosMetadata (pujo, fecha)
SELECT identificador, NOW() FROM pujos WHERE asistente = @asistente1;

-- ================================================================
-- VERIFICACIÓN
-- ================================================================

SELECT 'subastas activas'   AS tabla, COUNT(*) AS total FROM subastas      WHERE estado = 'abierta'
UNION ALL
SELECT 'catalogos',                   COUNT(*)          FROM catalogos
UNION ALL
SELECT 'items de catalogo',           COUNT(*)          FROM itemsCatalogo
UNION ALL
SELECT 'productos',                   COUNT(*)          FROM productos
UNION ALL
SELECT 'fotos',                       COUNT(*)          FROM fotos
UNION ALL
SELECT 'pujos',                       COUNT(*)          FROM pujos;