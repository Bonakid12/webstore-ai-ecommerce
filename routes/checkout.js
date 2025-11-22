const express = require("express");
const router = express.Router();
const db = require("../db"); // Database connection
const jwt = require("jsonwebtoken");

router.post("/CHECKED", async (req, res) => {
    const { 
        token, cart, total, paymentMethod, cardNumber, expDate, cvv, cardHolder, 
        shippingAddress, city, state, country, zip,
        discountCode = "", discountAmount = 0, finalTotal
    } = req.body;

    const parsedTotal = parseFloat(total) || 0;
    const parsedDiscountAmount = parseFloat(discountAmount) || 0;
    const parsedFinalAmount = parseFloat(finalTotal) || parsedTotal;

    if (!token || !cart || Object.keys(cart).length === 0 || !total || !paymentMethod) {
        return res.status(400).json({ success: false, message: "Invalid request data." });
    }

    let connection;

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, "your_jwt_secret");
        const customerId = decoded.customer_id;

        // Convert cart object to an array (assuming cart is an object with nested items)
        const cartArray = Object.values(cart).flat();

        // Validate cart items
        for (const item of cartArray) {
            if (!item.productId || !item.quantity || !item.price || !item.size) {
                return res.status(400).json({ success: false, message: "Invalid cart data." });
            }
        }

        // Start transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        let discountId = null;

        // Fetch discount ID only if a valid discount code is provided
        if (discountCode) {
            const [discountResult] = await connection.query(
                "SELECT discount_id FROM discount WHERE discount_code = ?",
                [discountCode]
            );
            if (discountResult.length > 0) {
                discountId = discountResult[0].discount_id;
            } else {
                return res.status(400).json({ success: false, message: "Invalid coupon code." });
            }
        }

        // Insert order with discount data
        const [orderResult] = await connection.query(
            "INSERT INTO `order` (customer_id, order_date, total_amount, discount_id, discount_code, discount_amount, final_amount) VALUES (?, NOW(), ?, ?, ?, ?, ?)",
            [customerId, parsedTotal, discountId, discountCode, parsedDiscountAmount, parsedFinalAmount]
        );

        const orderId = orderResult.insertId;

        // Insert payment
        const [paymentResult] = await connection.query(
            "INSERT INTO `payment` (order_id, payment_method, payment_date, payment_amount, cardNumber, expDate, cvv, cardHolder) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)",
            [orderId, paymentMethod, parsedFinalAmount, cardNumber, expDate, cvv, cardHolder]
        );

        const paymentId = paymentResult.insertId;

        // Insert bill
        await connection.query(
            "INSERT INTO `bill` (order_id, payment_id, bill_date, total_amount) VALUES (?, ?, NOW(), ?)",
            [orderId, paymentId, parsedFinalAmount]
        );

        // Insert order items
        for (const item of cartArray) {
            const productId = parseInt(item.productId, 10) || 0;
            const quantity = parseInt(item.quantity, 10) || 0;
            const price = parseFloat(item.price) || 0;
            const size = item.size || "";
            const totalPrice = quantity * price;

            if (productId > 0 && quantity > 0 && price > 0) {
                await connection.query(
                    "INSERT INTO `order_items` (order_id, product_id, quantity, product_price, total_price, product_size) VALUES (?, ?, ?, ?, ?, ?)",
                    [orderId, productId, quantity, price, totalPrice, size]
                );
            }
        }

        // Insert shipping details
        const trackingNumber = "TRK" + Math.floor(100000 + Math.random() * 900000);
        await connection.query(
            "INSERT INTO `shipping` (order_id, shipping_address, city, state, country, postal_code, shipping_date, tracking_number) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)",
            [orderId, shippingAddress, city, state, country, zip, trackingNumber]
        );

        // Commit transaction
        await connection.commit();

        res.json({ success: true, message: "Checkout successful!", trackingNumber });

    } catch (error) {
        console.error("Checkout Error:", error);
        if (connection) await connection.rollback(); // Rollback on error
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    } finally {
        if (connection) connection.release(); // Release DB connection
    }
});

module.exports = router;
