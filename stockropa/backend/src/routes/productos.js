const express = require('express');
const multer = require('multer');
const supabase = require('../supabase');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authMiddleware);

// GET todos los productos
router.get('/', async (req, res) => {
  const { categoria, buscar } = req.query;
  let query = supabase.from('productos').select('*').eq('activo', true).order('nombre');

  if (categoria) query = query.eq('categoria', categoria);
  if (buscar) query = query.or(`nombre.ilike.%${buscar}%,id_unico.ilike.%${buscar}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET producto por ID único
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('productos')
    .select(`*, stock_por_local(*), talles(*)`)
    .eq('id_unico', req.params.id.toUpperCase())
    .eq('activo', true)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(data);
});

// POST crear producto (admin)
router.post('/', adminOnly, upload.single('imagen'), async (req, res) => {
  const { id_unico, nombre, categoria, descripcion, precio_venta, precio_costo, stock_minimo } = req.body;

  if (!id_unico || !nombre || !categoria || !precio_venta)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });

  // Verificar ID único
  const { data: existe } = await supabase.from('productos').select('id').eq('id_unico', id_unico.toUpperCase()).single();
  if (existe) return res.status(400).json({ error: 'El ID ya existe. Elegí otro.' });

  let imagen_url = null;

  // Subir imagen a Supabase Storage
  if (req.file) {
    const ext = req.file.mimetype.split('/')[1];
    const path = `productos/${id_unico.toUpperCase()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('imagenes')
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from('imagenes').getPublicUrl(path);
      imagen_url = urlData.publicUrl;
    }
  }

  const { data, error } = await supabase.from('productos').insert({
    id_unico: id_unico.toUpperCase(),
    nombre,
    categoria,
    descripcion,
    precio_venta: parseFloat(precio_venta),
    precio_costo: precio_costo ? parseFloat(precio_costo) : null,
    stock_minimo: parseInt(stock_minimo) || 5,
    imagen_url,
    activo: true
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Insertar talles si vienen
  if (req.body.talles) {
    const talles = JSON.parse(req.body.talles);
    const tallesRows = Object.entries(talles).map(([talle, stock]) => ({
      producto_id: data.id, talle, stock_total: parseInt(stock) || 0
    }));
    await supabase.from('talles').insert(tallesRows);
  }

  // Insertar stock por local si viene
  if (req.body.stock_locales) {
    const locales = JSON.parse(req.body.stock_locales);
    const localRows = locales.map(l => ({
      producto_id: data.id, local_id: l.local_id, cantidad: parseInt(l.cantidad) || 0
    }));
    await supabase.from('stock_por_local').insert(localRows);
  }

  res.status(201).json(data);
});

// PUT actualizar producto (admin)
router.put('/:id', adminOnly, upload.single('imagen'), async (req, res) => {
  const { nombre, categoria, descripcion, precio_venta, precio_costo, stock_minimo } = req.body;

  const updates = { nombre, categoria, descripcion, precio_venta: parseFloat(precio_venta), precio_costo: precio_costo ? parseFloat(precio_costo) : null, stock_minimo: parseInt(stock_minimo) || 5 };

  if (req.file) {
    const ext = req.file.mimetype.split('/')[1];
    const path = `productos/${req.params.id.toUpperCase()}.${ext}`;
    await supabase.storage.from('imagenes').upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
    const { data: urlData } = supabase.storage.from('imagenes').getPublicUrl(path);
    updates.imagen_url = urlData.publicUrl;
  }

  const { data, error } = await supabase.from('productos').update(updates).eq('id_unico', req.params.id.toUpperCase()).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE (soft delete, admin)
router.delete('/:id', adminOnly, async (req, res) => {
  const { error } = await supabase.from('productos').update({ activo: false }).eq('id_unico', req.params.id.toUpperCase());
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
