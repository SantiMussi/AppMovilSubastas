USE subastas;

INSERT INTO seguros (nro_poliza, compania, poliza_combinada, importe)
VALUES
    ('POL-0001', 'Sancor Seguros', 'SI', 125000.00),
    ('POL-0002', 'La Caja', 'NO', 98000.50),
    ('POL-0003', 'Federación Patronal', 'SI', 143500.75),
    ('POL-0004', 'Mercantil Andina', 'NO', 87500.00),
    ('POL-0005', 'Zurich Argentina', 'SI', 160000.00);

UPDATE productos
SET seguro = CASE MOD(identificador, 5)
                 WHEN 0 THEN 'POL-0001'
                 WHEN 1 THEN 'POL-0002'
                 WHEN 2 THEN 'POL-0003'
                 WHEN 3 THEN 'POL-0004'
                 WHEN 4 THEN 'POL-0005'
    END
WHERE seguro IS NULL;