const mongoose = require('mongoose'); 
const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la clase es requerido'],
    trim: true
  },
  description: String,
  startDate: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida'],
    index: true // Para mejor performance en búsquedas
  },
  duration: {
    type: Number,
    required: [true, 'La duración es requerida'],
    min: [5, 'La duración mínima es 5 minutos']
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    required: [true, 'El instructor es requerido']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'El máximo de participantes es requerido'],
    min: [1, 'Debe haber al menos 1 participante']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  difficulty: {
    type: String,
    enum: ['Principiante', 'Intermedio', 'Avanzado'],
    default: 'Intermedio'
  },
  active: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['available', 'full', 'cancelled', 'completed'],
    default: 'available'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejor performance
classSchema.index({ startDate: 1, status: 1 });
classSchema.index({ participants: 1, startDate: 1 });

module.exports = mongoose.model('Class', classSchema);