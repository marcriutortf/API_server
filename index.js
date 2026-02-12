const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Multer → guardar en disco en uploads/
const upload = multer({ dest: 'uploads/' });

// Configuración S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

// Endpoint login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const client = new Client({
    host: process.env.DB_HOST,
    user: username,
    password: password,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
      rejectUnauthorized: false 
    }
  });

  try {
    await client.connect();
    await client.end();
    res.json({ success: true, message: 'Login correcto' });
  } catch (err) {
    console.error("DETALLE DEL ERROR:", err.message);
    res.status(401).json({ success: false, message: 'Usuario o contraseña incorrecta' });
  }
});

// Endpoint subir foto a S3
app.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    const bucketName = req.body.bucket;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se envió ningún archivo' });
    }

    const fileContent = fs.readFileSync(req.file.path);

    const params = {
      Bucket: bucketName,
      Key: `${Date.now()}_${req.file.originalname}`,
      Body: fileContent,
      ContentType: req.file.mimetype
    };

    await s3.upload(params).promise();

    res.json({ success: true, message: 'Foto subida correctamente' });

  } catch (err) {
    console.error("Error al subir foto:", err);
    res.status(500).json({ success: false, message: 'Error al subir foto' });
  }finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);  // borrar archivo temporal
      console.log("Archivo temporal eliminado:", req.file.path);
    }
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`API lista y escuchando en el puerto ${PORT}`));
