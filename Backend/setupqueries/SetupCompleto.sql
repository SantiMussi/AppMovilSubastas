-- ================================================================
-- SETUP COMPLETO — Base de datos Subastas
-- Ejecutar DESPUÉS de arrancar el backend al menos una vez
-- para que Hibernate genere las tablas automáticamente.
-- ================================================================

USE subastas;

SET @foto_placeholder_base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
SET @foto_placeholder = FROM_BASE64(@foto_placeholder_base64);

-- ================================================================
-- 1. PAISES
-- ================================================================

INSERT INTO paises (numero, capital, idiomas, nacionalidad, nombre, nombre_corto) VALUES
(4,   'Kabul',               'pastún, dari',                          'afgana',          'Afganistán',            'AF'),
(8,   'Tirana',              'albanés',                               'albanesa',         'Albania',               'AL'),
(12,  'Argel',               'árabe, tamazight',                      'argelina',         'Argelia',               'DZ'),
(20,  'Andorra la Vieja',    'catalán',                               'andorrana',        'Andorra',               'AD'),
(24,  'Luanda',              'portugués',                             'angoleña',         'Angola',                'AO'),
(32,  'Buenos Aires',        'español',                               'argentina',        'Argentina',             'AR'),
(36,  'Canberra',            'inglés',                                'australiana',      'Australia',             'AU'),
(40,  'Viena',               'alemán',                                'austriaca',        'Austria',               'AT'),
(44,  'Nasáu',               'inglés',                                'bahameña',         'Bahamas',               'BS'),
(48,  'Manama',              'árabe',                                 'bareiní',          'Baréin',                'BH'),
(50,  'Daca',                'bengalí',                               'bangladesí',       'Bangladés',             'BD'),
(52,  'Bridgetown',          'inglés',                                'barbadense',       'Barbados',              'BB'),
(56,  'Bruselas',            'neerlandés, francés, alemán',           'belga',            'Bélgica',               'BE'),
(68,  'Sucre',               'español, quechua, aimara, guaraní',     'boliviana',        'Bolivia',               'BO'),
(70,  'Sarajevo',            'bosnio, croata, serbio',                'bosnia',           'Bosnia y Herzegovina',  'BA'),
(76,  'Brasilia',            'portugués',                             'brasileña',        'Brasil',                'BR'),
(84,  'Belmopán',            'inglés',                                'beliceña',         'Belice',                'BZ'),
(100, 'Sofía',               'búlgaro',                               'búlgara',          'Bulgaria',              'BG'),
(124, 'Ottawa',              'inglés, francés',                       'canadiense',       'Canadá',                'CA'),
(152, 'Santiago',            'español',                               'chilena',          'Chile',                 'CL'),
(156, 'Pekín',               'chino mandarín',                        'china',            'China',                 'CN'),
(170, 'Bogotá',              'español',                               'colombiana',       'Colombia',              'CO'),
(188, 'San José',            'español',                               'costarricense',    'Costa Rica',            'CR'),
(191, 'Zagreb',              'croata',                                'croata',           'Croacia',               'HR'),
(192, 'La Habana',           'español',                               'cubana',           'Cuba',                  'CU'),
(203, 'Praga',               'checo',                                 'checa',            'Chequia',               'CZ'),
(208, 'Copenhague',          'danés',                                 'danesa',           'Dinamarca',             'DK'),
(214, 'Santo Domingo',       'español',                               'dominicana',       'República Dominicana',  'DO'),
(218, 'Quito',               'español',                               'ecuatoriana',      'Ecuador',               'EC'),
(222, 'San Salvador',        'español',                               'salvadoreña',      'El Salvador',           'SV'),
(233, 'Tallin',              'estonio',                               'estonia',          'Estonia',               'EE'),
(246, 'Helsinki',            'finés, sueco',                          'finlandesa',       'Finlandia',             'FI'),
(250, 'París',               'francés',                               'francesa',         'Francia',               'FR'),
(276, 'Berlín',              'alemán',                                'alemana',          'Alemania',              'DE'),
(300, 'Atenas',              'griego',                                'griega',           'Grecia',                'GR'),
(320, 'Ciudad de Guatemala', 'español',                               'guatemalteca',     'Guatemala',             'GT'),
(340, 'Tegucigalpa',         'español',                               'hondureña',        'Honduras',              'HN'),
(348, 'Budapest',            'húngaro',                               'húngara',          'Hungría',               'HU'),
(352, 'Reikiavik',           'islandés',                              'islandesa',        'Islandia',              'IS'),
(356, 'Nueva Delhi',         'hindi, inglés',                         'india',            'India',                 'IN'),
(360, 'Yakarta',             'indonesio',                             'indonesia',        'Indonesia',             'ID'),
(364, 'Teherán',             'persa',                                 'iraní',            'Irán',                  'IR'),
(368, 'Bagdad',              'árabe, kurdo',                          'iraquí',           'Irak',                  'IQ'),
(372, 'Dublín',              'irlandés, inglés',                      'irlandesa',        'Irlanda',               'IE'),
(376, 'Jerusalén',           'hebreo',                                'israelí',          'Israel',                'IL'),
(380, 'Roma',                'italiano',                              'italiana',         'Italia',                'IT'),
(392, 'Tokio',               'japonés',                               'japonesa',         'Japón',                 'JP'),
(400, 'Amán',                'árabe',                                 'jordana',          'Jordania',              'JO'),
(410, 'Seúl',                'coreano',                               'surcoreana',       'Corea del Sur',         'KR'),
(414, 'Kuwait',              'árabe',                                 'kuwaití',          'Kuwait',                'KW'),
(422, 'Beirut',              'árabe',                                 'libanesa',         'Líbano',                'LB'),
(428, 'Riga',                'letón',                                 'letona',           'Letonia',               'LV'),
(440, 'Vilna',               'lituano',                               'lituana',          'Lituania',              'LT'),
(442, 'Luxemburgo',          'luxemburgués, francés, alemán',         'luxemburguesa',    'Luxemburgo',            'LU'),
(458, 'Kuala Lumpur',        'malayo',                                'malasia',          'Malasia',               'MY'),
(470, 'La Valeta',           'maltés, inglés',                        'maltesa',          'Malta',                 'MT'),
(484, 'Ciudad de México',    'español',                               'mexicana',         'México',                'MX'),
(504, 'Rabat',               'árabe, tamazight',                      'marroquí',         'Marruecos',             'MA'),
(528, 'Ámsterdam',           'neerlandés',                            'neerlandesa',      'Países Bajos',          'NL'),
(554, 'Wellington',          'inglés, maorí',                         'neozelandesa',     'Nueva Zelanda',         'NZ'),
(558, 'Managua',             'español',                               'nicaragüense',     'Nicaragua',             'NI'),
(566, 'Abuya',               'inglés',                                'nigeriana',        'Nigeria',               'NG'),
(578, 'Oslo',                'noruego',                               'noruega',          'Noruega',               'NO'),
(586, 'Islamabad',           'urdu, inglés',                          'pakistaní',        'Pakistán',              'PK'),
(591, 'Ciudad de Panamá',    'español',                               'panameña',         'Panamá',                'PA'),
(600, 'Asunción',            'español, guaraní',                      'paraguaya',        'Paraguay',              'PY'),
(604, 'Lima',                'español, quechua, aimara',              'peruana',          'Perú',                  'PE'),
(608, 'Manila',              'filipino, inglés',                      'filipina',         'Filipinas',             'PH'),
(616, 'Varsovia',            'polaco',                                'polaca',           'Polonia',               'PL'),
(620, 'Lisboa',              'portugués',                             'portuguesa',       'Portugal',              'PT'),
(634, 'Doha',                'árabe',                                 'catarí',           'Catar',                 'QA'),
(642, 'Bucarest',            'rumano',                                'rumana',           'Rumania',               'RO'),
(643, 'Moscú',               'ruso',                                  'rusa',             'Rusia',                 'RU'),
(682, 'Riad',                'árabe',                                 'saudí',            'Arabia Saudita',        'SA'),
(688, 'Belgrado',            'serbio',                                'serbia',           'Serbia',                'RS'),
(702, 'Singapur',            'inglés, malayo, mandarín, tamil',       'singapurense',     'Singapur',              'SG'),
(703, 'Bratislava',          'eslovaco',                              'eslovaca',         'Eslovaquia',            'SK'),
(704, 'Hanói',               'vietnamita',                            'vietnamita',       'Vietnam',               'VN'),
(705, 'Liubliana',           'esloveno',                              'eslovena',         'Eslovenia',             'SI'),
(710, 'Pretoria',            'zulú, xhosa, afrikáans, inglés',        'sudafricana',      'Sudáfrica',             'ZA'),
(724, 'Madrid',              'español',                               'española',         'España',                'ES'),
(752, 'Estocolmo',           'sueco',                                 'sueca',            'Suecia',                'SE'),
(756, 'Berna',               'alemán, francés, italiano, romanche',   'suiza',            'Suiza',                 'CH'),
(764, 'Bangkok',             'tailandés',                             'tailandesa',       'Tailandia',             'TH'),
(780, 'Puerto España',       'inglés',                                'trinitense',       'Trinidad y Tobago',     'TT'),
(784, 'Abu Dabi',            'árabe',                                 'emiratí',          'Emiratos Árabes Unidos','AE'),
(788, 'Túnez',               'árabe',                                 'tunecina',         'Túnez',                 'TN'),
(792, 'Ankara',              'turco',                                 'turca',            'Turquía',               'TR'),
(804, 'Kiev',                'ucraniano',                             'ucraniana',        'Ucrania',               'UA'),
(818, 'El Cairo',            'árabe',                                 'egipcia',          'Egipto',                'EG'),
(826, 'Londres',             'inglés',                                'británica',        'Reino Unido',           'GB'),
(840, 'Washington D. C.',    'inglés',                                'estadounidense',   'Estados Unidos',        'US'),
(858, 'Montevideo',          'español',                               'uruguaya',         'Uruguay',               'UY'),
(862, 'Caracas',             'español',                               'venezolana',       'Venezuela',             'VE');

-- ================================================================
-- 2. PERSONAS (empleados 1-40 + demos 41-44)
-- ================================================================

INSERT INTO personas (identificador, documento, nombre, direccion, estado, foto)
VALUES
(1,  '30124567', 'Martín Álvarez',    'Av. Corrientes 1234, CABA',        'activo', NULL),
(2,  '28456789', 'Laura Benítez',     'San Martín 245, Córdoba',           'activo', NULL),
(3,  '32789123', 'Diego Fernández',   'Mitre 876, Rosario',                'activo', NULL),
(4,  '35123456', 'Carolina Gómez',    'Belgrano 560, Mendoza',             'activo', NULL),
(5,  '29876543', 'Pablo Herrera',     'Rivadavia 1450, La Plata',          'activo', NULL),
(6,  '37234567', 'Sofía Castro',      'Sarmiento 234, CABA',               'activo', NULL),
(7,  '31678945', 'Nicolás Romero',    'Av. Colón 998, Córdoba',            'activo', NULL),
(8,  '33987654', 'Valeria Suárez',    'España 711, Rosario',               'activo', NULL),
(9,  '27543218', 'Federico Morales',  'Las Heras 440, Mendoza',            'activo', NULL),
(10, '36321456', 'Camila Torres',     'Av. 7 890, La Plata',               'activo', NULL),
(11, '28900123', 'Gustavo Rojas',     'Moreno 300, CABA',                  'activo', NULL),
(12, '34567890', 'Mariana Medina',    'Entre Ríos 642, Córdoba',           'activo', NULL),
(13, '30765432', 'Andrés Silva',      'Pellegrini 1201, Rosario',          'activo', NULL),
(14, '33445566', 'Lucía Navarro',     'Godoy Cruz 321, Mendoza',           'activo', NULL),
(15, '35678901', 'Julián Pereyra',    'Calle 12 456, La Plata',            'activo', NULL),
(16, '29345678', 'Natalia Vega',      'Av. Santa Fe 2100, CABA',           'activo', NULL),
(17, '31876543', 'Sebastián Molina',  'Dean Funes 525, Córdoba',           'activo', NULL),
(18, '34111222', 'Rocío Acosta',      'Oroño 1500, Rosario',               'activo', NULL),
(19, '27999888', 'Hernán Cabrera',    'Patricias Mendocinas 120, Mendoza', 'activo', NULL),
(20, '36555111', 'Florencia Luna',    'Diagonal 74 700, La Plata',         'activo', NULL),
(21, '30222333', 'Eduardo Núñez',     'Tucumán 455, CABA',                 'activo', NULL),
(22, '28666777', 'Paula Iglesias',    'General Paz 890, Córdoba',          'activo', NULL),
(23, '31999123', 'Ramiro Soto',       'San Lorenzo 333, Rosario',          'activo', NULL),
(24, '33777888', 'Melina Arias',      'Chile 650, Mendoza',                'activo', NULL),
(25, '35444123', 'Agustín Ferrer',    'Calle 8 1200, La Plata',            'activo', NULL),
(26, '29123498', 'Verónica Blanco',   'Maipú 789, CABA',                   'activo', NULL),
(27, '31234987', 'Ignacio Paredes',   'Obispo Trejo 222, Córdoba',         'activo', NULL),
(28, '34888111', 'Daniela Campos',    'Córdoba 1720, Rosario',             'activo', NULL),
(29, '27654321', 'Ricardo Salas',     'San Juan 970, Mendoza',             'activo', NULL),
(30, '36987612', 'Micaela Lozano',    'Calle 50 430, La Plata',            'activo', NULL),
(31, '30456712', 'Jorge Maldonado',   'Lavalle 120, CABA',                 'activo', NULL),
(32, '28765412', 'Silvina Peralta',   'Ituzaingó 610, Córdoba',            'activo', NULL),
(33, '32123987', 'Matías Méndez',     'Buenos Aires 2000, Rosario',        'activo', NULL),
(34, '34555123', 'Gabriela Godoy',    'Arístides 777, Mendoza',            'activo', NULL),
(35, '36111234', 'Emiliano Soria',    'Calle 44 1120, La Plata',           'activo', NULL),
(36, '29777123', 'Claudia Bustos',    'Florida 640, CABA',                 'activo', NULL),
(37, '31444567', 'Tomás Villalba',    'Chacabuco 999, Córdoba',            'activo', NULL),
(38, '33222111', 'Romina Leiva',      'Mendoza 410, Rosario',              'activo', NULL),
(39, '35888999', 'Leonardo Escobar',  'España 123, Mendoza',               'activo', NULL),
(40, '37333111', 'Malena Cejas',      'Calle 60 850, La Plata',            'activo', NULL),
-- Demos
(41, '41000001', 'Subastador Demo',   'Av. Demo 100, CABA',                'activo', NULL),
(42, '42000001', 'Dueño Demo Uno',    'Av. Demo 200, CABA',                'activo', NULL),
(43, '43000001', 'Dueño Demo Dos',    'Av. Demo 300, CABA',                'activo', NULL),
-- Cliente de prueba (completar registro desde la app con código 1234)
(44, '44000001', 'Miguel Torres',     'Callao 540, CABA',                  'activo', NULL);

SET @id_subastador = (SELECT identificador FROM personas WHERE documento = '41000001' LIMIT 1);
SET @id_duenio1    = (SELECT identificador FROM personas WHERE documento = '42000001' LIMIT 1);
SET @id_duenio2    = (SELECT identificador FROM personas WHERE documento = '43000001' LIMIT 1);
SET @id_cliente    = (SELECT identificador FROM personas WHERE documento = '44000001' LIMIT 1);

-- ================================================================
-- 3. SECTORES Y EMPLEADOS
-- ================================================================

INSERT INTO sectores (identificador, nombre_sector, codigo_sector, responsable_sector)
VALUES
(1, 'Dirección',             'DIR', NULL),
(2, 'Tasaciones',            'TAS', NULL),
(3, 'Catálogo y productos',  'CAT', NULL),
(4, 'Clientes y postores',   'CLI', NULL),
(5, 'Dueños / propietarios', 'DUE', NULL),
(6, 'Legal y seguros',       'LEG', NULL),
(7, 'Pagos y cobranzas',     'PAG', NULL),
(8, 'Logística y sala',      'LOG', NULL);

INSERT INTO empleados (identificador, cargo, sector)
VALUES
(1,  'Gerente general',                  1),
(2,  'Director de subastas',             1),
(3,  'Coordinador de subastas',          1),
(4,  'Subastador principal',             1),
(5,  'Asistente de subastas',            1),
(6,  'Jefe de tasaciones',               2),
(7,  'Tasador de arte',                  2),
(8,  'Tasador de vehículos',             2),
(9,  'Tasador de inmuebles',             2),
(10, 'Tasador de antigüedades',          2),
(11, 'Revisor de productos',             3),
(12, 'Inspector de productos',           3),
(13, 'Catalogador',                      3),
(14, 'Responsable de catálogo',          3),
(15, 'Fotógrafo de catálogo',            3),
(16, 'Analista de clientes',             4),
(17, 'Verificador de clientes',          4),
(18, 'Ejecutivo de atención al cliente', 4),
(19, 'Responsable de admisiones',        4),
(20, 'Gestor de postores',               4),
(21, 'Analista de dueños',               5),
(22, 'Verificador financiero',           5),
(23, 'Verificador judicial',             5),
(24, 'Analista de riesgo',               5),
(25, 'Gestor de propietarios',           5),
(26, 'Responsable de seguros',           6),
(27, 'Analista de pólizas',              6),
(28, 'Gestor de documentación',          6),
(29, 'Responsable legal',                6),
(30, 'Auxiliar legal',                   6),
(31, 'Responsable de pagos',             7),
(32, 'Analista de medios de pago',       7),
(33, 'Cajero',                           7),
(34, 'Administrador de garantías',       7),
(35, 'Gestor de cobranzas',              7),
(36, 'Responsable de logística',         8),
(37, 'Coordinador de depósito',          8),
(38, 'Encargado de seguridad',           8),
(39, 'Operador de sala',                 8),
(40, 'Soporte técnico de subastas',      8);

UPDATE sectores SET responsable_sector = 1  WHERE identificador = 1;
UPDATE sectores SET responsable_sector = 6  WHERE identificador = 2;
UPDATE sectores SET responsable_sector = 14 WHERE identificador = 3;
UPDATE sectores SET responsable_sector = 19 WHERE identificador = 4;
UPDATE sectores SET responsable_sector = 25 WHERE identificador = 5;
UPDATE sectores SET responsable_sector = 26 WHERE identificador = 6;
UPDATE sectores SET responsable_sector = 31 WHERE identificador = 7;
UPDATE sectores SET responsable_sector = 36 WHERE identificador = 8;

-- ================================================================
-- 4. SUBASTADORES, DUEÑOS, CLIENTES Y USUARIO DE PRUEBA
-- ================================================================

INSERT INTO subastadores (identificador, matricula, region)
VALUES (41, 'MAT-001', 'Buenos Aires');

INSERT INTO duenios (identificador, numero_pais, verificacion_financiera, verificacion_judicial, calificacion_riesgo, verificador)
VALUES
(42, 32, 'si', 'si', 1, 1),
(43, 32, 'si', 'si', 2, 1);

-- Empresa (requerido por app.empresa.cliente-id=1)
INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador)
VALUES (1, 32, 'si', 'platino', 1);

-- ================================================================
-- 5. SUBASTAS V1 — 3 subastas curadas con descripciones reales
-- ================================================================

INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria) VALUES
('2026-08-15', '18:00:00', 'abierta', @id_subastador, 'Palais de Glace, Posadas 1725, CABA',          200, 'si', 'si', 'especial'),
('2026-09-20', '19:00:00', 'abierta', @id_subastador, 'Faena Arts Center, Martha Salotti 445, CABA',  150, 'si', 'si', 'platino'),
('2026-10-10', '17:00:00', 'abierta', @id_subastador, 'Alvear Palace Hotel, Av. Alvear 1891, CABA',   100, 'no', 'si', 'oro');

SET @sub1 = (SELECT identificador FROM subastas WHERE ubicacion LIKE '%Palais%' LIMIT 1);
SET @sub2 = (SELECT identificador FROM subastas WHERE ubicacion LIKE '%Faena%'  LIMIT 1);
SET @sub3 = (SELECT identificador FROM subastas WHERE ubicacion LIKE '%Alvear%' LIMIT 1);

INSERT INTO moneda_subasta (subasta, moneda) VALUES
(@sub1, 'ARS'),
(@sub2, 'ARS'),
(@sub3, 'ARS');

-- Productos V1 — Arte contemporáneo
INSERT INTO productos (fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio) VALUES
('2026-01-10', 'si', 'Óleo sobre tela — Serie Azul N°3',
 'Obra de arte contemporáneo de Marta Minujín, firmada y certificada. Técnica mixta, 80x100cm.',
 11, @id_duenio1),
('2026-01-11', 'si', 'Escultura en bronce — Tiempo',
 'Pieza única fundida en bronce por Jorge Noro. Peso 12kg, 45cm de altura. Peana de mármol incluida.',
 11, @id_duenio1),
('2026-01-12', 'si', 'Acuarela — Paisaje pampeano',
 'Acuarela original de Florencia Vulich, circa 1990. Enmarcada en madera de cedro, 60x40cm.',
 12, @id_duenio2),

-- Antigüedades
('2026-02-01', 'si', 'Reloj de pie inglés — Siglo XIX',
 'Reloj de pie estilo Victoriano en madera de roble, mecanismo original. Altura 195cm. Certificado 1872.',
 12, @id_duenio2),
('2026-02-02', 'si', 'Vajilla porcelana Limoges — 24 piezas',
 'Juego completo de vajilla Limoges Francia, siglo XX temprano. Diseño floral dorado en relieve.',
 13, @id_duenio1),
('2026-02-03', 'si', 'Escritorio estilo Luis XV',
 'Escritorio en madera de nogal macizo, patas cabriolé y herrajes originales dorados. 120x70x80cm.',
 13, @id_duenio2),

-- Relojes de colección
('2026-03-01', 'si', 'Patek Philippe Calatrava 1960',
 'Reloj Patek Philippe modelo Calatrava en oro amarillo 18k. Movimiento manual calibre 12-600AT.',
 14, @id_duenio1),
('2026-03-02', 'si', 'Rolex Datejust 1975 Acero',
 'Rolex Datejust acero inoxidable, esfera plateada con índices de diamantes originales.',
 14, @id_duenio2),
('2026-03-03', 'si', 'Vacheron Constantin Overseas 2005',
 'Vacheron Constantin Overseas en acero, esfera azul, 42mm. Historial completo de servicio oficial.',
 15, @id_duenio1);

SET @p1 = (SELECT identificador FROM productos WHERE descripcion_catalogo = 'Óleo sobre tela — Serie Azul N°3'       LIMIT 1);
SET @p2 = (SELECT identificador FROM productos WHERE descripcion_catalogo = 'Escultura en bronce — Tiempo'           LIMIT 1);
SET @p3 = (SELECT identificador FROM productos WHERE descripcion_catalogo = 'Acuarela — Paisaje pampeano'            LIMIT 1);
SET @p4 = (SELECT identificador FROM productos WHERE descripcion_catalogo = 'Reloj de pie inglés — Siglo XIX'        LIMIT 1);
SET @p5 = (SELECT identificador FROM productos WHERE descripcion_catalogo = 'Vajilla porcelana Limoges — 24 piezas'  LIMIT 1);
SET @p6 = (SELECT identificador FROM productos WHERE descripcion_catalogo = 'Escritorio estilo Luis XV'              LIMIT 1);
SET @p7 = (SELECT identificador FROM productos WHERE descripcion_catalogo = 'Patek Philippe Calatrava 1960'          LIMIT 1);
SET @p8 = (SELECT identificador FROM productos WHERE descripcion_catalogo = 'Rolex Datejust 1975 Acero'              LIMIT 1);
SET @p9 = (SELECT identificador FROM productos WHERE descripcion_catalogo = 'Vacheron Constantin Overseas 2005'      LIMIT 1);

INSERT INTO fotos (producto, foto) VALUES
(@p1, @foto_placeholder), (@p2, @foto_placeholder), (@p3, @foto_placeholder),
(@p4, @foto_placeholder), (@p5, @foto_placeholder), (@p6, @foto_placeholder),
(@p7, @foto_placeholder), (@p8, @foto_placeholder), (@p9, @foto_placeholder);

INSERT INTO catalogos (descripcion, subasta, responsable) VALUES
('Catálogo Arte Contemporáneo — Agosto 2026',       @sub1, 14),
('Catálogo Antigüedades Europeas — Septiembre 2026', @sub2, 14),
('Catálogo Relojes de Colección — Octubre 2026',     @sub3, 14);

SET @cat1 = (SELECT identificador FROM catalogos WHERE descripcion LIKE '%Arte Contemporáneo%' LIMIT 1);
SET @cat2 = (SELECT identificador FROM catalogos WHERE descripcion LIKE '%Antigüedades%'        LIMIT 1);
SET @cat3 = (SELECT identificador FROM catalogos WHERE descripcion LIKE '%Relojes%'             LIMIT 1);

INSERT INTO items_catalogo (catalogo, producto, precio_base, comision, subastado) VALUES
(@cat1, @p1,   150000.00,  15000.00, 'no'),
(@cat1, @p2,   280000.00,  28000.00, 'no'),
(@cat1, @p3,    45000.00,   4500.00, 'no'),
(@cat2, @p4,   320000.00,  32000.00, 'no'),
(@cat2, @p5,    85000.00,   8500.00, 'no'),
(@cat2, @p6,   120000.00,  12000.00, 'no'),
(@cat3, @p7,  2500000.00, 250000.00, 'no'),
(@cat3, @p8,  1800000.00, 180000.00, 'no'),
(@cat3, @p9,  3200000.00, 320000.00, 'no');

-- Asistente y pujos de prueba (subasta 1, ítem 1)
INSERT INTO asistentes (numero_postor, cliente, subasta)
VALUES (101, @id_cliente, @sub1);

SET @asistente1 = LAST_INSERT_ID();
SET @item1 = (SELECT identificador FROM items_catalogo WHERE producto = @p1 LIMIT 1);

INSERT INTO pujos (asistente, item, importe, ganador) VALUES
(@asistente1, @item1, 155000.00, 'no'),
(@asistente1, @item1, 163000.00, 'no'),
(@asistente1, @item1, 172000.00, 'no');

-- ================================================================
-- 6. SUBASTAS V2 — 30 subastas masivas (15 abiertas, 15 cerradas)
-- ================================================================

CREATE TEMPORARY TABLE IF NOT EXISTS tmp_subastas_masivas (
    seq INT PRIMARY KEY, fecha DATE NOT NULL, hora TIME NOT NULL,
    estado VARCHAR(10) NOT NULL, subastador INT NOT NULL,
    ubicacion VARCHAR(350) NOT NULL, capacidad_asistentes INT NOT NULL,
    tiene_deposito VARCHAR(2) NOT NULL, seguridad_propia VARCHAR(2) NOT NULL,
    categoria VARCHAR(10) NOT NULL, nombre VARCHAR(120) NOT NULL
);

TRUNCATE TABLE tmp_subastas_masivas;

INSERT INTO tmp_subastas_masivas (seq, fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria, nombre) VALUES
(1,  '2026-11-01', '18:00:00', 'abierta', @id_subastador, 'Centro Cultural Recoleta, Junín 1930, CABA',              120, 'si', 'si', 'comun',   'Colección de Arte Urbano'),
(2,  '2026-11-02', '19:30:00', 'abierta', @id_subastador, 'Hotel Madero, Rosario Vera Peñaloza 360, CABA',           90,  'si', 'si', 'especial', 'Joyas de Autor'),
(3,  '2026-11-03', '16:00:00', 'abierta', @id_subastador, 'La Rural, Av. Sarmiento 2704, CABA',                      250, 'si', 'si', 'platino',  'Autos Clásicos'),
(4,  '2026-11-04', '20:00:00', 'abierta', @id_subastador, 'Bodega Vistalba, Luján de Cuyo, Mendoza',                 80,  'si', 'no', 'oro',      'Vinos de Guarda'),
(5,  '2026-11-05', '17:30:00', 'abierta', @id_subastador, 'Usina del Arte, Agustín Caffarena 1, CABA',               140, 'no', 'si', 'plata',    'Diseño Escandinavo'),
(6,  '2026-11-06', '18:15:00', 'abierta', @id_subastador, 'Museo Larreta, Juramento 2291, CABA',                     70,  'no', 'si', 'comun',   'Fotografía Histórica'),
(7,  '2026-11-07', '19:00:00', 'abierta', @id_subastador, 'Teatro San Martín, Av. Corrientes 1530, CABA',            160, 'si', 'si', 'especial', 'Instrumentos Vintage'),
(8,  '2026-11-08', '15:30:00', 'abierta', @id_subastador, 'Biblioteca Nacional, Agüero 2502, CABA',                  100, 'no', 'si', 'oro',      'Libros Raros'),
(9,  '2026-11-09', '20:30:00', 'abierta', @id_subastador, 'Four Seasons, Posadas 1086, CABA',                        60,  'si', 'si', 'platino',  'Alta Relojería Suiza'),
(10, '2026-11-10', '18:45:00', 'abierta', @id_subastador, 'MALBA, Av. Figueroa Alcorta 3415, CABA',                  110, 'no', 'si', 'plata',    'Cerámica Contemporánea'),
(11, '2026-11-11', '17:00:00', 'abierta', @id_subastador, 'Palacio Paz, Av. Santa Fe 750, CABA',                     130, 'si', 'si', 'oro',      'Numismática Premium'),
(12, '2026-11-12', '19:15:00', 'abierta', @id_subastador, 'Distrito Arenales, Arenales 1239, CABA',                  95,  'no', 'si', 'especial', 'Moda de Archivo'),
(13, '2026-11-13', '18:30:00', 'abierta', @id_subastador, 'Palacio Duhau, Av. Alvear 1661, CABA',                    85,  'si', 'si', 'platino',  'Muebles Art Decó'),
(14, '2026-11-14', '16:45:00', 'abierta', @id_subastador, 'Centro Metropolitano de Diseño, Algarrobo 1041, CABA',    180, 'no', 'no', 'comun',   'Cómics y Originales'),
(15, '2026-11-15', '17:45:00', 'abierta', @id_subastador, 'Jardín Japonés, Av. Casares 3450, CABA',                  150, 'si', 'si', 'plata',    'Esculturas de Jardín'),
(16, '2026-11-16', '18:00:00', 'carrada', @id_subastador, 'San Telmo Market, Defensa 1000, CABA',                    120, 'si', 'si', 'especial', 'Arte Latinoamericano'),
(17, '2026-11-17', '19:30:00', 'carrada', @id_subastador, 'Complejo Cultural BAFICI, Av. Corrientes 1373, CABA',     90,  'si', 'no', 'oro',      'Platería Criolla'),
(18, '2026-11-18', '16:00:00', 'carrada', @id_subastador, 'Espacio Cultural Nuestros Hijos, Av. Del Libertador, CABA',75, 'no', 'si', 'comun',   'Mapas Antiguos'),
(19, '2026-11-19', '20:00:00', 'carrada', @id_subastador, 'Hotel NH, Arroyo 872, CABA',                              105, 'si', 'si', 'plata',    'Tapices Orientales'),
(20, '2026-11-20', '17:30:00', 'carrada', @id_subastador, 'Faena Forum, Av. Juana Manso 1150, CABA',                 65,  'no', 'si', 'platino',  'Arte Digital Certificado'),
(21, '2026-11-21', '18:15:00', 'carrada', @id_subastador, 'Palais Rouge, Libertador 3034, CABA',                     115, 'si', 'si', 'especial', 'Cristalería Europea'),
(22, '2026-11-22', '19:00:00', 'carrada', @id_subastador, 'Club de Amigos, Av. Libertador 6800, CABA',               200, 'no', 'no', 'comun',   'Juguetes de Colección'),
(23, '2026-11-23', '15:30:00', 'carrada', @id_subastador, 'Costa Salguero, Av. Rafael Obligado, CABA',               170, 'si', 'si', 'oro',      'Motos Históricas'),
(24, '2026-11-24', '20:30:00', 'carrada', @id_subastador, 'Club Náutico Buenos Aires, Vicente López, Buenos Aires',   145, 'si', 'si', 'plata',    'Objetos Navales'),
(25, '2026-11-25', '18:45:00', 'carrada', @id_subastador, 'Museo Provincial de Bellas Artes, La Plata',              100, 'no', 'si', 'especial', 'Pintura Rioplatense'),
(26, '2026-11-26', '17:00:00', 'carrada', @id_subastador, 'Cabildo de Córdoba, Independencia 30, Córdoba',           90,  'si', 'si', 'oro',      'Minerales y Gemas'),
(27, '2026-11-27', '19:15:00', 'carrada', @id_subastador, 'Convento San Bernardo, Caseros 73, Salta',                80,  'si', 'si', 'platino',  'Arte Sacro'),
(28, '2026-11-28', '18:30:00', 'carrada', @id_subastador, 'Centro Cultural Parque España, Rosario',                  150, 'no', 'si', 'plata',    'Diseño Industrial'),
(29, '2026-12-01', '16:45:00', 'carrada', @id_subastador, 'Hotel Provincial, Mar del Plata, Buenos Aires',           220, 'no', 'no', 'comun',   'Colección Pop'),
(30, '2026-12-02', '17:45:00', 'carrada', @id_subastador, 'Teatro Municipal, Bahía Blanca, Buenos Aires',            110, 'si', 'si', 'especial', 'Militaria Histórica');

INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria)
SELECT fecha, hora, estado, subastador, CONCAT('[DEMO MASIVA] ', ubicacion), capacidad_asistentes, tiene_deposito, seguridad_propia, categoria
FROM tmp_subastas_masivas
WHERE NOT EXISTS (SELECT 1 FROM subastas s WHERE s.ubicacion = CONCAT('[DEMO MASIVA] ', tmp_subastas_masivas.ubicacion));

INSERT INTO moneda_subasta (subasta, moneda)
SELECT identificador, 'ARS' FROM subastas
WHERE ubicacion LIKE '[DEMO MASIVA]%'
AND NOT EXISTS (SELECT 1 FROM moneda_subasta ms WHERE ms.subasta = subastas.identificador);

CREATE TEMPORARY TABLE IF NOT EXISTS tmp_productos_masivos (
    seq INT PRIMARY KEY, fecha DATE NOT NULL, disponible VARCHAR(2) NOT NULL,
    descripcion_catalogo VARCHAR(500) NOT NULL, descripcion_completa VARCHAR(300) NOT NULL,
    revisor INT NOT NULL, duenio INT NOT NULL,
    precio_base DECIMAL(18,2) NOT NULL, comision DECIMAL(18,2) NOT NULL
);

TRUNCATE TABLE tmp_productos_masivos;

INSERT INTO tmp_productos_masivos (seq, fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio, precio_base, comision) VALUES
(1,  '2026-11-01', 'si', 'Lote demo Colección de Arte Urbano',      'Producto demo para subasta Colección de Arte Urbano.',      12, @id_duenio2,  17500,  1750),
(2,  '2026-11-02', 'si', 'Lote demo Joyas de Autor',                 'Producto demo para subasta Joyas de Autor.',                13, @id_duenio1,  25000,  2500),
(3,  '2026-11-03', 'si', 'Lote demo Autos Clásicos',                 'Producto demo para subasta Autos Clásicos.',                14, @id_duenio2,  32500,  3250),
(4,  '2026-11-04', 'si', 'Lote demo Vinos de Guarda',                'Producto demo para subasta Vinos de Guarda.',               15, @id_duenio1,  40000,  4000),
(5,  '2026-11-05', 'si', 'Lote demo Diseño Escandinavo',             'Producto demo para subasta Diseño Escandinavo.',            11, @id_duenio2,  47500,  4750),
(6,  '2026-11-06', 'si', 'Lote demo Fotografía Histórica',           'Producto demo para subasta Fotografía Histórica.',          12, @id_duenio1,  55000,  5500),
(7,  '2026-11-07', 'si', 'Lote demo Instrumentos Vintage',           'Producto demo para subasta Instrumentos Vintage.',          13, @id_duenio2,  62500,  6250),
(8,  '2026-11-08', 'si', 'Lote demo Libros Raros',                   'Producto demo para subasta Libros Raros.',                  14, @id_duenio1,  70000,  7000),
(9,  '2026-11-09', 'si', 'Lote demo Alta Relojería Suiza',           'Producto demo para subasta Alta Relojería Suiza.',          15, @id_duenio2,  77500,  7750),
(10, '2026-11-10', 'si', 'Lote demo Cerámica Contemporánea',         'Producto demo para subasta Cerámica Contemporánea.',        11, @id_duenio1,  85000,  8500),
(11, '2026-11-11', 'si', 'Lote demo Numismática Premium',            'Producto demo para subasta Numismática Premium.',           12, @id_duenio2,  92500,  9250),
(12, '2026-11-12', 'si', 'Lote demo Moda de Archivo',                'Producto demo para subasta Moda de Archivo.',               13, @id_duenio1, 100000, 10000),
(13, '2026-11-13', 'si', 'Lote demo Muebles Art Decó',               'Producto demo para subasta Muebles Art Decó.',              14, @id_duenio2, 107500, 10750),
(14, '2026-11-14', 'si', 'Lote demo Cómics y Originales',            'Producto demo para subasta Cómics y Originales.',           15, @id_duenio1, 115000, 11500),
(15, '2026-11-15', 'si', 'Lote demo Esculturas de Jardín',           'Producto demo para subasta Esculturas de Jardín.',          11, @id_duenio2, 122500, 12250),
(16, '2026-11-16', 'si', 'Lote demo Arte Latinoamericano',           'Producto demo para subasta Arte Latinoamericano.',          12, @id_duenio1, 130000, 13000),
(17, '2026-11-17', 'si', 'Lote demo Platería Criolla',               'Producto demo para subasta Platería Criolla.',              13, @id_duenio2, 137500, 13750),
(18, '2026-11-18', 'si', 'Lote demo Mapas Antiguos',                 'Producto demo para subasta Mapas Antiguos.',                14, @id_duenio1, 145000, 14500),
(19, '2026-11-19', 'si', 'Lote demo Tapices Orientales',             'Producto demo para subasta Tapices Orientales.',            15, @id_duenio2, 152500, 15250),
(20, '2026-11-20', 'si', 'Lote demo Arte Digital Certificado',       'Producto demo para subasta Arte Digital Certificado.',      11, @id_duenio1, 160000, 16000),
(21, '2026-11-21', 'si', 'Lote demo Cristalería Europea',            'Producto demo para subasta Cristalería Europea.',           12, @id_duenio2, 167500, 16750),
(22, '2026-11-22', 'si', 'Lote demo Juguetes de Colección',          'Producto demo para subasta Juguetes de Colección.',         13, @id_duenio1, 175000, 17500),
(23, '2026-11-23', 'si', 'Lote demo Motos Históricas',               'Producto demo para subasta Motos Históricas.',              14, @id_duenio2, 182500, 18250),
(24, '2026-11-24', 'si', 'Lote demo Objetos Navales',                'Producto demo para subasta Objetos Navales.',               15, @id_duenio1, 190000, 19000),
(25, '2026-11-25', 'si', 'Lote demo Pintura Rioplatense',            'Producto demo para subasta Pintura Rioplatense.',           11, @id_duenio2, 197500, 19750),
(26, '2026-11-26', 'si', 'Lote demo Minerales y Gemas',              'Producto demo para subasta Minerales y Gemas.',             12, @id_duenio1, 205000, 20500),
(27, '2026-11-27', 'si', 'Lote demo Arte Sacro',                     'Producto demo para subasta Arte Sacro.',                    13, @id_duenio2, 212500, 21250),
(28, '2026-11-28', 'si', 'Lote demo Diseño Industrial',              'Producto demo para subasta Diseño Industrial.',             14, @id_duenio1, 220000, 22000),
(29, '2026-12-01', 'si', 'Lote demo Colección Pop',                  'Producto demo para subasta Colección Pop.',                 15, @id_duenio2, 227500, 22750),
(30, '2026-12-02', 'si', 'Lote demo Militaria Histórica',            'Producto demo para subasta Militaria Histórica.',           11, @id_duenio1, 235000, 23500);

INSERT INTO productos (fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio)
SELECT fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio
FROM tmp_productos_masivos
WHERE NOT EXISTS (SELECT 1 FROM productos p WHERE p.descripcion_catalogo = tmp_productos_masivos.descripcion_catalogo);

INSERT INTO fotos (producto, foto)
SELECT p.identificador, @foto_placeholder
FROM tmp_productos_masivos t
JOIN productos p ON p.descripcion_catalogo = t.descripcion_catalogo
WHERE NOT EXISTS (SELECT 1 FROM fotos f WHERE f.producto = p.identificador);

INSERT INTO catalogos (descripcion, subasta, responsable)
SELECT CONCAT('Catálogo demo masivo — ', t.nombre), s.identificador, 14
FROM tmp_subastas_masivas t
JOIN subastas s ON s.ubicacion = CONCAT('[DEMO MASIVA] ', t.ubicacion)
WHERE NOT EXISTS (SELECT 1 FROM catalogos c WHERE c.descripcion = CONCAT('Catálogo demo masivo — ', t.nombre));

INSERT INTO items_catalogo (catalogo, producto, precio_base, comision, subastado)
SELECT c.identificador, p.identificador, t.precio_base, t.comision, IF(s.estado = 'carrada', 'si', 'no')
FROM tmp_productos_masivos t
JOIN productos p   ON p.descripcion_catalogo = t.descripcion_catalogo
JOIN tmp_subastas_masivas ts ON ts.seq = t.seq
JOIN subastas s    ON s.ubicacion = CONCAT('[DEMO MASIVA] ', ts.ubicacion)
JOIN catalogos c   ON c.subasta = s.identificador AND c.descripcion = CONCAT('Catálogo demo masivo — ', ts.nombre)
WHERE NOT EXISTS (SELECT 1 FROM items_catalogo i WHERE i.catalogo = c.identificador AND i.producto = p.identificador);

DROP TEMPORARY TABLE IF EXISTS tmp_productos_masivos;
DROP TEMPORARY TABLE IF EXISTS tmp_subastas_masivas;

-- ================================================================
-- 7. SUBASTAS V3 — 5 subastas con fechas dinámicas
-- ================================================================

CREATE TEMPORARY TABLE IF NOT EXISTS tmp_subastas_extra (
    seq INT PRIMARY KEY, fecha DATE NOT NULL, hora TIME NOT NULL,
    estado VARCHAR(10) NOT NULL, subastador INT NOT NULL,
    ubicacion VARCHAR(350) NOT NULL, capacidad_asistentes INT NOT NULL,
    tiene_deposito VARCHAR(2) NOT NULL, seguridad_propia VARCHAR(2) NOT NULL,
    categoria VARCHAR(10) NOT NULL, nombre VARCHAR(120) NOT NULL
);

TRUNCATE TABLE tmp_subastas_extra;

INSERT INTO tmp_subastas_extra (seq, fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria, nombre) VALUES
(1, CURDATE(),                            CURTIME(),  'abierta', @id_subastador, 'Evento Ahora Test, Microcentro, CABA',       100, 'si', 'si', 'comun',   'Subasta Hoy Ahora'),
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '18:00:00', 'abierta', @id_subastador, 'Evento Mañana Test, Palermo, CABA',          120, 'si', 'si', 'especial', 'Subasta Mañana'),
(3, DATE_ADD(CURDATE(), INTERVAL 7 DAY),  '19:30:00', 'abierta', @id_subastador, 'Evento Semana Próxima Test, Recoleta, CABA', 150, 'no', 'si', 'oro',      'Subasta Semana que Viene'),
(4, DATE_SUB(CURDATE(), INTERVAL 3 DAY),  '17:00:00', 'carrada', @id_subastador, 'Evento Pasado Test 01, San Telmo, CABA',     80,  'si', 'no', 'plata',    'Subasta Pasada Reciente'),
(5, DATE_SUB(CURDATE(), INTERVAL 15 DAY), '16:30:00', 'carrada', @id_subastador, 'Evento Pasado Test 02, Belgrano, CABA',      90,  'no', 'si', 'platino',  'Subasta Pasada Antigua');

INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria)
SELECT fecha, hora, estado, subastador, CONCAT('[DEMO] ', ubicacion), capacidad_asistentes, tiene_deposito, seguridad_propia, categoria
FROM tmp_subastas_extra t
WHERE NOT EXISTS (SELECT 1 FROM subastas s WHERE s.ubicacion = CONCAT('[DEMO] ', t.ubicacion));

INSERT INTO moneda_subasta (subasta, moneda)
SELECT identificador, 'ARS' FROM subastas
WHERE ubicacion LIKE '[DEMO]%'
AND NOT EXISTS (SELECT 1 FROM moneda_subasta ms WHERE ms.subasta = subastas.identificador);

CREATE TEMPORARY TABLE IF NOT EXISTS tmp_productos_extra (
    seq INT PRIMARY KEY, fecha DATE NOT NULL, disponible VARCHAR(2) NOT NULL,
    descripcion_catalogo VARCHAR(500) NOT NULL, descripcion_completa VARCHAR(300) NOT NULL,
    revisor INT NOT NULL, duenio INT NOT NULL,
    precio_base DECIMAL(18,2) NOT NULL, comision DECIMAL(18,2) NOT NULL
);

TRUNCATE TABLE tmp_productos_extra;

INSERT INTO tmp_productos_extra (seq, fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio, precio_base, comision) VALUES
(1, CURDATE(),                            'si', 'Lote demo Subasta Hoy Ahora',       'Producto demo para subasta hoy.',          12, @id_duenio1, 30000, 3000),
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  'si', 'Lote demo Subasta Mañana',           'Producto demo para subasta mañana.',       13, @id_duenio2, 45000, 4500),
(3, DATE_ADD(CURDATE(), INTERVAL 7 DAY),  'si', 'Lote demo Subasta Semana que Viene', 'Producto demo para subasta semanal.',      14, @id_duenio1, 60000, 6000),
(4, DATE_SUB(CURDATE(), INTERVAL 3 DAY),  'si', 'Lote demo Subasta Pasada Reciente',  'Producto demo para subasta pasada.',       15, @id_duenio2, 75000, 7500),
(5, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'si', 'Lote demo Subasta Pasada Antigua',   'Producto demo para subasta antigua.',      11, @id_duenio1, 90000, 9000);

INSERT INTO productos (fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio)
SELECT fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio
FROM tmp_productos_extra t
WHERE NOT EXISTS (SELECT 1 FROM productos p WHERE p.descripcion_catalogo = t.descripcion_catalogo);

INSERT INTO fotos (producto, foto)
SELECT p.identificador, @foto_placeholder
FROM tmp_productos_extra t
JOIN productos p ON p.descripcion_catalogo = t.descripcion_catalogo
WHERE NOT EXISTS (SELECT 1 FROM fotos f WHERE f.producto = p.identificador);

INSERT INTO catalogos (descripcion, subasta, responsable)
SELECT CONCAT('Catálogo demo — ', t.nombre), s.identificador, 14
FROM tmp_subastas_extra t
JOIN subastas s ON s.ubicacion = CONCAT('[DEMO] ', t.ubicacion)
WHERE NOT EXISTS (SELECT 1 FROM catalogos c WHERE c.descripcion = CONCAT('Catálogo demo — ', t.nombre));

INSERT INTO items_catalogo (catalogo, producto, precio_base, comision, subastado)
SELECT c.identificador, p.identificador, tp.precio_base, tp.comision, IF(s.estado = 'carrada', 'si', 'no')
FROM tmp_productos_extra tp
JOIN productos p   ON p.descripcion_catalogo = tp.descripcion_catalogo
JOIN tmp_subastas_extra ts ON ts.seq = tp.seq
JOIN subastas s    ON s.ubicacion = CONCAT('[DEMO] ', ts.ubicacion)
JOIN catalogos c   ON c.subasta = s.identificador AND c.descripcion = CONCAT('Catálogo demo — ', ts.nombre)
WHERE NOT EXISTS (SELECT 1 FROM items_catalogo i WHERE i.catalogo = c.identificador AND i.producto = p.identificador);

DROP TEMPORARY TABLE IF EXISTS tmp_productos_extra;
DROP TEMPORARY TABLE IF EXISTS tmp_subastas_extra;

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

SELECT 'paises'         AS tabla, COUNT(*) AS total FROM paises
UNION ALL SELECT 'personas',       COUNT(*) FROM personas
UNION ALL SELECT 'empleados',      COUNT(*) FROM empleados
UNION ALL SELECT 'subastadores',   COUNT(*) FROM subastadores
UNION ALL SELECT 'duenios',        COUNT(*) FROM duenios
UNION ALL SELECT 'clientes',       COUNT(*) FROM clientes
UNION ALL SELECT 'usuarios',       COUNT(*) FROM usuarios
UNION ALL SELECT 'subastas',       COUNT(*) FROM subastas
UNION ALL SELECT 'moneda_subasta', COUNT(*) FROM moneda_subasta
UNION ALL SELECT 'productos',      COUNT(*) FROM productos
UNION ALL SELECT 'fotos',          COUNT(*) FROM fotos
UNION ALL SELECT 'catalogos',      COUNT(*) FROM catalogos
UNION ALL SELECT 'items_catalogo', COUNT(*) FROM items_catalogo
UNION ALL SELECT 'asistentes',     COUNT(*) FROM asistentes
UNION ALL SELECT 'pujos',          COUNT(*) FROM pujos;