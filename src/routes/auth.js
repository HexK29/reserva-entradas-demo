const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// Registrar usuario
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create(email, password);
    res.status(201).json({ message: 'Usuario creado', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email); // ✅ Debe estar con 'const'
    if (!user) {
      return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;