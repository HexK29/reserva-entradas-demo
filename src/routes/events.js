const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Listar todos los eventos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un evento por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
