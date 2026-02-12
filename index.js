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
    res.status(401).json({ success: false, message: 'Usuario o contraseña incorrecta' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API funcionando en http://localhost:${PORT}`));