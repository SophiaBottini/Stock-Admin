-- ============================================================
-- STOCKROPA — Schema para Neon (PostgreSQL)
-- Pegá esto en el SQL Editor de Neon y ejecutalo
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE locales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO locales (nombre, direccion) VALUES
  ('Centro', 'Av. Principal 100'),
  ('Norte', 'Av. Norte 250'),
  ('Sur', 'Calle Sur 80');

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol TEXT CHECK (rol IN ('admin','vendedor')) NOT NULL DEFAULT 'vendedor',
  local_id UUID REFERENCES locales(id),
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_unico TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descripcion TEXT,
  precio_venta NUMERIC(10,2) NOT NULL,
  precio_costo NUMERIC(10,2),
  stock_minimo INTEGER DEFAULT 5,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE talles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  talle TEXT NOT NULL,
  stock_total INTEGER DEFAULT 0,
  UNIQUE(producto_id, talle)
);

CREATE TABLE stock_por_local (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  local_id UUID REFERENCES locales(id),
  cantidad INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(producto_id, local_id)
);

CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id UUID REFERENCES locales(id),
  usuario_id UUID REFERENCES usuarios(id),
  medio_pago TEXT NOT NULL,
  descuento_pct NUMERIC(5,2) DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE items_venta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  id_unico TEXT NOT NULL,
  talle TEXT,
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trazabilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT CHECK (tipo IN ('venta','ingreso','ajuste','transferencia_salida','transferencia_entrada')) NOT NULL,
  producto_id UUID REFERENCES productos(id),
  local_id UUID REFERENCES locales(id),
  usuario_id UUID REFERENCES usuarios(id),
  cantidad INTEGER NOT NULL,
  talle TEXT,
  referencia_id UUID,
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DATOS DE DEMO
-- password de admin: admin123
-- password de vendedor: vendedor123
-- ============================================================

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('María López', 'admin@stockropa.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy7', 'admin');

INSERT INTO usuarios (nombre, email, password_hash, rol, local_id)
  SELECT 'Lucía Gómez', 'vendedor@stockropa.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy7',
    'vendedor', id FROM locales WHERE nombre = 'Centro' LIMIT 1;

INSERT INTO productos (id_unico, nombre, categoria, precio_venta, precio_costo, stock_minimo) VALUES
  ('RM001', 'Remera básica', 'Remeras', 3500, 1500, 10),
  ('JN003', 'Jean slim', 'Jeans', 12800, 5500, 8),
  ('BZ007', 'Buzo hoodie', 'Buzos', 8900, 3800, 15),
  ('VS012', 'Vestido floral', 'Vestidos', 6200, 2600, 10),
  ('CK002', 'Campera denim', 'Camperas', 10000, 4200, 8);

INSERT INTO talles (producto_id, talle, stock_total)
  SELECT id, unnest(ARRAY['S','M','L','XL']), 10 FROM productos WHERE id_unico = 'RM001';
INSERT INTO talles (producto_id, talle, stock_total)
  SELECT id, unnest(ARRAY['36','38','40','42']), 6 FROM productos WHERE id_unico = 'JN003';
INSERT INTO talles (producto_id, talle, stock_total)
  SELECT id, unnest(ARRAY['S','M','L']), 2 FROM productos WHERE id_unico = 'BZ007';
INSERT INTO talles (producto_id, talle, stock_total)
  SELECT id, unnest(ARRAY['XS','S','M']), 1 FROM productos WHERE id_unico = 'VS012';
INSERT INTO talles (producto_id, talle, stock_total)
  SELECT id, unnest(ARRAY['M','L','XL']), 8 FROM productos WHERE id_unico = 'CK002';

INSERT INTO stock_por_local (producto_id, local_id, cantidad)
  SELECT p.id, l.id,
    CASE l.nombre WHEN 'Centro' THEN 24 WHEN 'Norte' THEN 18 ELSE 12 END
  FROM productos p CROSS JOIN locales l WHERE p.id_unico = 'RM001';

INSERT INTO stock_por_local (producto_id, local_id, cantidad)
  SELECT p.id, l.id,
    CASE l.nombre WHEN 'Centro' THEN 8 WHEN 'Norte' THEN 11 ELSE 5 END
  FROM productos p CROSS JOIN locales l WHERE p.id_unico = 'JN003';

INSERT INTO stock_por_local (producto_id, local_id, cantidad)
  SELECT p.id, l.id,
    CASE l.nombre WHEN 'Centro' THEN 3 WHEN 'Norte' THEN 2 ELSE 0 END
  FROM productos p CROSS JOIN locales l WHERE p.id_unico = 'BZ007';

INSERT INTO stock_por_local (producto_id, local_id, cantidad)
  SELECT p.id, l.id,
    CASE l.nombre WHEN 'Centro' THEN 1 WHEN 'Norte' THEN 0 ELSE 1 END
  FROM productos p CROSS JOIN locales l WHERE p.id_unico = 'VS012';

INSERT INTO stock_por_local (producto_id, local_id, cantidad)
  SELECT p.id, l.id,
    CASE l.nombre WHEN 'Centro' THEN 15 WHEN 'Norte' THEN 9 ELSE 6 END
  FROM productos p CROSS JOIN locales l WHERE p.id_unico = 'CK002';
