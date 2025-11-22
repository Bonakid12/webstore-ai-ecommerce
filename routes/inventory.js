const express = require('express');
const db = require('../db'); // Ensure this points to your database connection
const adminVerify = require('../middleware/adminVerify');
const router = express.Router();


router.get('/get-all', adminVerify,async (req, res) => {
  try {
    const [inventory] = await db.execute('SELECT * FROM inventory'); // Ensure table name matches
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
});



// Route to check stock availability
router.get('/check-stock/:productId', async (req, res) => {
  const productId = req.params.productId;
  try {
    const [result] = await db.execute('SELECT stock_quantity FROM inventory WHERE product_id = ?', [productId]);
    if (result.length > 0) {
      res.json({ stock_quantity: result[0].stock_quantity });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error('Error checking stock:', error);
    res.status(500).json({ message: 'Failed to check stock' });
  }
});

// Route to update stock after adding to cart
router.post('/update-stock/:productId', async (req, res) => {
  const productId = req.params.productId;
  const { quantity } = req.body;
  try {
    // Get current stock quantity
    const [result] = await db.execute('SELECT stock_quantity FROM inventory WHERE product_id = ?', [productId]);
    if (result.length > 0) {
      const currentStock = result[0].stock_quantity;
      const newStock = currentStock - quantity;

      if (newStock < 0) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }

      // Update stock in the inventory table
      await db.execute('UPDATE inventory SET stock_quantity = ? WHERE product_id = ?', [newStock, productId]);
      res.json({ message: 'Stock updated successfully' });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Failed to update stock' });
  }
});

module.exports = router;

