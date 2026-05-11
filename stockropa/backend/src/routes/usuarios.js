const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../supabase');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.use(adminOnly);

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, local_id, activo, ultimo_acceso, locales(nombre)')
    .order('nombre');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { nombre, email, password, rol, local_id } = req.body;
  if (!nombre || !email || !password || !rol)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });

  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('usuarios').insert({
    nombre, email: email.toLowerCase(), password_hash: hash, rol, local_id: local_id || null, activo: true
  }).select('id, nombre, email, rol, local_id').single();

  if (error) return res.status(400).json({ error: 'El email ya existe o hay un error' });
  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const { nombre, rol, local_id, activo, password } = req.body;
  const updates = { nombre, rol, local_id: local_id || null, activo };
  if (password) updates.password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase.from('usuarios').update(updates).eq('id', req.params.id).select('id, nombre, email, rol').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  await supabase.from('usuarios').update({ activo: false }).eq('id', req.params.id);
  res.json({ ok: true });
});

module.exports = router;
