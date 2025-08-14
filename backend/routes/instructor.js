// routes/instructor.js
const express = require('express'); 
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
// Validaciones
const validarInstructor = [
  check('nombre', 'El nombre es requerido').not().isEmpty(),
  check('apellido', 'El apellido es requerido').not().isEmpty(),
  check('email', 'Ingrese un email válido').isEmail(),
  check('telefono', 'El teléfono debe tener 10 dígitos').isLength({ min: 10, max: 10 }),
  check('especialidad', 'La especialidad es requerida').not().isEmpty(),
  check('horario', 'El horario es requerido').not().isEmpty()
];

// /api/instructores
router.route('/')
  .get(instructorController.obtenerInstructores)
  .post(validarInstructor, instructorController.crearInstructor);

// /api/instructores/:id
router.route('/:id')
  .get(instructorController.obtenerInstructor)
  .put(validarInstructor, instructorController.actualizarInstructor)
  .delete(auth, instructorController.eliminarInstructor);

module.exports = router;