const express = require('express');
const multer = require('multer');
const db = require('../supabase');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { categoria, buscar } = req.query;
    let sql = 'SELECT * FROM productos WHERE activo = true';
    const params = [];
    if (categoria) { params.push(categoria); sql += ` AND categoria = $${params.length}`; }
    if (buscar) { params.push(`%${buscar}%`); sql += ` AND (nombre ILIKE $${params.length} OR id_unico ILIKE $${params.length})`; }
    sql += ' ORDER BY nombre';
    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows: prod } = await db.query(
      'SELECT * FROM productos WHERE id_unico = $1 AND activo = true',
      [req.params.id.toUpperCase()]
    );
    if (!prod[0]) return res.status(404).json({ error: 'Producto no encontrado' });

    const { rows: talles } = await db.query(
      'SELECT * FROM talles WHERE producto_id = $1 ORDER BY talle',
      [prod[0].id]
    );
    const { rows: stock } = await db.query(
      `SELECT spl.*, l.nombre as local_nombre 
       FROM stock_por_local spl 
       JOIN locales l ON l.id = spl.local_id 
       WHERE spl.producto_id = $1`,
      [prod[0].id]
    );

    res.json({
      ...prod[0],
      talles,
      stock_por_local: stock.map(s => ({ ...s, locales: { nombre: s.local_nombre } }))
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', adminOnly, upload.single('imagen'), async (req, res) => {
  const { id_unico, nombre, categoria, descripcion, precio_venta, precio_costo, stock_minimo } = req.body;
  if (!id_unico || !nombre || !categoria || !precio_venta)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });

  try {
    const existe = await db.query('SELECT id FROM productos WHERE id_unico = $1', [id_unico.toUpperCase()]);
    if (existe.rows[0]) return res.status(400).json({ error: 'El ID ya existe' });

    const { rows } = await db.query(
      `INSERT INTO productos (id_unico, nombre, categoria, descripcion, precio_venta, precio_costo, stock_minimo, activo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING *`,
      [id_unico.toUpperCase(), nombre, categoria, descripcion || null,
       parseFloat(precio_venta), precio_costo ? parseFloat(precio_costo) : null,
       parseInt(stock_minimo) || 5]
    );
    const producto = rows[0];

    if (req.body.talles) {
      const talles = JSON.parse(req.body.talles);
      for (const [talle, stock] of Object.entries(talles)) {
        await db.query(
          'INSERT INTO talles (producto_id, talle, stock_total) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
          [producto.id, talle, parseInt(stock) || 0]
        );
      }
    }

    // Insertar stock 0 en todos los locales
    const { rows: locales } = await db.query('SELECT id FROM locales WHERE activo = true');
    for (const local of locales) {
      await db.query(
        'INSERT INTO stock_por_local (producto_id, local_id, cantidad) VALUES ($1,$2,0) ON CONFLICT DO NOTHING',
        [producto.id, local.id]
      );
    }

    res.status(201).json(producto);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', adminOnly, upload.single('imagen'), async (req, res) => {
  const { nombre, categoria, descripcion, precio_venta, precio_costo, stock_minimo } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE productos SET nombre=$1, categoria=$2, descripcion=$3, precio_venta=$4, precio_costo=$5, stock_minimo=$6
       WHERE id_unico=$7 RETURNING *`,
      [nombre, categoria, descripcion, parseFloat(precio_venta), precio_costo ? parseFloat(precio_costo) : null,
       parseInt(stock_minimo) || 5, req.params.id.toUpperCase()]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', adminOnly, async (req, res) => {
  await db.query('UPDATE productos SET activo = false WHERE id_unico = $1', [req.params.id.toUpperCase()]);
  res.json({ ok: true });
});

module.exports = router;
