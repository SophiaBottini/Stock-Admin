const express = require('express');
const supabase = require('../supabase');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET stock general
router.get('/', async (req, res) => {
  const { local_id } = req.query;
  let query = supabase
    .from('stock_por_local')
    .select('*, productos(id_unico, nombre, categoria, imagen_url, stock_minimo), locales(nombre)')
    .order('created_at', { ascending: false });

  if (req.user.rol === 'vendedor') {
    query = query.eq('local_id', req.user.local_id);
  } else if (local_id) {
    query = query.eq('local_id', local_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET alertas stock bajo
router.get('/alertas', async (req, res) => {
  const { data, error } = await supabase
    .from('stock_por_local')
    .select('*, productos(id_unico, nombre, categoria, stock_minimo), locales(nombre)')
    .filter('cantidad', 'lt', 'productos.stock_minimo');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST ajuste de stock manual (admin)
router.post('/ajuste', adminOnly, async (req, res) => {
  const { producto_id, local_id, talle, cantidad_nueva, motivo } = req.body;

  const { data: actual } = await supabase
    .from('stock_por_local')
    .select('cantidad')
    .eq('producto_id', producto_id)
    .eq('local_id', local_id)
    .single();

  const diferencia = cantidad_nueva - (actual?.cantidad || 0);

  const { error } = await supabase
    .from('stock_por_local')
    .upsert({ producto_id, local_id, cantidad: cantidad_nueva });

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from('trazabilidad').insert({
    tipo: 'ajuste',
    producto_id,
    local_id,
    usuario_id: req.user.id,
    cantidad: diferencia,
    talle,
    nota: motivo || 'Ajuste manual',
  });

  res.json({ ok: true });
});

// POST transferencia entre locales (admin)
router.post('/transferencia', adminOnly, async (req, res) => {
  const { producto_id, talle, cantidad, local_origen_id, local_destino_id, nota } = req.body;

  await supabase.rpc('transferir_stock', {
    p_producto_id: producto_id,
    p_talle: talle,
    p_cantidad: cantidad,
    p_local_origen: local_origen_id,
    p_local_destino: local_destino_id,
  });

  await supabase.from('trazabilidad').insert([
    { tipo: 'transferencia_salida', producto_id, local_id: local_origen_id, usuario_id: req.user.id, cantidad: -cantidad, talle, nota },
    { tipo: 'transferencia_entrada', producto_id, local_id: local_destino_id, usuario_id: req.user.id, cantidad, talle, nota },
  ]);

  res.json({ ok: true });
});

module.exports = router;
