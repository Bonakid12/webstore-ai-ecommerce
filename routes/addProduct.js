const express = require('express');
const router = express.Router();
const fs = require('fs');
const db = require('../db'); // Ensure this is properly imported
const verifyToken = require('../middleware/adminVerify');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});


// Function to convert products to XML (updated for BLOB storage)
function convertToXML(products, productSizes) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<products>\n`;

  products.forEach(product => {
      // Get all sizes for the current product
      const sizes = productSizes.filter(size => size.product_id === product.product_id).map(size => size.size);

      xml += `  <product>\n`;
      xml += `    <id>${product.product_id}</id>\n`;
      xml += `    <name>${product.product_name}</name>\n`;
      xml += `    <type>${product.product_type}</type>\n`;
      xml += `    <price>${product.product_price}</price>\n`;
      xml += `    <ranking>${product.product_ranking}</ranking>\n`;

      // Add sizes as a comma-separated list
      xml += `    <sizes>${sizes.join(', ')}</sizes>\n`;

      // Use API endpoint for image instead of file path
      xml += `    <image>/api/product-image/${product.product_id}</image>\n`;
      xml += `    <description>${product.product_discription}</description>\n`;
      xml += `  </product>\n`;
  });

  xml += `</products>`;
  return xml;
}


// Add a new product with BLOB image storage
router.post('/add', verifyToken, upload.single('image'), async (req, res) => {
  try {
      const { name, type, price, ranking, description, stock_quantity } = req.body;
      const sizes = JSON.parse(req.body.sizes || '[]');
      
      if (!name || !type || !price || !ranking || !sizes || !description || !stock_quantity) {
          return res.status(400).json({ error: 'All fields are required' });
      }

      if (!req.file) {
          return res.status(400).json({ error: 'Product image is required' });
      }

      // Check if the product already exists
      const [existingProduct] = await db.execute(
          'SELECT product_id FROM product WHERE product_name = ?',
          [name]
      );
      if (existingProduct.length > 0) {
          return res.status(400).json({ message: 'Product with this name already exists' });
      }

      // Insert into product table (keep old image column for compatibility)
      const [result] = await db.execute(
          `INSERT INTO product (product_name, product_type, product_price, product_ranking, product_image, product_discription, product_image_blob, image_mime_type) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, type, price, ranking, `/api/product-image/temp`, description, req.file.buffer, req.file.mimetype]
      );

      const productId = result.insertId;

      // Update the product_image path with the actual product ID
      await db.execute(
          'UPDATE product SET product_image = ? WHERE product_id = ?',
          [`/api/product-image/${productId}`, productId]
      );

      // Insert into inventory
      await db.execute(
          'INSERT INTO inventory (product_id, stock_quantity) VALUES (?, ?)',
          [productId, stock_quantity]
      );

      // Insert multiple sizes into product_sizes table
      for (const size of sizes) {
          await db.execute(
              'INSERT INTO product_sizes (product_id, size) VALUES (?, ?)',
              [productId, size]
          );
      }

      // Insert into product_images table for better organization
      await db.execute(
          'INSERT INTO product_images (product_id, image_data, image_name, mime_type, file_size, is_primary) VALUES (?, ?, ?, ?, ?, ?)',
          [productId, req.file.buffer, req.file.originalname, req.file.mimetype, req.file.size, true]
      );

      // Fetch all products after the new insert and regenerate XML
      const [products] = await db.execute('SELECT * FROM product');
      const [productSizes] = await db.execute('SELECT * FROM product_sizes');
      
      const xmlData = convertToXML(products, productSizes);
      fs.writeFileSync('public/products.xml', xmlData);
      
      res.status(201).json({ message: 'Product added successfully', productId: productId });

  } catch (error) {
      console.error('Error adding product:', error);
      if (error.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
      } else {
          res.status(500).json({ message: 'Internal Server Error: ' + error.message });
      }
  }
});


// Fetch all products
router.get('/get-all',verifyToken, async (req, res) => {
  try {
    const [messages] = await db.execute('SELECT * FROM product');
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching Products:', error);
    res.status(500).json({ message: 'Error fetching Products' });
  }
});

// Update product with optional BLOB image
router.post('/update', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { name, type, price, ranking, description, stock_quantity, id } = req.body;
        const sizes = JSON.parse(req.body.sizes || '[]');

        // Validate required fields
        if (!name || !type || !price || !ranking || !sizes || !description || !id || stock_quantity === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if product exists
        const [existingProduct] = await db.execute(
            'SELECT product_name FROM product WHERE product_id = ?',
            [id]
        );
        if (existingProduct.length === 0) {
            return res.status(400).json({ message: 'Product does not exist' });
        }

        // Update product details (with or without image)
        if (req.file) {
            // Update with new image
            await db.execute(
                `UPDATE product SET product_name = ?, product_type = ?, product_price = ?, product_ranking = ?, product_image = ?, product_discription = ?, product_image_blob = ?, image_mime_type = ? WHERE product_id = ?`,
                [name, type, price, ranking, `/api/product-image/${id}`, description, req.file.buffer, req.file.mimetype, id]
            );

            // Update/Insert into product_images table
            const [existingImage] = await db.execute(
                'SELECT image_id FROM product_images WHERE product_id = ? AND is_primary = true',
                [id]
            );

            if (existingImage.length > 0) {
                // Update existing primary image
                await db.execute(
                    'UPDATE product_images SET image_data = ?, image_name = ?, mime_type = ?, file_size = ? WHERE product_id = ? AND is_primary = true',
                    [req.file.buffer, req.file.originalname, req.file.mimetype, req.file.size, id]
                );
            } else {
                // Insert new primary image
                await db.execute(
                    'INSERT INTO product_images (product_id, image_data, image_name, mime_type, file_size, is_primary) VALUES (?, ?, ?, ?, ?, ?)',
                    [id, req.file.buffer, req.file.originalname, req.file.mimetype, req.file.size, true]
                );
            }
        } else {
            // Update without changing image
            await db.execute(
                `UPDATE product SET product_name = ?, product_type = ?, product_price = ?, product_ranking = ?, product_discription = ? WHERE product_id = ?`,
                [name, type, price, ranking, description, id]
            );
        }

        // Update stock quantity
        await db.execute(
            'UPDATE inventory SET stock_quantity = ? WHERE product_id = ?',
            [stock_quantity, id]
        );

        // Delete existing sizes and insert new ones
        await db.execute('DELETE FROM product_sizes WHERE product_id = ?', [id]);

        // Insert updated sizes
        for (const size of sizes) {
            await db.execute(
                'INSERT INTO product_sizes (product_id, size) VALUES (?, ?)',
                [id, size]
            );
        }

        // Regenerate XML
        const [products] = await db.execute('SELECT * FROM product');
        const [productSizes] = await db.execute('SELECT * FROM product_sizes');
        const xmlData = convertToXML(products, productSizes);
        fs.writeFileSync('public/products.xml', xmlData);

        res.status(200).json({ message: 'Product updated successfully' });

    } catch (error) {
        console.error('Error updating product:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
        } else {
            res.status(500).json({ message: 'Internal Server Error: ' + error.message });
        }
    }
});




router.post('/delete',verifyToken, async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }
  try {
    const [existingProduct] = await db.execute(
      'SELECT product_name FROM product WHERE product_id = ?',
      [id]
    );
    if (existingProduct.length === 0) {
      return res.status(400).json({ message: 'Product does not exist' });
    }
    const [result] = await db.execute('DELETE FROM product WHERE product_id = ?', [id]);
    const [products] = await db.execute('SELECT * FROM product');
    const [productSizes] = await db.execute('SELECT * FROM product_sizes');

    const xmlData = convertToXML(products, productSizes);
    fs.writeFileSync('public/products.xml', xmlData);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Serve product images from BLOB storage
router.get('/image/:productId', async (req, res) => {
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
