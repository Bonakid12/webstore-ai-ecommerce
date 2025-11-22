const express = require('express');
const fs = require('fs');
const xml2js = require('xml2js');
const db = require('../db'); // assuming you have a database connection module
const router = express.Router();

router.get('/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        // Fetch product data from the database
        const [product] = await db.execute('SELECT * FROM product WHERE product_id = ?', [productId]);

        if (product.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Fetch available sizes for the product
        const [sizes] = await db.execute('SELECT size FROM product_sizes WHERE product_id = ?', [productId]);

        // Get the main image (now from BLOB storage)
        const getMainImage = (productId) => {
            // All images are now served via API endpoint
            return `/api/product-image/${productId}`;
        };

        const mainImage = getMainImage(productId);

        // Prepare the product data
        const productData = {
            id: product[0].product_id,
            name: product[0].product_name,
            type: product[0].product_type,
            price: product[0].product_price,
            ranking: product[0].product_ranking,
            image: mainImage, // Main image only
            description: product[0].product_discription,
            sizes: sizes.map(size => size.size), // Extract sizes for this product
        };

        res.status(200).json(productData);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
