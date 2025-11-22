// routes/customer.js
const express = require('express');
const db = require('../db'); // Ensure this points to your database connection
const adminVerify = require('../middleware/adminVerify');
const router = express.Router();


// Route to get all customers
router.get('/customers', adminVerify,async (req, res) => {
  try {
    const [customers] = await db.execute('SELECT * FROM Customer'); // Ensure table name matches
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

module.exports = router;
