const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ success: false, message: 'Access Denied' });

    const token = authHeader.split(' ')[1]; // Extract token
    jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid Token' });
        req.user = user; // Attach user details to request
        next();
    });
};

// Add item to wishlist
// Add item to wishlist
router.post('/add', authenticateToken, async (req, res) => {
    const customer_id = req.user.customer_id; // Extracted from token
    const { product_id } = req.body;

    if (!product_id) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    try {
        // Check if the product already exists in the wishlist
        const checkQuery = `SELECT * FROM wishlist WHERE customer_id = ? AND product_id = ?`;
        const [existing] = await db.execute(checkQuery, [customer_id, product_id]);

        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Product is already in wishlist' });
        }

        // Insert into wishlist if not already present
        const insertQuery = `INSERT INTO wishlist (customer_id, product_id) VALUES (?, ?)`;
        await db.execute(insertQuery, [customer_id, product_id]);

        res.json({ success: true, message: 'Product added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);

        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Product is already in wishlist' });
        }

        res.status(500).json({ success: false, message: 'Database error' });
    }
});


// Get wishlist items for the logged-in user
router.get('/mywishlist', authenticateToken, async (req, res) => {
    const customer_id = req.user.customer_id;

    try {
        const query = `
            SELECT p.product_id, p.product_name, p.product_price, p.product_image
            FROM wishlist w
            JOIN product p ON w.product_id = p.product_id
            WHERE w.customer_id = ?
        `;
        const [wishlist] = await db.execute(query, [customer_id]);
        res.json({ success: true, wishlist });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Remove item from wishlist
router.delete('/remove', authenticateToken, async (req, res) => {
    const customer_id = req.user.customer_id;
    const { product_id } = req.body;

    try {
        const query = `DELETE FROM wishlist WHERE customer_id = ? AND product_id = ?`;
        await db.execute(query, [customer_id, product_id]);
        res.json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

module.exports = router;
