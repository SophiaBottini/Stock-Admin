const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../supabase');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.use(adminOnly);

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.nombre, u.email, u.rol, u.local_id, u.activo, u.ultimo_acceso, l.nombre as local_nombre
       FROM usuarios u LEFT JOIN locales l ON l.id = u.local_id ORDER BY u.nombre`
    );
    res.json(rows.map(r => ({ ...r, locales: { nombre: r.local_nombre } })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { nombre, email, password, rol, local_id } = req.body;
  if (!nombre || !email || !password || !rol)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, local_id, activo)
       VALUES ($1,$2,$3,$4,$5,true) RETURNING id, nombre, email, rol, local_id`,
      [nombre, email.toLowerCase(), hash, rol, local_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(400).json({ error: 'El email ya existe o hay un error' }); }
});

router.put('/:id', async (req, res) => {
  const { nombre, rol, local_id, activo, password } = req.body;
  try {
    let sql = `UPDATE usuarios SET nombre=$1, rol=$2, local_id=$3, activo=$4`;
    const params = [nombre, rol, local_id || null, activo];
    if (password) { params.push(await bcrypt.hash(password, 10)); sql += `, password_hash=$${params.length}`; }
    params.push(req.params.id);
    sql += ` WHERE id=$${params.length} RETURNING id, nombre, email, rol`;
    const { rows } = await db.query(sql, params);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  await db.query('UPDATE usuarios SET activo = false WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
