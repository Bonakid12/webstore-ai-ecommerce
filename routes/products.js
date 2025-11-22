const express = require('express');
const fs = require('fs');
const router = express.Router();
const db = require('../db'); // Ensure MySQL connection is properly set up

// Function to convert JSON data to XML
function convertToXML(products, sizes) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<products>\n`;
    products.forEach(product => {
        // Fetch sizes for the current product from the sizes array
        const productSizes = sizes.filter(size => size.product_id === product.product_id)
                                   .map(size => size.size)
                                   .join(", ");

        xml += `  <product>\n`;
        xml += `    <id>${product.product_id}</id>\n`;
        xml += `    <name>${product.product_name}</name>\n`;
        xml += `    <type>${product.product_type}</type>\n`;
        xml += `    <price>${product.product_price}</price>\n`;
        xml += `    <ranking>${product.product_ranking}</ranking>\n`;
        xml += `    <size>${productSizes}</size>\n`;  // Concatenating all sizes for this product
        xml += `    <image>${product.product_image}</image>\n`;
        xml += `    <description>${product.product_discription}</description>\n`;
        xml += `  </product>\n`;
    });
    xml += `</products>`;
    return xml;
}

// Route to fetch products and generate an XML file
router.get('/generate-xml', async (req, res) => {
    try {
        const [products] = await db.execute('SELECT * FROM product');
        const xmlData = convertToXML(products);

        // Save XML to public directory
        fs.writeFileSync('public/products.xml', xmlData);
        
        res.status(200).json({ message: "XML file generated successfully!", path: "/products.xml" });
    } catch (error) {
        console.error("Error generating XML:", error);
        res.status(500).json({ message: "Error generating XML" });
    }
});

module.exports = router;
