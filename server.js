const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Datos en memoria para demo
let user = {
  user: {
    username: 'carlosandresmoreno',
    first_name: 'Carlos',
    last_name: 'Moreno',
    email: 'carlos@example.com'
  },
  telefono: '123456',
  tipo_usuario: 'instructor',
  tipo_naturaleza: 'natural',
  biografia: 'Biografía de ejemplo',
  documento: '90122856',
  linkedin: 'https://www.linkedin.com/in/carlos/',
  twitter: '',
  github: '',
  sitio_web: '',
  esta_verificado: false,
  foto: ''
};

// POST /login/
app.post('/usuarios/api/login/', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'carlosandresmoreno' && password === '90122856_Hanz') {
    return res.json({ access: 'fake-access-token', refresh: 'fake-refresh-token' });
  }
  return res.status(401).json({ detail: 'Credenciales inválidas' });
});

// GET /perfil/
app.get('/usuarios/api/perfil/', (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ detail: 'No autorizado' });
  return res.json({ status: 'success', data: user, message: 'Perfil obtenido' });
});

// PUT /usuario/perfil/
app.put('/usuarios/api/usuario/perfil/', (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ detail: 'No autorizado' });
  const payload = req.body || {};
  // Actualiza parcialmente
  user = { ...user, ...payload };
  if (payload.user) {
    user.user = { ...user.user, ...payload.user };
  }
  return res.json({ status: 'success', data: user, message: 'Perfil actualizado correctamente' });
});

// PATCH /perfil/foto/
app.patch('/usuarios/api/perfil/foto/', upload.single('foto'), (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ detail: 'No autorizado' });
  if (!req.file) return res.status(400).json({ status: 'error', message: 'No se recibió archivo' });
  // En demo guardamos la ruta temporal
  user.foto = `http://localhost:8010/${req.file.path}`;
  return res.json({ status: 'success', data: user, message: 'Foto actualizada' });
});

// Servir uploads para ver la imagen
app.use('/uploads', express.static('uploads'));
app.use('/uploads/', express.static('uploads'));

app.listen(8010, () => console.log('Mock API escuchando en http://localhost:8010'));
