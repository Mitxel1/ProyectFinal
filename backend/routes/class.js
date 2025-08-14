const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const auth = require('../middlewares/auth');

// Rutas específicas primero
router.get('/upcoming', auth, classController.getUpcomingClasses);
router.get('/available', auth, classController.getAvailableClasses);

// Rutas generales después
router.get('/', auth, classController.getAllClasses);
router.post('/', auth, classController.createClass);

// Rutas con parámetros al final
router.get('/:id', auth, classController.getClassById);
router.put('/:id', auth, classController.updateClass);
router.delete('/:id', auth, classController.deleteClass);

module.exports = router;