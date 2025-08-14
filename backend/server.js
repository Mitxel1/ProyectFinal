// server.js - Configuración actualizada para Render + Firebase
require('dotenv').config({ path: '.env' });
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Añadir al inicio del servidor
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('⚠️ Uncaught Exception:', error);
  process.exit(1);
});

// Verificación crítica de variables de entorno
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR FATAL: JWT_SECRET no está definido en .env');
  process.exit(1);
}

connectDB();

const app = express();

// ⭐ CONFIGURACIÓN CORS ACTUALIZADA PARA FIREBASE + RENDER
const allowedOrigins = [
  'https://gymn.web.app',           // URL de producción de Firebase
  'https://gymn.firebaseapp.com',   // URL alternativa de Firebase
  'http://localhost:4200',          // Desarrollo local
  'http://localhost:3000',          // Desarrollo alternativo
];

// Si hay una URL de frontend específica en variables de entorno, agregarla
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Origin bloqueado por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middlewares esenciales
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ⭐ MIDDLEWARE DE LOGGING PARA DEBUGGING
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'No Origin'}`);
  next();
});

// ⭐ RUTA DE HEALTH CHECK PARA RENDER
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Importar rutas
const authRoutes = require('./routes/auth');
const instructorRoutes = require('./routes/instructor');
const classRoutes = require('./routes/class');
const userRoutes = require('./routes/user');
const youtubeRoutes = require('./routes/youtube');

// Configuración de rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/instructores', instructorRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/youtube', youtubeRoutes);

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    msg: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(`🔥 Error [${new Date().toISOString()}]:`, err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Error interno del servidor';
  
  res.status(statusCode).json({ 
    success: false,
    msg: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      path: req.path,
      method: req.method
    })
  });
});

// ⭐ CONFIGURACIÓN DE PUERTO PARA RENDER
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor en ejecución en puerto ${PORT}`);
  console.log(`🌎 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://0.0.0.0:${PORT}`);
  console.log(`📍 Orígenes permitidos:`, allowedOrigins);
});

module.exports = app;