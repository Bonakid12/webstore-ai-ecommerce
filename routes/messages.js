
const express = require('express');
const db = require('../db'); // Ensure this points to your database connection
const adminVerify = require('../middleware/adminVerify');

const router = express.Router();



// Fetch all messages
router.get('/get-messages',adminVerify, async (req, res) => {
  try {
    console.log('Fetching all messages...');
    const [messages] = await db.execute('select * from messages');
    console.log('Messages fetched successfully:', messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});


module.exports = router;
