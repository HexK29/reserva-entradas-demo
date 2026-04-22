const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  create: async (email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *';
    const values = [email, hashedPassword];
    const result = await pool.query(query, values);
    return result.rows; 
  },

  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const values = [email];
    const result = await pool.query(query, values);
    return result.rows[0]; 
  },

  comparePassword: async (password, hashedPassword) => {
    if (!hashedPassword) {
      throw new Error('Contraseña no encontrada');
    }
    return await bcrypt.compare(password, hashedPassword);
  },
};

module.exports = User;