const express = require('express');
const db = require('../supabase');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.use(adminOnly);

router.get('/resumen', async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const desde = req.query.desde || hoy;
    const hasta = req.query.hasta || new Date().toISOString();
    const { rows } = await db.query(
      `SELECT COUNT(*) as cantidad, COALESCE(SUM(total),0) as total_ventas, COALESCE(AVG(total),0) as ticket_promedio
       FROM ventas WHERE created_at >= $1 AND created_at <= $2`, [desde, hasta]
    );
    const { rows: uds } = await db.query(
      `SELECT COALESCE(SUM(iv.cantidad),0) as unidades FROM items_venta iv
       JOIN ventas v ON v.id = iv.venta_id WHERE v.created_at >= $1 AND v.created_at <= $2`, [desde, hasta]
    );
    res.json({
      totalVentas: parseFloat(rows[0].total_ventas),
      cantidadVentas: parseInt(rows[0].cantidad),
      ticketPromedio: parseFloat(rows[0].ticket_promedio),
      totalUnidades: parseInt(uds[0].unidades)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/por-local', async (req, res) => {
  try {
    const desde = req.query.desde || '2020-01-01';
    const hasta = req.query.hasta || new Date().toISOString();
    const { rows } = await db.query(
      `SELECT l.nombre as local, COUNT(*) as cantidad, COALESCE(SUM(v.total),0) as total
       FROM ventas v JOIN locales l ON l.id = v.local_id
       WHERE v.created_at >= $1 AND v.created_at <= $2
       GROUP BY l.nombre ORDER BY total DESC`, [desde, hasta]
    );
    res.json(rows.map(r => ({ ...r, total: parseFloat(r.total) })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/productos-mas-vendidos', async (req, res) => {
  try {
    const desde = req.query.desde || '2020-01-01';
    const hasta = req.query.hasta || new Date().toISOString();
    const limit = parseInt(req.query.limit) || 10;
    const { rows } = await db.query(
      `SELECT iv.id_unico, p.nombre, SUM(iv.cantidad) as unidades, SUM(iv.cantidad * iv.precio_unitario) as total
       FROM items_venta iv
       JOIN productos p ON p.id = iv.producto_id
       JOIN ventas v ON v.id = iv.venta_id
       WHERE v.created_at >= $1 AND v.created_at <= $2
       GROUP BY iv.id_unico, p.nombre ORDER BY unidades DESC LIMIT $3`, [desde, hasta, limit]
    );
    res.json(rows.map(r => ({ ...r, unidades: parseInt(r.unidades), total: parseFloat(r.total) })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/trazabilidad', async (req, res) => {
  try {
    const { local_id, tipo, limit = 100 } = req.query;
    let sql = `SELECT t.*, p.id_unico, p.nombre as prod_nombre, l.nombre as local_nombre, u.nombre as user_nombre, u.rol as user_rol
               FROM trazabilidad t
               JOIN productos p ON p.id = t.producto_id
               JOIN locales l ON l.id = t.local_id
               JOIN usuarios u ON u.id = t.usuario_id WHERE 1=1`;
    const params = [];
    if (local_id) { params.push(local_id); sql += ` AND t.local_id = $${params.length}`; }
    if (tipo) { params.push(tipo); sql += ` AND t.tipo = $${params.length}`; }
    params.push(parseInt(limit));
    sql += ` ORDER BY t.created_at DESC LIMIT $${params.length}`;
    const { rows } = await db.query(sql, params);
    res.json(rows.map(r => ({
      ...r,
      productos: { id_unico: r.id_unico, nombre: r.prod_nombre },
      locales: { nombre: r.local_nombre },
      usuarios: { nombre: r.user_nombre, rol: r.user_rol }
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
