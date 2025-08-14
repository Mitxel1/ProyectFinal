// models/Member.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  membershipType: { 
    type: String, 
    enum: ['Basic', 'Premium', 'VIP'], 
    default: 'Basic' 
  },
  startDate: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  // ...otros campos según necesidades
});

module.exports = mongoose.model('Member', memberSchema);