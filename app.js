// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/userReg', require('./routes/userReg'));
app.use('/adminAuth', require('./routes/adminAuth'));
app.use('/customer', require('./routes/customer'));
app.use('/contact', require('./routes/contact'));
app.use('/messages', require('./routes/messages'));
app.use('/products', require('./routes/products'));
app.use('/addProduct', require('./routes/addProduct'));
app.use('/api/product-image', require('./routes/productImage')); // Dedicated image serving route
app.use('/singlepage', require('./routes/singlepage'));
app.use('/login', require('./routes/login'));
app.use('/ADMIN', require('./routes/ADMIN'));
app.use('/discounts', require('./routes/discounts'));
app.use('/inventory', require('./routes/inventory'));
app.use('/checkout', require('./routes/checkout'));
app.use('/trackorder', require('./routes/trackorder'));
app.use('/showOrder', require('./routes/showOrder'));
app.use('/wishlist', require('./routes/wishlist'));
app.use('/newsletter', require('./routes/newsletter'));
// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
