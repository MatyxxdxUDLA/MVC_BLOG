import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { authController } from './controllers/authController.js';
import { postController } from './controllers/postController.js';
import { statsController } from './controllers/statsController.js';
import { auth } from './middleware/auth.js';
import { initializeDefaultUser } from './models/User.js';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// Configuración de rutas de archivos para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

const MONGODB_URI = process.env.MONGODB_URI;

// Conexión a MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    initializeDefaultUser();
  })
  .catch(err => console.error('MongoDB connection error:', err));

  // Middlewares
app.use(compression());
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../dist')));

// Rutas de la API
app.post('/api/login', authController.login);
app.post('/api/posts', auth, postController.create);
app.put('/api/posts/:id', auth, postController.update);
app.get('/api/posts', auth, postController.getAll);
app.get('/api/posts/search', auth, postController.search);
app.delete('/api/posts/:id', auth, postController.delete);
app.get('/api/stats/emotional', auth, statsController.getEmotionalStats);

// Manejo de rutas del frontend (Vue Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});