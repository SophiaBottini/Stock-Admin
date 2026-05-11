const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('activo', true)
    .single();

  if (error || !user)
    return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok)
    return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, local_id: user.local_id },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  await supabase.from('usuarios').update({ ultimo_acceso: new Date() }).eq('id', user.id);

  res.json({
    token,
    user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, local_id: user.local_id }
  });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
