# 🚀 WebStore - Complete Setup Guide

This guide will walk you through setting up the WebStore E-commerce Platform with AI Chatbot on your local machine.

---

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- [ ] **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- [ ] **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- [ ] **Git** - [Download](https://git-scm.com/)
- [ ] **Google Gemini API Key** - [Get Free Key](https://aistudio.google.com/apikey)

---

## 🛠️ Step-by-Step Installation

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/your-username/webstore.git
cd webstore
```

---

### **Step 2: Database Setup**

#### 2.1. Start MySQL Server

Make sure your MySQL server is running.

#### 2.2. Import Database Schema

Run the setup script:

```bash
mysql -u root -p < database_setup.sql
```

**What this does:**
- Creates the `eshop` database
- Creates all 20+ tables (products, orders, customers, chat, etc.)
- Sets up foreign key relationships
- Creates indexes for performance

**Verify the setup:**

```sql
mysql -u root -p
USE eshop;
SHOW TABLES;
```

You should see tables like: `admin`, `customer`, `product`, `order`, `chat_sessions`, etc.

---

### **Step 3: Node.js Backend Setup**

#### 3.1. Install Dependencies

```bash
npm install
```

This installs:
- Express.js (web framework)
- MySQL2 (database driver)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- multer (file uploads)
- and more...

#### 3.2. Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env` with your details:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=eshop
DB_PORT=3306
PORT=3000
NODE_ENV=development
```

#### 3.3. Start the Server

```bash
node app.js
```

**Expected output:**
```
Server is running on port 3000
Connected to MySQL database
```

**Test it:**
Open browser: `http://localhost:3000`

---

### **Step 4: Python Chatbot Backend Setup**

#### 4.1. Navigate to Chatbot Directory

```bash
cd chatbot_backend
```

#### 4.2. Create Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 4.3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- Flask (web framework)
- google-generativeai (Gemini AI)
- chromadb (vector database)
- sentence-transformers (embeddings)
- transformers (BLIP image AI)
- and more...

**Note:** This may take 5-10 minutes depending on your internet speed.

#### 4.4. Get Your Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key (starts with `AIzaSy...`)

#### 4.5. Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Edit `chatbot_backend/.env`:

```env
# Google Gemini AI
GEMINI_API_KEY=AIzaSy_YOUR_ACTUAL_API_KEY_HERE

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=eshop
DB_PORT=3306

# Flask Server
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000

# CORS (allow your frontend)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### 4.6. Start the Chatbot Server

```bash
python app.py
```

**Expected output:**
```
* Running on http://127.0.0.1:5000
* Gemini AI initialized successfully
* Vector database loaded
* MySQL connection established
```

---

## ✅ Verify Installation

### Test Node.js Backend

1. Open browser: `http://localhost:3000`
2. You should see the homepage
3. Try navigating to `/shop.html` to see products

### Test Python Chatbot

1. Open browser: `http://localhost:3000`
2. Click the **chat icon** (bottom right)
3. Type: "Hello"
4. You should get a response from the AI

---

## 🎯 Quick Start Guide

### For Customers:

1. **Browse Products:** Go to `/shop.html`
2. **Add to Cart:** Click "Add to Cart" on any product
3. **Checkout:** Go to `/cart.html` → Click "Proceed to Checkout"
4. **Track Order:** Go to `/track-order.html` → Enter order ID
5. **Chat with AI:** Click chat icon → Ask questions

### For Admins:

1. **Login:** Go to `/admin.html`
2. **Default Credentials:** (You need to add an admin user to the database)
   ```sql
   INSERT INTO admin (email, password, name, special_word) 
   VALUES ('admin@webstore.com', 'hashed_password', 'Admin', 'secret');
   ```
3. **Dashboard:** View sales analytics
4. **Manage Products:** Add, edit, delete products
5. **Process Orders:** View and update order status

---

## 🔧 Common Issues & Solutions

### Issue 1: "Cannot connect to MySQL"

**Solution:**
- Make sure MySQL is running
- Check DB credentials in `.env` files
- Verify database exists: `SHOW DATABASES;`

### Issue 2: "GEMINI_API_KEY not found"

**Solution:**
- Make sure you created `chatbot_backend/.env` (not `.env.example`)
- Verify API key is correct
- Check for extra spaces

### Issue 3: "Port 3000 already in use"

**Solution:**
- Change port in `.env`: `PORT=3001`
- Or kill the process using port 3000

### Issue 4: Python packages installation fails

**Solution:**
- Update pip: `pip install --upgrade pip`
- Install one by one if needed
- Check Python version: `python --version` (must be 3.8+)

### Issue 5: Chatbot not responding

**Solution:**
- Check if Flask server is running (port 5000)
- Verify CORS_ORIGINS includes `http://localhost:3000`
- Check browser console for errors (F12)

---

## 📁 Project Structure

```
webstore/
├── database_setup.sql         # Complete database schema ⭐
├── .env.example               # Environment template
├── .env                       # Your config (DO NOT COMMIT)
├── package.json               # Node.js dependencies
├── app.js                     # Main server
├── db.js                      # Database connection
│
├── public/                    # Frontend files
│   ├── index.html            # Homepage
│   ├── shop.html             # Product listing
│   ├── cart.html             # Shopping cart
│   ├── checkout.html         # Checkout
│   ├── track-order.html      # Order tracking
│   ├── customer-chatbot.js   # Chat UI
│   └── admin_panel/          # Admin interface
│
├── routes/                    # API endpoints
│   ├── products.js           # Product APIs
│   ├── checkout.js           # Order processing
│   ├── login.js              # Authentication
│   └── ...
│
└── chatbot_backend/          # Python AI server ⭐
    ├── app.py                # Flask application
    ├── requirements.txt      # Python dependencies
    ├── .env.example          # Template
    └── .env                  # Your config (DO NOT COMMIT)
```

---

## 🚀 Running Both Servers

You need **TWO terminal windows**:

**Terminal 1 - Node.js Backend:**
```bash
cd webstore
node app.js
```

**Terminal 2 - Python Chatbot:**
```bash
cd webstore/chatbot_backend
python app.py
```

**Then open browser:**
```
http://localhost:3000
```

---

## 🛡️ Security Reminders

⚠️ **NEVER commit these to GitHub:**
- `.env` files
- API keys
- Database passwords
- `node_modules/`
- `venv/` or `env/`

✅ **Safe to commit:**
- `.env.example` (template only)
- `database_setup.sql` (schema, no data)
- Source code
- Documentation

---

## 📊 Database Schema

The `database_setup.sql` includes:

**20+ Tables organized in groups:**

1. **Core:** `admin`, `customer`
2. **Products:** `product`, `product_images`, `product_sizes`, `inventory`
3. **Orders:** `order`, `order_items`, `payment`, `bill`, `shipping`, `discount`
4. **Chat:** `chat_sessions`, `chat_conversations`, `chat_analytics`, `chat_common_queries`
5. **Other:** `wishlist`, `messages`, `news_subscribers`

See `DATABASE_SCHEMA.md` for details.

---

## 🎨 Features Overview

### Customer Features:
✅ Product catalog with search/filter  
✅ Shopping cart  
✅ Secure checkout  
✅ Order tracking  
✅ AI chatbot support  
✅ Wishlist  
✅ User accounts  

### Admin Features:
✅ Analytics dashboard  
✅ Inventory management  
✅ Order processing  
✅ Customer management  
✅ Discount management  
✅ AI business assistant  

### AI Chatbot Features:
✅ Natural language processing (Google Gemini)  
✅ Voice input with Web Speech API  
✅ Product recommendations  
✅ Order tracking  
✅ Image search (BLIP AI)  
✅ Chat history  
✅ Analytics tracking  

---

## 🆘 Getting Help

If you encounter issues:

1. **Check this guide** - Most common issues are covered above
2. **Check logs** - Look at terminal output for errors
3. **Check browser console** - Press F12 in browser
4. **GitHub Issues** - Open an issue on the repository
5. **Documentation** - See `README.md` for more details

---

## 🎓 Next Steps

After setup:

1. **Add sample products** to the database
2. **Create admin account** in the `admin` table
3. **Test all features** (cart, checkout, chatbot, etc.)
4. **Customize** the frontend (colors, images, content)
5. **Configure** chatbot responses
6. **Deploy** to production (optional)

---

## 📝 Additional Configuration

### Optional: Create Admin Account

```sql
USE eshop;

INSERT INTO admin (email, password, name, special_word)
VALUES (
  'admin@webstore.com',
  '$2a$10$examplehashedpassword',  -- Use bcrypt to hash
  'Admin User',
  'recovery123'
);
```

### Optional: Add Sample Products

```sql
INSERT INTO product (product_name, product_type, product_price, product_ranking, product_discription)
VALUES 
  ('Blue T-Shirt', 'Clothing', 29.99, 5, 'Comfortable cotton t-shirt'),
  ('Running Shoes', 'Footwear', 89.99, 5, 'Professional running shoes'),
  ('Leather Watch', 'Accessories', 149.99, 4, 'Elegant leather watch');
```

---

## ✨ You're All Set!

Your WebStore is now running! 🎉

Open `http://localhost:3000` and start exploring.

---

**Built with ❤️ - Happy Coding!**
