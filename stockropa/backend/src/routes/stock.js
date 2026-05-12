const express = require('express');
const db = require('../supabase');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { local_id } = req.query;
    let sql = `SELECT spl.*, p.id_unico, p.nombre, p.categoria, p.imagen_url, p.stock_minimo, l.nombre as local_nombre
               FROM stock_por_local spl
               JOIN productos p ON p.id = spl.producto_id
               JOIN locales l ON l.id = spl.local_id
               WHERE p.activo = true`;
    const params = [];
    const filterLocal = req.user.rol === 'vendedor' ? req.user.local_id : local_id;
    if (filterLocal) { params.push(filterLocal); sql += ` AND spl.local_id = $${params.length}`; }
    sql += ' ORDER BY p.nombre';
    const { rows } = await db.query(sql, params);
    res.json(rows.map(r => ({
      ...r,
      productos: { id_unico: r.id_unico, nombre: r.nombre, categoria: r.categoria, imagen_url: r.imagen_url, stock_minimo: r.stock_minimo },
      locales: { nombre: r.local_nombre }
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/alertas', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT spl.*, p.id_unico, p.nombre, p.stock_minimo, l.nombre as local_nombre
       FROM stock_por_local spl
       JOIN productos p ON p.id = spl.producto_id
       JOIN locales l ON l.id = spl.local_id
       WHERE p.activo = true AND spl.cantidad <= p.stock_minimo
       ORDER BY spl.cantidad ASC`
    );
    res.json(rows.map(r => ({
      ...r,
      productos: { id_unico: r.id_unico, nombre: r.nombre, stock_minimo: r.stock_minimo },
      locales: { nombre: r.local_nombre }
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/ajuste', adminOnly, async (req, res) => {
  const { producto_id, local_id, talle, cantidad_nueva, motivo } = req.body;
  try {
    const { rows } = await db.query('SELECT cantidad FROM stock_por_local WHERE producto_id=$1 AND local_id=$2', [producto_id, local_id]);
    const anterior = rows[0]?.cantidad || 0;
    await db.query('UPDATE stock_por_local SET cantidad=$1 WHERE producto_id=$2 AND local_id=$3', [cantidad_nueva, producto_id, local_id]);
    await db.query(
      `INSERT INTO trazabilidad (tipo, producto_id, local_id, usuario_id, cantidad, talle, nota)
       VALUES ('ajuste',$1,$2,$3,$4,$5,$6)`,
      [producto_id, local_id, req.user.id, cantidad_nueva - anterior, talle || null, motivo || 'Ajuste manual']
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
