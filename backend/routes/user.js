const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth');
const User = require('../models/User');
const multer = require('multer');

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/profile-images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// Obtener perfil del usuario
// Obtener perfil del usuario - Modificado para excluir password y mejorar respuesta
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v') // Excluir campos sensibles
      .lean(); // Convertir a objeto plano
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Formatear fecha de creación
    user.createdAt = new Date(user.createdAt).toLocaleDateString();
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener perfil' 
    });
  }
});
// Actualizar perfil
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// Subir imagen de perfil
router.post('/profile/image', authenticateUser, upload.single('profileImage'), async (req, res) => {
  try {
    const imageUrl = `/uploads/profile-images/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    );
    res.json({ imageUrl: user.profileImage });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});

module.exports = router;