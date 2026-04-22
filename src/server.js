const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const reservationRoutes = require('./routes/reservations');
const initDB = require('./db/init');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Servir el frontend visual desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reservations', reservationRoutes);

// Ruta raíz → abre el panel de demo
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar BD y luego levantar el servidor
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🎟️  Panel de demo: http://localhost:${PORT}`);
  });
});
