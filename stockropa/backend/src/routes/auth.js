const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  try {
    const { rows } = await db.query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true LIMIT 1',
      [email.toLowerCase()]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, local_id: user.local_id },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    await db.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1', [user.id]);

    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, local_id: user.local_id }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
