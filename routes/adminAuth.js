const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Admin Authentication Route
router.post('/authenticate', async (req, res) => {
  const { userId, email, password, specialWord } = req.body;

  if (!userId || !email || !password || !specialWord) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if admin exists
    const [admin] = await db.execute('SELECT * FROM Admin WHERE user_id = ? AND email = ? AND special_word = ?', [userId, email, specialWord]);

    if (admin.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, admin[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ user_id: admin[0].user_id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Send the token in response
    res.json({ token });
    
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
