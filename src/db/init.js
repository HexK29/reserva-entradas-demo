const pool = require('../config/db');

const initDB = async () => {
  try {
    // ── Tabla de usuarios (ya existente, se mantiene) ──────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        email      VARCHAR(255) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ── Tabla de eventos ───────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id              SERIAL PRIMARY KEY,
        name            VARCHAR(255) NOT NULL,
        description     TEXT,
        total_seats     INTEGER NOT NULL,
        available_seats INTEGER NOT NULL,
        event_date      TIMESTAMP,
        created_at      TIMESTAMP DEFAULT NOW(),

        CONSTRAINT chk_total_seats     CHECK (total_seats > 0),
        CONSTRAINT chk_available_seats CHECK (available_seats >= 0),
        CONSTRAINT chk_seats_coherence CHECK (available_seats <= total_seats)
      )
    `);

    // ── Tabla de reservas ──────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER NOT NULL,
        buyer_name VARCHAR(255) NOT NULL,
        status     VARCHAR(50) NOT NULL DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT NOW(),

        CONSTRAINT fk_event
          FOREIGN KEY (event_id)
          REFERENCES events(id)
          ON DELETE CASCADE,

        CONSTRAINT chk_status
          CHECK (status IN ('confirmed', 'cancelled', 'pending'))
      )
    `);

    // ── Índice para búsquedas por evento ───────────────────────────────
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reservations_event_id
        ON reservations(event_id)
    `);

    // ── Datos de ejemplo (solo si la tabla está vacía) ─────────────────
    const { rows } = await pool.query('SELECT COUNT(*) FROM events');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO events (name, description, total_seats, available_seats, event_date)
        VALUES
          (
            'Concierto de Rock',
            'Banda en vivo — Estadio Nacional',
            1, 1,
            NOW() + INTERVAL '7 days'
          ),
          (
            'Final de Futbol',
            'Copa Regional — Estadio Municipal',
            2, 2,
            NOW() + INTERVAL '14 days'
          ),
          (
            'Show de Comedia',
            'Stand-up en el Teatro Central',
            3, 3,
            NOW() + INTERVAL '3 days'
          )
      `);
      console.log('🌱 Datos de ejemplo insertados');
    }

    console.log('✅ Base de datos lista');
  } catch (err) {
    console.error('❌ Error al inicializar la base de datos:', err.message);
    process.exit(1); // detener el servidor si la BD falla
  }
};

module.exports = initDB;
