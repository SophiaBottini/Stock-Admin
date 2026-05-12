# 🟢 StockRopa — Sistema de gestión de stock para locales de ropa

## Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de datos:** Supabase (PostgreSQL en la nube)
- **Imágenes:** Supabase Storage
- **Deploy:** Vercel (frontend) + Railway (backend)

---

## 🚀 Cómo levantar el proyecto en 4 pasos

### PASO 1 — Crear la base de datos en Supabase (gratis)

1. Ir a https://supabase.com y crear una cuenta
2. Crear un nuevo proyecto (anotá la contraseña)
3. Ir a **SQL Editor** y pegar todo el contenido de `backend/schema.sql`
4. Hacer clic en **Run** — crea todas las tablas y datos de demo
5. Ir a **Storage > New bucket**, crear bucket llamado `imagenes`, marcar **Public**
6. Ir a **Settings > API** y copiar:
   - `Project URL` → es tu `SUPABASE_URL`
   - `service_role` key → es tu `SUPABASE_SERVICE_KEY`

---

### PASO 2 — Levantar el backend (Node.js)

```bash
cd backend
npm install

# Crear archivo .env copiando el ejemplo
cp .env.example .env
# Editar .env con tus datos de Supabase y un JWT_SECRET inventado
```

Contenido del `.env`:
```
PORT=3001
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
JWT_SECRET=una-clave-larga-que-vos-inventas
```

```bash
npm run dev
# El backend corre en http://localhost:3001
```

---

### PASO 3 — Levantar el frontend (React)

```bash
cd frontend
npm install

cp .env.example .env
# El .env por defecto apunta a http://localhost:3001/api — no hace falta cambiarlo en local
```

```bash
npm run dev
# El frontend corre en http://localhost:5173
```

---

### PASO 4 — Abrir en el navegador

Ir a http://localhost:5173

**Usuarios de demo:**
| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@stockropa.com | admin123 |
| Vendedor | vendedor@stockropa.com | vendedor123 |

---

## 🌐 Deploy para acceder desde cualquier lugar (casa + locales)

### Frontend → Vercel (gratis)
1. Subir la carpeta `frontend` a GitHub
2. Ir a https://vercel.com → New Project → importar el repo
3. En **Environment Variables** agregar: `VITE_API_URL=https://tu-backend.railway.app/api`
4. Deploy — te da una URL pública tipo `https://stockropa.vercel.app`

### Backend → Railway (gratis)
1. Subir la carpeta `backend` a GitHub
2. Ir a https://railway.app → New Project → Deploy from GitHub
3. En **Variables** agregar las mismas del `.env`
4. Railway te da una URL pública → copiarla al `VITE_API_URL` de Vercel

---

## 📁 Estructura del proyecto

```
stockropa/
├── backend/
│   ├── src/
│   │   ├── index.js          # Servidor Express
│   │   ├── supabase.js       # Cliente Supabase
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT + roles
│   │   └── routes/
│   │       ├── auth.js       # Login
│   │       ├── productos.js  # CRUD productos + imágenes
│   │       ├── ventas.js     # Registrar ventas
│   │       ├── stock.js      # Stock, ajustes, transferencias
│   │       ├── reportes.js   # Reportes + trazabilidad
│   │       └── usuarios.js   # Gestión de usuarios
│   ├── schema.sql            # Base de datos completa
│   └── .env.example
│
└── frontend/
    └── src/
        ├── App.jsx           # Rutas y protección por rol
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   └── useApi.js     # Axios con token automático
        ├── components/
        │   └── Layout.jsx    # Sidebar + topbar
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Buscar.jsx        # Búsqueda por ID único
            ├── NuevaVenta.jsx    # Carrito + confirmar venta
            ├── Stock.jsx
            ├── AgregarProducto.jsx
            ├── Trazabilidad.jsx
            ├── Reportes.jsx
            ├── Alertas.jsx
            └── Usuarios.jsx
```

---

## 🔐 Roles

| Función | Admin | Vendedor |
|---------|-------|---------|
| Dashboard | ✅ | ❌ |
| Buscar producto | ✅ | ✅ |
| Nueva venta | ✅ | ✅ (solo su local) |
| Stock completo | ✅ | ❌ |
| Trazabilidad | ✅ | ❌ |
| Reportes | ✅ | ❌ |
| Alertas | ✅ | ❌ |
| Usuarios | ✅ | ❌ |
| Ajuste de stock | ✅ | ❌ |
| Transferencias | ✅ | ❌ |
