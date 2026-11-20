const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// ─────────────────────────────────────────────
// RESERVA SEGURA — con transacción SQL
// Demuestra: BEGIN → verificar stock → descontar → INSERT → COMMIT
// Si algo falla en el medio → ROLLBACK (nadie queda reservado a medias)
// ─────────────────────────────────────────────
router.post('/book', async (req, res) => {
  const { event_id, buyer_name } = req.body;
  const steps = []; // log de pasos para mostrar en el frontend

  const client = await pool.connect(); // conexión dedicada para la transacción

  try {
    steps.push('🔌 Conexión obtenida');

    // 1. Iniciar transacción
    await client.query('BEGIN');
    steps.push('▶️  BEGIN — transacción iniciada');

    // 2. Leer el evento bloqueando la fila (FOR UPDATE evita que otra
    //    transacción simultánea lea el mismo stock antes de que terminemos)
    const eventResult = await client.query(
      'SELECT * FROM events WHERE id = $1 FOR UPDATE',
      [event_id]
    );
    steps.push('🔒 Fila del evento bloqueada (FOR UPDATE)');

    if (eventResult.rows.length === 0) {
      await client.query('ROLLBACK');
      steps.push('↩️  ROLLBACK — evento no existe');
      return res.status(404).json({ success: false, steps, error: 'Evento no encontrado' });
    }

    const event = eventResult.rows[0];
    steps.push(`📋 Stock actual: ${event.available_seats} asientos disponibles`);

    // 3. Verificar stock
    if (event.available_seats <= 0) {
      await client.query('ROLLBACK');
      steps.push('↩️  ROLLBACK — sin asientos disponibles');
      return res.status(409).json({ success: false, steps, error: 'No hay asientos disponibles' });
    }

    // 4. Descontar un asiento
    await client.query(
      'UPDATE events SET available_seats = available_seats - 1 WHERE id = $1',
      [event_id]
    );
    steps.push('➖ UPDATE events — asiento descontado');

    // 5. Registrar la reserva
    const reservation = await client.query(
      'INSERT INTO reservations (event_id, buyer_name, status) VALUES ($1, $2, $3) RETURNING *',
      [event_id, buyer_name, 'confirmed']
    );
    steps.push(`✅ INSERT reservations — reserva creada para "${buyer_name}"`);

    // 6. Confirmar todo
    await client.query('COMMIT');
    steps.push('✔️  COMMIT — transacción completada con éxito');

    res.status(201).json({
      success: true,
      steps,
      reservation: reservation.rows[0],
    });

  } catch (err) {
    await client.query('ROLLBACK');
    steps.push(`💥 ERROR: ${err.message}`);
    steps.push('↩️  ROLLBACK — todos los cambios fueron revertidos');
    res.status(500).json({ success: false, steps, error: err.message });
  } finally {
    client.release(); // siempre devolver la conexión al pool
  }
});

// ─────────────────────────────────────────────
// RESERVA INSEGURA — sin transacción
// Demuestra el problema: dos compradores pueden pasar la verificación
// de stock al mismo tiempo y ambos reservar el último asiento
// ─────────────────────────────────────────────
router.post('/book-unsafe', async (req, res) => {
  const { event_id, buyer_name, delay_ms = 0 } = req.body;
  const steps = [];

  try {
    steps.push('⚠️  Sin transacción — modo INSEGURO');

    // Leer stock (sin bloqueo, sin transacción)
    const eventResult = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ success: false, steps, error: 'Evento no encontrado' });
    }

    const event = eventResult.rows[0];
    steps.push(`📋 Stock leído: ${event.available_seats} asientos`);

    // Simular demora (para que dos requests lleguen "al mismo tiempo")
    if (delay_ms > 0) {
      await new Promise(resolve => setTimeout(resolve, delay_ms));
      steps.push(`⏱️  Esperando ${delay_ms}ms (simulando concurrencia)`);
    }

    // Verificar stock — pero otro comprador pudo haber leído lo mismo
    if (event.available_seats <= 0) {
      steps.push('❌ Sin asientos — reserva rechazada');
      return res.status(409).json({ success: false, steps, error: 'No hay asientos disponibles' });
    }

    // Descontar (sin garantía de atomicidad)
    await pool.query(
      'UPDATE events SET available_seats = available_seats - 1 WHERE id = $1',
      [event_id]
    );
    steps.push('➖ UPDATE events — asiento descontado (sin bloqueo)');

    // Insertar reserva
    const reservation = await pool.query(
      'INSERT INTO reservations (event_id, buyer_name, status) VALUES ($1, $2, $3) RETURNING *',
      [event_id, buyer_name, 'confirmed']
    );
    steps.push(`✅ INSERT reservations — reserva creada para "${buyer_name}"`);

    res.status(201).json({
      success: true,
      steps,
      reservation: reservation.rows[0],
    });

  } catch (err) {
    steps.push(`💥 ERROR: ${err.message}`);
    res.status(500).json({ success: false, steps, error: err.message });
  }
});

// ─────────────────────────────────────────────
// Historial de reservas (con nombre del evento)
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.buyer_name, r.status, r.created_at,
             e.name AS event_name, e.available_seats
      FROM reservations r
      JOIN events e ON r.event_id = e.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resetear asientos de un evento (útil para la demo)
// Restaura available_seats al valor original de total_seats
router.post('/reset/:event_id', async (req, res) => {
  try {
    // Usar total_seats como valor original, ignorar lo que mande el frontend
    const result = await pool.query(
      'UPDATE events SET available_seats = total_seats WHERE id = $1 RETURNING *',
      [req.params.event_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await pool.query(
      'DELETE FROM reservations WHERE event_id = $1',
      [req.params.event_id]
    );

    const ev = result.rows[0];
    res.json({
      success: true,
      message: `Evento reseteado a ${ev.total_seats} asientos`,
      available_seats: ev.total_seats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
