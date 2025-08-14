const express = require('express');
const router = express.Router();
const { login, register, getUser, refreshToken } = require('../controllers/authController'); // Añade refreshToken aquí
const auth = require('../middlewares/auth');

// @route   POST api/auth/register
// @desc    Registrar nuevo usuario
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Autenticar usuario
router.post('/login', login);

// @route   GET api/auth/user
// @desc    Obtener datos de usuario
router.get('/user', auth, getUser);

// @route   POST api/auth/refresh
// @desc    Refrescar token JWT
router.post('/refresh', refreshToken);

module.exports = router;