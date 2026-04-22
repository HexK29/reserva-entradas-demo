-- ============================================================
-- SCRIPT DE BASE DE DATOS — Sistema de Reserva de Entradas
-- Motor: PostgreSQL 14+
-- Base de datos: primer_proyecto_api
--
-- Cómo ejecutar desde psql:
--   psql -U postgres -d primer_proyecto_api -f src/db/schema.sql
--
-- O desde pgAdmin: abrir Query Tool y pegar este archivo
-- ============================================================

-- Conectarse a la base de datos correcta
\c primer_proyecto_api;

-- ─────────────────────────────────────────────
-- Tabla de usuarios (ya existente, se mantiene)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Tabla de eventos
-- ─────────────────────────────────────────────
DROP TABLE IF EXISTS reservations;  -- primero la dependiente
DROP TABLE IF EXISTS events;

CREATE TABLE events (
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
);

-- ─────────────────────────────────────────────
-- Tabla de reservas
-- ─────────────────────────────────────────────
CREATE TABLE reservations (
  id          SERIAL PRIMARY KEY,
  event_id    INTEGER NOT NULL,
  buyer_name  VARCHAR(255) NOT NULL,
  status      VARCHAR(50) NOT NULL DEFAULT 'confirmed',
  created_at  TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_event
    FOREIGN KEY (event_id)
    REFERENCES events(id)
    ON DELETE CASCADE,

  CONSTRAINT chk_status
    CHECK (status IN ('confirmed', 'cancelled', 'pending'))
);

-- Índice para acelerar búsquedas por evento
CREATE INDEX IF NOT EXISTS idx_reservations_event_id
  ON reservations(event_id);

-- ─────────────────────────────────────────────
-- Datos de ejemplo para la demo
-- (1 asiento disponible para demostrar la concurrencia)
-- ─────────────────────────────────────────────
INSERT INTO events (name, description, total_seats, available_seats, event_date)
VALUES
  (
    'Concierto de Rock',
    'Banda en vivo — Estadio Nacional',
    100,
    1,
    NOW() + INTERVAL '7 days'
  ),
  (
    'Final de Futbol',
    'Copa Regional — Estadio Municipal',
    200,
    2,
    NOW() + INTERVAL '14 days'
  ),
  (
    'Show de Comedia',
    'Stand-up en el Teatro Central',
    50,
    3,
    NOW() + INTERVAL '3 days'
  );

-- ─────────────────────────────────────────────
-- Verificación: mostrar tablas creadas
-- ─────────────────────────────────────────────
SELECT 'Tabla events creada' AS resultado, COUNT(*) AS filas FROM events
UNION ALL
SELECT 'Tabla reservations creada', COUNT(*) FROM reservations;
