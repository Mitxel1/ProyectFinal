// routes/gym.js
const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { auth } = require('../middlewares/auth');

// Obtener todos los miembros
router.get('/members', auth, async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agregar nuevo miembro
router.post('/members', auth, async (req, res) => {
  const member = new Member({
    name: req.body.name,
    email: req.body.email,
    membershipType: req.body.membershipType,
    startDate: req.body.startDate,
    // ...otros campos
  });

  try {
    const newMember = await member.save();
    res.status(201).json(newMember);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;