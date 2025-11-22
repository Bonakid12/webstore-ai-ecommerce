const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// User Login Route
router.post("/user-authenticate", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Corrected the query result handling
        const [rows] = await db.execute("SELECT * FROM customer WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = rows[0];  // Access the first result from the array

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { customer_id: user.customer_id, email: user.email },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1h" }
        );

        // Send user details & token
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                customer_id: user.customer_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error during authentication:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
