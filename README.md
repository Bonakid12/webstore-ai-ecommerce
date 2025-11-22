# ================================================================
# WEBSTORE E-COMMERCE PLATFORM WITH AI CHATBOT
# ================================================================

## 🌟 Project Overview

WebStore is a full-stack e-commerce platform featuring an advanced AI-powered customer service chatbot. The system combines modern web technologies with artificial intelligence to provide intelligent customer support, product recommendations, order tracking, and business analytics.

---

## 🚀 Features

### **Frontend (Customer Interface)**
- 🛍️ **Product Catalog** - Browse and search products with filters
- 🛒 **Shopping Cart** - Add, update, and manage cart items
- 💳 **Checkout System** - Secure payment processing
- 📦 **Order Tracking** - Real-time shipping status updates
- 💬 **AI Chatbot** - Intelligent customer support with voice input 🎤
- 👤 **User Authentication** - Secure login and registration
- ❤️ **Wishlist** - Save favorite products
- 📧 **Newsletter** - Subscribe to updates and promotions

### **Admin Panel**
- 📊 **Dashboard** - Real-time business analytics
- 📦 **Inventory Management** - Track stock levels
- 🛍️ **Order Management** - View and process orders
- 👥 **Customer Management** - View customer data
- 💬 **Admin Chatbot** - Business intelligence assistant with voice queries 🎤
- 💰 **Discount Management** - Create and manage promotions
- 📨 **Messages** - Customer inquiries and support

### **AI Chatbot Features**
- 🤖 **Natural Language Processing** - Powered by Google Gemini AI
- 🎤 **Voice Input** - Web Speech API for voice-to-text queries
- 🔍 **Semantic Search** - ChromaDB vector database for knowledge retrieval
- 📦 **Order Tracking** - Real-time shipping status with tracking numbers
- 🛍️ **Product Recommendations** - AI-driven product suggestions
- 📊 **Business Analytics** - Admin insights and reporting
- 💾 **Chat History** - Persistent conversation storage in MySQL
- 📈 **Analytics Dashboard** - Track chatbot performance
- 🖼️ **Image Search** - Visual product matching (BLIP AI)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

---

## 🛠️ Installation & Setup

### **1. Clone the Repository**

```bash
git clone https://github.com/your-username/webstore.git
cd webstore
```

### **2. Database Setup**

1. **Install MySQL** and start the MySQL server

2. **Import the complete database schema**:
```bash
mysql -u root -p < database_setup.sql
```

   Or manually:
   ```sql
   mysql -u root -p
   source database_setup.sql
   ```

   This will create:
   - The `eshop` database
   - All required tables (products, orders, customers, chat, etc.)
   - Foreign key relationships
   - Indexes for performance

### **3. Node.js Backend Setup**

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```

3. **Edit `.env` file**:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=eshop
DB_PORT=3306
PORT=3000
```

4. **Start the Node.js server**:
```bash
node app.js
```

The server will run on `http://localhost:3000`

### **4. Python Chatbot Backend Setup**

1. **Navigate to chatbot backend**:
```bash
cd chatbot_backend
```

2. **Create virtual environment** (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**:
```bash
cp .env.example .env
```

5. **Edit `chatbot_backend/.env` file**:
```env
# Get your API key from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=eshop
DB_PORT=3306

FLASK_PORT=5000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

6. **Start the chatbot server**:
```bash
python app.py
```

The chatbot server will run on `http://localhost:5000`

---

## 🔑 API Keys & Credentials

### **Google Gemini AI API Key**
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Add it to `chatbot_backend/.env` as `GEMINI_API_KEY`

### **Database Credentials**
- Update database credentials in both `.env` files
- Ensure MySQL server is running
- Grant proper permissions to the database user

---

## 📁 Project Structure

```
webstore/
├── public/                    # Frontend files
│   ├── index.html            # Homepage
│   ├── shop.html             # Product listing
│   ├── cart.html             # Shopping cart
│   ├── checkout.html         # Checkout page
│   ├── track-order.html      # Order tracking
│   ├── admin_panel/          # Admin interface
│   ├── img/                  # Images and assets
│   ├── style.css             # Main stylesheet
│   ├── customer-chatbot.js   # Customer chatbot UI
│   └── admin-chatbot.js      # Admin chatbot UI
│
├── routes/                    # Express.js routes
│   ├── index.js              # Main routes
│   ├── products.js           # Product APIs
│   ├── checkout.js           # Checkout APIs
│   ├── login.js              # Authentication
│   ├── userReg.js            # User registration
│   └── ...
│
├── middleware/               # Express middleware
│   └── adminVerify.js        # Admin authentication
│
├── chatbot_backend/          # Python chatbot server
│   ├── app.py                # Main Flask application
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment template
│   └── create_chat_history_table.sql
│
├── app.js                    # Node.js server entry point
├── db.js                     # Database connection
├── package.json              # Node.js dependencies
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── README.md                 # This file
└── VOICE_FEATURE.md          # Voice chatbot documentation
```

---

## 🚀 Usage

### **Running the Complete System**

1. **Start MySQL database**
2. **Start Node.js backend**: `node app.js` (Port 3000)
3. **Start Python chatbot**: `python chatbot_backend/app.py` (Port 5000)
4. **Open browser**: Navigate to `http://localhost:3000`

### **Customer Features**
- Browse products at `/shop.html`
- Add items to cart at `/cart.html`
- Track orders at `/track-order.html`
- Chat with AI assistant (chat icon on every page)

### **Admin Features**
- Access admin panel at `/admin.html`
- Login with admin credentials
- View analytics, manage inventory, process orders
- Use admin chatbot for business insights

---

## 🛡️ Security Notes

⚠️ **IMPORTANT SECURITY REMINDERS:**

1. **Never commit `.env` files to Git**
2. **Never commit API keys or passwords**
3. **Change default database passwords**
4. **Use environment variables for all secrets**
5. **Enable HTTPS in production**
6. **Implement rate limiting**
7. **Validate all user inputs**
8. **Use prepared statements for SQL queries**

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- Your Name - Initial work

---

## 🙏 Acknowledgments

- Google Gemini AI for natural language processing
- ChromaDB for vector database
- Flask and Express.js frameworks
- MySQL database
- All open-source contributors

---

## 📞 Support

For support, email support@webstore.com or open an issue in the GitHub repository.

---

## 🔄 Version History

- **v1.0.0** (November 2025)
  - Initial release
  - AI chatbot with Gemini integration
  - Chat history database
  - Admin and customer interfaces
  - Order tracking system
  - Product catalog and shopping cart

---

## 🚧 Roadmap

- [ ] Add payment gateway integration
- [ ] Implement email notifications
- [ ] Add mobile app support
- [ ] Enhance image search capabilities
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social media integration

---

**Built with ❤️ using Node.js, Python, MySQL, and AI**
