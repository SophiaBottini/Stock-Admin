const express = require('express');
const supabase = require('../supabase');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.use(adminOnly);

router.get('/resumen', async (req, res) => {
  const { desde, hasta, local_id } = req.query;
  const hoy = new Date().toISOString().split('T')[0];
  const desdeDate = desde || hoy;
  const hastaDate = hasta || hoy + 'T23:59:59';

  let query = supabase
    .from('ventas')
    .select('total, items_venta(cantidad)')
    .gte('created_at', desdeDate)
    .lte('created_at', hastaDate);

  if (local_id) query = query.eq('local_id', local_id);

  const { data: ventas, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const totalVentas = ventas.reduce((s, v) => s + v.total, 0);
  const totalUnidades = ventas.reduce((s, v) => s + v.items_venta.reduce((a, i) => a + i.cantidad, 0), 0);
  const ticketPromedio = ventas.length ? totalVentas / ventas.length : 0;

  res.json({ totalVentas, totalUnidades, cantidadVentas: ventas.length, ticketPromedio });
});

router.get('/por-local', async (req, res) => {
  const { desde, hasta } = req.query;
  const { data, error } = await supabase
    .from('ventas')
    .select('local_id, total, locales(nombre)')
    .gte('created_at', desde || '2020-01-01')
    .lte('created_at', hasta || new Date().toISOString());

  if (error) return res.status(500).json({ error: error.message });

  const agrupado = {};
  data.forEach(v => {
    const key = v.local_id;
    if (!agrupado[key]) agrupado[key] = { local: v.locales?.nombre, total: 0, cantidad: 0 };
    agrupado[key].total += v.total;
    agrupado[key].cantidad += 1;
  });

  res.json(Object.values(agrupado).sort((a, b) => b.total - a.total));
});

router.get('/productos-mas-vendidos', async (req, res) => {
  const { desde, hasta, limit = 10 } = req.query;
  const { data, error } = await supabase
    .from('items_venta')
    .select('id_unico, cantidad, precio_unitario, productos(nombre, imagen_url), ventas!inner(created_at, local_id)')
    .gte('ventas.created_at', desde || '2020-01-01')
    .lte('ventas.created_at', hasta || new Date().toISOString());

  if (error) return res.status(500).json({ error: error.message });

  const agrupado = {};
  data.forEach(i => {
    if (!agrupado[i.id_unico]) agrupado[i.id_unico] = { id_unico: i.id_unico, nombre: i.productos?.nombre, imagen_url: i.productos?.imagen_url, unidades: 0, total: 0 };
    agrupado[i.id_unico].unidades += i.cantidad;
    agrupado[i.id_unico].total += i.cantidad * i.precio_unitario;
  });

  const resultado = Object.values(agrupado).sort((a, b) => b.unidades - a.unidades).slice(0, parseInt(limit));
  res.json(resultado);
});

router.get('/trazabilidad', async (req, res) => {
  const { local_id, tipo, desde, hasta, limit = 100 } = req.query;
  let query = supabase
    .from('trazabilidad')
    .select('*, productos(id_unico, nombre), locales(nombre), usuarios(nombre, rol)')
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));

  if (local_id) query = query.eq('local_id', local_id);
  if (tipo) query = query.eq('tipo', tipo);
  if (desde) query = query.gte('created_at', desde);
  if (hasta) query = query.lte('created_at', hasta);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
