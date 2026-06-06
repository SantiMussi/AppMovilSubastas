USE subastas;

INSERT INTO sectores (identificador, nombre_sector, codigo_sector, responsable_sector)
VALUES
(1, 'Dirección', 'DIR', NULL),
(2, 'Tasaciones', 'TAS', NULL),
(3, 'Catálogo y productos', 'CAT', NULL),
(4, 'Clientes y postores', 'CLI', NULL),
(5, 'Dueños / propietarios', 'DUE', NULL),
(6, 'Legal y seguros', 'LEG', NULL),
(7, 'Pagos y cobranzas', 'PAG', NULL),
(8, 'Logística y sala', 'LOG', NULL);

SELECT * FROM sectores;

INSERT INTO empleados (identificador, cargo, sector)
VALUES
(1,  'Gerente general', 1),
(2,  'Director de subastas', 1),
(3,  'Coordinador de subastas', 1),
(4,  'Subastador principal', 1),
(5,  'Asistente de subastas', 1),

(6,  'Jefe de tasaciones', 2),
(7,  'Tasador de arte', 2),
(8,  'Tasador de vehículos', 2),
(9,  'Tasador de inmuebles', 2),
(10, 'Tasador de antigüedades', 2),

(11, 'Revisor de productos', 3),
(12, 'Inspector de productos', 3),
(13, 'Catalogador', 3),
(14, 'Responsable de catálogo', 3),
(15, 'Fotógrafo de catálogo', 3),

(16, 'Analista de clientes', 4),
(17, 'Verificador de clientes', 4),
(18, 'Ejecutivo de atención al cliente', 4),
(19, 'Responsable de admisiones', 4),
(20, 'Gestor de postores', 4),

(21, 'Analista de dueños', 5),
(22, 'Verificador financiero', 5),
(23, 'Verificador judicial', 5),
(24, 'Analista de riesgo', 5),
(25, 'Gestor de propietarios', 5),

(26, 'Responsable de seguros', 6),
(27, 'Analista de pólizas', 6),
(28, 'Gestor de documentación', 6),
(29, 'Responsable legal', 6),
(30, 'Auxiliar legal', 6),

(31, 'Responsable de pagos', 7),
(32, 'Analista de medios de pago', 7),
(33, 'Cajero', 7),
(34, 'Administrador de garantías', 7),
(35, 'Gestor de cobranzas', 7),

(36, 'Responsable de logística', 8),
(37, 'Coordinador de depósito', 8),
(38, 'Encargado de seguridad', 8),
(39, 'Operador de sala', 8),
(40, 'Soporte técnico de subastas', 8);

SELECT * FROM empleados;

UPDATE sectores SET responsable_sector = 1 WHERE identificador = 1;
UPDATE sectores SET responsable_sector = 6 WHERE identificador = 2;
UPDATE sectores SET responsable_sector = 14 WHERE identificador = 3;
UPDATE sectores SET responsable_sector = 19 WHERE identificador = 4;
UPDATE sectores SET responsable_sector = 25 WHERE identificador = 5;
UPDATE sectores SET responsable_sector = 26 WHERE identificador = 6;
UPDATE sectores SET responsable_sector = 31 WHERE identificador = 7;
UPDATE sectores SET responsable_sector = 36 WHERE identificador = 8;

SELECT * FROM sectores;

-- Subastador demo (persona 41)
INSERT INTO subastadores (identificador, matricula, region)
VALUES (41, 'MAT-DEMO-01', 'Buenos Aires');

-- Dueños demo (personas 42 y 43)
INSERT INTO duenios (identificador, numero_pais, verificacion_financiera, verificacion_judicial, calificacion_riesgo, verificador)
VALUES
(42, 32, 'si', 'si', 1, 1),
(43, 32, 'si', 'si', 1, 1);

-- Empresa como cliente (requerido por app.empresa.cliente-id=1)
INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador)
VALUES (1, 32, 'si', 'platino', 1);