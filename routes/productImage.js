const express = require('express');
const router = express.Router();
const db = require('../db');

// Serve product images from BLOB storage
router.get('/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        
        // First try to get from product_images table
        const [imageRows] = await db.execute(
            'SELECT image_data, mime_type FROM product_images WHERE product_id = ? AND is_primary = true',
            [productId]
        );
        
        if (imageRows.length > 0) {
            const image = imageRows[0];
            res.set({
                'Content-Type': image.mime_type || 'image/jpeg',
                'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
            });
            res.send(image.image_data);
            return;
        }
        
        // Fallback to product table
        const [productRows] = await db.execute(
            'SELECT product_image_blob, image_mime_type FROM product WHERE product_id = ?',
            [productId]
        );
        
        if (productRows.length > 0 && productRows[0].product_image_blob) {
            const product = productRows[0];
            res.set({
                'Content-Type': product.image_mime_type || 'image/jpeg',
                'Cache-Control': 'public, max-age=86400'
            });
            res.send(product.product_image_blob);
            return;
        }
        
        // If no image found, return 404
        res.status(404).json({ message: 'Image not found' });
        
    } catch (error) {
        console.error('Error serving product image:', error);
        res.status(500).json({ message: 'Error retrieving image' });
    }
});

module.exports = router;
