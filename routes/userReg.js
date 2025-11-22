// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs'); // For password hashing
const db = require('../db'); // Database connection

const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    dateOfBirth,
    email,
    phone,
    address,
    city,
    state,
    country,
    postalCode,
    password
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if email already exists
    const [existingUser] = await db.execute('SELECT email FROM Customer WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user data into the Customer table with registration timestamp
    const [result] = await db.execute(
      `INSERT INTO Customer (first_name, last_name, gender, date_of_birth, email, phone_number, address, city, state, country, postal_code, password, registration_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [firstName, lastName, gender, dateOfBirth, email, phone, address, city, state, country, postalCode, hashedPassword]
    );

    res.redirect('/index.html');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
