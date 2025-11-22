const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../db'); // Ensure this is correctly configured

// Serve the contact form
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/contact.html')); // Ensure contact.html is in the public folder
});

// Handle form submission
router.post('/send-message', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    await db.execute(
      `INSERT INTO Messages (name, email, subject, message) VALUES (?, ?, ?, ?)`,
      [name, email, subject, message]
    );
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});



module.exports = router;
