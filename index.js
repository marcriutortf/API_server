const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const client = new Client({
    host: process.env.DB_HOST,
    user: username,
    password: password,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect(); // intenta conectarse
    await client.end();     // desconecta
    res.json({ success: true, message: 'Login correcto' });
  } catch (err) {
    console.error("DETALLE DEL ERROR:", err.message);
    res.status(401).json({ success: false, message: 'Usuario o contraseña incorrecta' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`API lista y escuchando en el puerto ${PORT}`));
