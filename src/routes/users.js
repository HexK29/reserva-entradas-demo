const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Ruta protegida
router.get('/profile', auth, (req, res) => {
  res.json({ message: 'Bienvenido, usuario autenticado', user: req.user });
});

module.exports = router;