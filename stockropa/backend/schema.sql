-- ============================================================
-- STOCKROPA — Schema completo para Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- LOCALES
create table locales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  activo boolean default true,
  created_at timestamptz default now()
);

insert into locales (nombre, direccion) values
  ('Centro', 'Av. Principal 100'),
  ('Norte', 'Av. Norte 250'),
  ('Sur', 'Calle Sur 80');

-- USUARIOS
create table usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text unique not null,
  password_hash text not null,
  rol text check (rol in ('admin','vendedor')) not null default 'vendedor',
  local_id uuid references locales(id),
  activo boolean default true,
  ultimo_acceso timestamptz,
  created_at timestamptz default now()
);

-- PRODUCTOS
create table productos (
  id uuid primary key default gen_random_uuid(),
  id_unico text unique not null,
  nombre text not null,
  categoria text not null,
  descripcion text,
  precio_venta numeric(10,2) not null,
  precio_costo numeric(10,2),
  stock_minimo integer default 5,
  imagen_url text,
  activo boolean default true,
  created_at timestamptz default now()
);

-- TALLES POR PRODUCTO
create table talles (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id) on delete cascade,
  talle text not null,
  stock_total integer default 0,
  unique(producto_id, talle)
);

-- STOCK POR LOCAL
create table stock_por_local (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id) on delete cascade,
  local_id uuid references locales(id),
  cantidad integer default 0,
  created_at timestamptz default now(),
  unique(producto_id, local_id)
);

-- VENTAS
create table ventas (
  id uuid primary key default gen_random_uuid(),
  local_id uuid references locales(id),
  usuario_id uuid references usuarios(id),
  medio_pago text not null,
  descuento_pct numeric(5,2) default 0,
  subtotal numeric(12,2) not null,
  total numeric(12,2) not null,
  created_at timestamptz default now()
);

-- ITEMS DE VENTA
create table items_venta (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid references ventas(id) on delete cascade,
  producto_id uuid references productos(id),
  id_unico text not null,
  talle text,
  cantidad integer not null,
  precio_unitario numeric(10,2) not null,
  created_at timestamptz default now()
);

-- TRAZABILIDAD
create table trazabilidad (
  id uuid primary key default gen_random_uuid(),
  tipo text check (tipo in ('venta','ingreso','ajuste','transferencia_salida','transferencia_entrada')) not null,
  producto_id uuid references productos(id),
  local_id uuid references locales(id),
  usuario_id uuid references usuarios(id),
  cantidad integer not null,
  talle text,
  referencia_id uuid,
  nota text,
  created_at timestamptz default now()
);

-- ============================================================
-- FUNCIONES SQL (RPCs)
-- ============================================================

-- Descontar stock al vender
create or replace function descontar_stock(
  p_producto_id uuid, p_local_id uuid, p_talle text, p_cantidad integer
) returns void language plpgsql as $$
begin
  update stock_por_local
    set cantidad = cantidad - p_cantidad
    where producto_id = p_producto_id and local_id = p_local_id;

  update talles
    set stock_total = stock_total - p_cantidad
    where producto_id = p_producto_id and talle = p_talle;
end;
$$;

-- Transferir stock entre locales
create or replace function transferir_stock(
  p_producto_id uuid, p_talle text, p_cantidad integer,
  p_local_origen uuid, p_local_destino uuid
) returns void language plpgsql as $$
begin
  update stock_por_local set cantidad = cantidad - p_cantidad
    where producto_id = p_producto_id and local_id = p_local_origen;
  update stock_por_local set cantidad = cantidad + p_cantidad
    where producto_id = p_producto_id and local_id = p_local_destino;
end;
$$;

-- ============================================================
-- DATOS DE DEMO
-- ============================================================

-- Insertar admin demo (password: admin123)
insert into usuarios (nombre, email, password_hash, rol) values
  ('María López', 'admin@stockropa.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insertar vendedor demo (password: vendedor123)
insert into usuarios (nombre, email, password_hash, rol, local_id)
  select 'Lucía Gómez', 'vendedor@stockropa.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'vendedor', id from locales where nombre = 'Centro' limit 1;

-- Productos demo
insert into productos (id_unico, nombre, categoria, precio_venta, precio_costo, stock_minimo) values
  ('RM001', 'Remera básica', 'Remeras', 3500, 1500, 10),
  ('JN003', 'Jean slim', 'Jeans', 12800, 5500, 8),
  ('BZ007', 'Buzo hoodie', 'Buzos', 8900, 3800, 15),
  ('VS012', 'Vestido floral', 'Vestidos', 6200, 2600, 10),
  ('CK002', 'Campera denim', 'Camperas', 10000, 4200, 8);

-- Storage bucket para imágenes
-- (Ejecutar desde el dashboard de Supabase > Storage > New bucket)
-- Nombre: imagenes, Public: true
