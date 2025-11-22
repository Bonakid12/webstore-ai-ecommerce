const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const connection = require('../db'); // Assuming you have a database connection setup in db.js

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Token is expected in the Authorization header as 'Bearer <token>'

    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
        // Verify token and extract customer_id from payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        req.customer_id = decoded.customer_id; // Add customer_id to the request object
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(400).json({ message: "Invalid token." });
    }
};

// API route to get orders and shipping details for a customer based on customer_id from token
router.get('/orders', verifyToken, async (req, res) => {
    const customerId = req.customer_id; // Extract customer_id from the verified token

    try {
        // SQL query to fetch order and shipping details for a specific customer
        const query = `
            SELECT 
                o.order_id,
                o.order_date,
                o.total_amount,
                o.discount_code,
                o.final_amount,
                s.tracking_number,
                s.shipping_address,
                s.city,
                s.state,
                s.country,
                s.postal_code,
                s.shipping_date
            FROM 
                \`order\` o
            LEFT JOIN 
                \`shipping\` s ON o.order_id = s.order_id
            WHERE 
                o.customer_id = ?
        `;

        const [orders] = await connection.query(query, [customerId]);

        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this customer." });
        }

        // Send the order data as a response
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "An error occurred while fetching orders." });
    }
});

module.exports = router;
