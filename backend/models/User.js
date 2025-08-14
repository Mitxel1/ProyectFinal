const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor agregar un nombre']
  },
  email: {
    type: String,
    required: [true, 'Por favor agregar un email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor agregar un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'Por favor agregar una contraseña'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  membership: {
    type: {
      type: String,
      enum: ['Basic', 'Premium', 'Gold'],
      default: 'Basic'
    },
    expiry: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);