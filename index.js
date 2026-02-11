const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint login usando usuario de la DB directamente
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const client = new Client({
    host: process.env.DB_HOST,
    user: username,           // usuario que envía la app
    password: password,       // contraseña que envía la app
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();   // intenta conectarse
    await client.end();       // desconecta si OK
    res.json({ success: true, message: 'Login correcto' });
  } catch (err) {
    console.error("Error login:", err); // 🔍 log para debug
    res.status(401).json({ success: false, message: 'Usuario o contraseña incorrecta' });
  }
});

// Endpoint prueba
app.get('/', (req, res) => {
  res.send('API funcionando correctamente!');
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API funcionando en http://localhost:${PORT}`));