// models/Instructor.js
const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email no válido']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    match: [/^[0-9]{10}$/, 'Ingrese un número válido (10 dígitos)']
  },
  especialidad: {
    type: String,
    required: [true, 'La especialidad es requerida'],
    enum: ['Yoga', 'Pilates', 'Crossfit', 'Spinning', 'Funcional', 'Boxeo', 'Natación']
  },
  fechaContratacion: {
    type: Date,
    required: [true, 'La fecha de contratación es requerida'],
    default: Date.now
  },
  horario: {
    type: String,
    required: [true, 'El horario es requerido']
  },
  activo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false // Elimina el campo __v
});

module.exports = mongoose.model('Instructor', InstructorSchema);