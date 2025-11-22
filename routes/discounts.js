const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/adminVerify');

// Add a new discount
router.post('/add-discount',verifyToken, async (req, res) => {
    const { discount_code, discount_percentage, start_date, end_date, max_uses } = req.body;
    if (!discount_code || !discount_percentage || !start_date || !end_date || !max_uses) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const [existingDiscount] = await db.execute('SELECT discount_code FROM discount WHERE discount_code=?', [discount_code]);
        if (existingDiscount.length > 0) {
            return res.status(400).json({ message: 'Discount code already exists' });
        }
        await db.execute(
            `INSERT INTO discount (discount_code, discount_percentage, start_date, end_date, max_uses) VALUES (?, ?, ?, ?, ?)`,
            [discount_code, discount_percentage, start_date, end_date, max_uses]
        );
        res.status(200).json({ message: 'Discount added successfully' });
    } catch (error) {
        console.error('Error adding discount:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update an existing discount
router.post('/update-discount', async (req, res) => {
    const { discount_id, discount_code, discount_percentage, start_date, end_date, max_uses } = req.body;
    if (!discount_id || !discount_code || !discount_percentage || !start_date || !end_date || !max_uses) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const [existingDiscount] = await db.execute('SELECT discount_code FROM discount WHERE discount_id=?', [discount_id]);
        if (existingDiscount.length === 0) {
            return res.status(400).json({ message: 'No such discount exists' });
        }
        await db.execute(
            `UPDATE discount SET discount_code=?, discount_percentage=?, start_date=?, end_date=?, max_uses=? WHERE discount_id=?`,
            [discount_code, discount_percentage, start_date, end_date, max_uses, discount_id]
        );
        res.status(200).json({ message: 'Discount updated successfully' });
    } catch (error) {
        console.error('Error updating discount:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete a discount
router.post('/delete-discount', async (req, res) => {
    const { discount_id } = req.body;
    if (!discount_id) {
        return res.status(400).json({ message: 'Discount ID is required' });
    }
    try {
        const [existingDiscount] = await db.execute('SELECT discount_code FROM discount WHERE discount_id = ?', [discount_id]);
        if (existingDiscount.length === 0) {
            return res.status(400).json({ message: 'Discount does not exist' });
        }
        await db.execute('DELETE FROM discount WHERE discount_id = ?', [discount_id]);
        res.status(200).json({ message: 'Discount deleted successfully' });
    } catch (error) {
        console.error('Error deleting discount:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all discounts
router.get('/get-all', async (req, res) => {
    try {
        const [discounts] = await db.execute('SELECT * FROM discount');
        res.status(200).json(discounts);
    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({ message: 'Error fetching discounts' });
    }
});

// Validate discount code
router.post('/validate-coupon', async (req, res) => {
    const { discount_code } = req.body;

    if (!discount_code) {
        return res.status(400).json({ message: 'Coupon code is required' });
    }

    try {
        const [discount] = await db.execute(
            `SELECT * FROM discount WHERE discount_code = ? AND start_date <= NOW() AND end_date >= NOW() AND max_uses > 0`, 
            [discount_code]
        );

        if (discount.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired coupon' });
        }

        res.status(200).json({ 
            discount_percentage: discount[0].discount_percentage 
        });

    } catch (error) {
        console.error('Error validating discount:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
