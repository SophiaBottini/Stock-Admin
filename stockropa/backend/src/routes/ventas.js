const express = require('express');
const supabase = require('../supabase');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET ventas con filtros
router.get('/', async (req, res) => {
  const { local_id, desde, hasta, limit = 50 } = req.query;
  let query = supabase
    .from('ventas')
    .select(`*, items_venta(*, productos(id_unico, nombre, imagen_url)), locales(nombre)`)
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));

  // Vendedor solo ve su local
  if (req.user.rol === 'vendedor') {
    query = query.eq('local_id', req.user.local_id);
  } else if (local_id) {
    query = query.eq('local_id', local_id);
  }

  if (desde) query = query.gte('created_at', desde);
  if (hasta) query = query.lte('created_at', hasta);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST registrar venta
router.post('/', async (req, res) => {
  const { local_id, items, medio_pago, descuento_pct = 0 } = req.body;

  if (!local_id || !items?.length || !medio_pago)
    return res.status(400).json({ error: 'Faltan datos de la venta' });

  // Vendedor solo puede vender en su local
  if (req.user.rol === 'vendedor' && req.user.local_id !== local_id)
    return res.status(403).json({ error: 'Solo podés registrar ventas en tu local' });

  // Calcular total
  let subtotal = 0;
  for (const item of items) {
    const { data: prod } = await supabase.from('productos').select('precio_venta').eq('id_unico', item.id_unico).single();
    if (!prod) return res.status(400).json({ error: `Producto ${item.id_unico} no encontrado` });
    subtotal += prod.precio_venta * item.cantidad;
  }
  const total = subtotal * (1 - descuento_pct / 100);

  // Crear venta
  const { data: venta, error: ventaErr } = await supabase.from('ventas').insert({
    local_id,
    usuario_id: req.user.id,
    medio_pago,
    descuento_pct,
    subtotal,
    total,
  }).select().single();

  if (ventaErr) return res.status(500).json({ error: ventaErr.message });

  // Crear items y descontar stock
  for (const item of items) {
    const { data: prod } = await supabase.from('productos').select('id, precio_venta').eq('id_unico', item.id_unico).single();

    await supabase.from('items_venta').insert({
      venta_id: venta.id,
      producto_id: prod.id,
      id_unico: item.id_unico,
      talle: item.talle,
      cantidad: item.cantidad,
      precio_unitario: prod.precio_venta,
    });

    // Descontar stock por local
    await supabase.rpc('descontar_stock', {
      p_producto_id: prod.id,
      p_local_id: local_id,
      p_talle: item.talle,
      p_cantidad: item.cantidad,
    });

    // Registrar en trazabilidad
    await supabase.from('trazabilidad').insert({
      tipo: 'venta',
      producto_id: prod.id,
      local_id,
      usuario_id: req.user.id,
      cantidad: -item.cantidad,
      talle: item.talle,
      referencia_id: venta.id,
      nota: `Venta #${venta.id} - ${medio_pago}`,
    });
  }

  res.status(201).json({ ok: true, venta_id: venta.id, total });
});

module.exports = router;
