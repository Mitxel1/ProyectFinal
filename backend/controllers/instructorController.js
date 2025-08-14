// controllers/instructorController.js
const Instructor = require('../models/Instructor');
const { validationResult } = require('express-validator');

exports.crearInstructor = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const instructor = new Instructor(req.body);
    await instructor.save();
    res.status(201).json({
      success: true,
      data: instructor
    });
  } catch (err) {
    console.error('Error detallado:', err);
    
    // Manejar errores de validación de Mongoose
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    // Manejar errores de duplicado
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }
    
    // Otros errores
    res.status(500).json({
      success: false,
      error: 'Error al crear el instructor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Obtener todos los instructores
exports.obtenerInstructores = async (req, res, next) => {
  try {
    const instructores = await Instructor.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: instructores.length,
      data: instructores
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los instructores'
    });
  }
};

// Obtener un instructor por ID
exports.obtenerInstructor = async (req, res, next) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: 'Instructor no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: instructor
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el instructor'
    });
  }
};

// Actualizar un instructor
exports.actualizarInstructor = async (req, res, next) => {
  try {
    let instructor = await Instructor.findById(req.params.id);
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: 'Instructor no encontrado'
      });
    }
    
    instructor = await Instructor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: instructor
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el instructor'
    });
  }
};

exports.eliminarInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        
        if (!instructor) {
            return res.status(404).json({ msg: 'Instructor no encontrado' });
        }

        // Método moderno (Mongoose v6+)
        await instructor.deleteOne(); 

        res.json({ msg: 'Instructor eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el instructor');
    }

};