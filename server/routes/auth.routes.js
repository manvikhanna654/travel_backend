const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Name, email, and a 6+ character password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(409).json({ success: false, message: 'Email is already registered' });

    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, token: createToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password || ''))) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
    }

    res.json({ success: true, token: createToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
