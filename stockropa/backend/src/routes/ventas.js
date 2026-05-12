const express = require('express');
const db = require('../supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { local_id, limit = 50 } = req.query;
    let sql = `SELECT v.*, l.nombre as local_nombre 
               FROM ventas v JOIN locales l ON l.id = v.local_id`;
    const params = [];
    if (req.user.rol === 'vendedor') {
      params.push(req.user.local_id);
      sql += ` WHERE v.local_id = $${params.length}`;
    } else if (local_id) {
      params.push(local_id);
      sql += ` WHERE v.local_id = $${params.length}`;
    }
    params.push(parseInt(limit));
    sql += ` ORDER BY v.created_at DESC LIMIT $${params.length}`;
    const { rows } = await db.query(sql, params);
    res.json(rows.map(r => ({ ...r, locales: { nombre: r.local_nombre } })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { local_id, items, medio_pago, descuento_pct = 0 } = req.body;
  if (!local_id || !items?.length || !medio_pago)
    return res.status(400).json({ error: 'Faltan datos de la venta' });

  if (req.user.rol === 'vendedor' && req.user.local_id !== local_id)
    return res.status(403).json({ error: 'Solo podés registrar ventas en tu local' });

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    let subtotal = 0;
    const itemsConPrecio = [];

    for (const item of items) {
      const { rows } = await client.query(
        'SELECT id, precio_venta FROM productos WHERE id_unico = $1', [item.id_unico]
      );
      if (!rows[0]) throw new Error(`Producto ${item.id_unico} no encontrado`);
      subtotal += rows[0].precio_venta * item.cantidad;
      itemsConPrecio.push({ ...item, producto_id: rows[0].id, precio: rows[0].precio_venta });
    }

    const total = subtotal * (1 - descuento_pct / 100);

    const { rows: ventaRows } = await client.query(
      `INSERT INTO ventas (local_id, usuario_id, medio_pago, descuento_pct, subtotal, total)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [local_id, req.user.id, medio_pago, descuento_pct, subtotal, total]
    );
    const venta_id = ventaRows[0].id;

    for (const item of itemsConPrecio) {
      await client.query(
        `INSERT INTO items_venta (venta_id, producto_id, id_unico, talle, cantidad, precio_unitario)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [venta_id, item.producto_id, item.id_unico, item.talle, item.cantidad, item.precio]
      );
      await client.query(
        `UPDATE stock_por_local SET cantidad = cantidad - $1 WHERE producto_id = $2 AND local_id = $3`,
        [item.cantidad, item.producto_id, local_id]
      );
      if (item.talle) {
        await client.query(
          `UPDATE talles SET stock_total = stock_total - $1 WHERE producto_id = $2 AND talle = $3`,
          [item.cantidad, item.producto_id, item.talle]
        );
      }
      await client.query(
        `INSERT INTO trazabilidad (tipo, producto_id, local_id, usuario_id, cantidad, talle, referencia_id, nota)
         VALUES ('venta',$1,$2,$3,$4,$5,$6,$7)`,
        [item.producto_id, local_id, req.user.id, -item.cantidad, item.talle, venta_id, `Venta - ${medio_pago}`]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ ok: true, venta_id, total });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
