// Enhanced Customer Chatbot with Page Context Awareness
class CustomerChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.sessionId = this.generateSessionId();
        this.isListening = false;
        this.recognition = null;
        this.productContext = {};
        this.productWelcomeSent = false;
        this.initVoiceRecognition();
        this.init();
    }

    generateSessionId() {
        return 'customer_session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    initVoiceRecognition() {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceButton();
                this.showVoiceIndicator();
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleVoiceResult(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopListening();
                
                let errorMessage = 'Voice recognition failed.';
                if (event.error === 'not-allowed') {
                    errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
                } else if (event.error === 'no-speech') {
                    errorMessage = 'No speech detected. Please try again.';
                }
                
                this.addBotMessage(`🎤 **Voice Recognition Error**\\n\\n${errorMessage}\\n\\n💡 Try typing your message instead!`);
            };
            
            this.recognition.onend = () => {
                this.stopListening();
            };
        }
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                this.addBotMessage("Voice search is not available in your browser. Please type your message instead.");
            }
        }
    }

    stopListening() {
        this.isListening = false;
        this.updateVoiceButton();
        this.hideVoiceIndicator();
    }

    handleVoiceResult(transcript) {
        const input = document.getElementById('customerChatbotInput');
        input.value = transcript;
        
        // Check for voice navigation commands
        const navigationResult = this.handleVoiceNavigation(transcript);
        if (navigationResult) {
            this.addUserMessage(`🎤 "${transcript}"`);
            this.addBotMessage(navigationResult);
            return;
        }
        
        // Check for cart commands
        const cartResult = this.handleVoiceCartCommands(transcript);
        if (cartResult) {
            this.addUserMessage(`🎤 "${transcript}"`);
            this.addBotMessage(cartResult);
            return;
        }
        
        // Regular chat processing
        this.addUserMessage(`🎤 "${transcript}"`);
        this.sendToCustomerBackend(transcript);
    }

    handleVoiceNavigation(transcript) {
        const command = transcript.toLowerCase();
        
        // Navigation commands
        const navigationCommands = {
            'go to home': '/',
            'go home': '/',
            'home page': '/',
            'go to shop': '/shop.html',
            'go shopping': '/shop.html',
            'shop page': '/shop.html',
            'view products': '/shop.html',
            'go to cart': '/cart.html',
            'shopping cart': '/cart.html',
            'view cart': '/cart.html',
            'go to checkout': '/checkout.html',
            'checkout page': '/checkout.html',
            'go to contact': '/contact.html',
            'contact us': '/contact.html',
            'contact page': '/contact.html',
            'go to about': '/about.html',
            'about us': '/about.html',
            'about page': '/about.html',
            'go to blog': '/blog.html',
            'blog page': '/blog.html',
            'track order': '/track-order.html',
            'order tracking': '/track-order.html',
            'my account': '/user.html',
            'user profile': '/user.html',
            'my profile': '/user.html',
            'wishlist': '/wishlist.html',
            'my wishlist': '/wishlist.html'
        };
        
        for (const [phrase, url] of Object.entries(navigationCommands)) {
            if (command.includes(phrase)) {
                window.location.href = url;
                return `🧭 **Navigating to ${phrase}...**\\n\\nTaking you there now! The page should load shortly.`;
            }
        }
        
        return null;
    }

    handleVoiceCartCommands(transcript) {
        const command = transcript.toLowerCase();
        
        // Cart-related commands
        if (command.includes('add to cart') || command.includes('add this to cart')) {
            return this.handleAddToCart();
        }
        
        if (command.includes('buy now') || command.includes('purchase this')) {
            return this.handleBuyNow();
        }
        
        if (command.includes('what size') || command.includes('available sizes')) {
            return this.handleSizeInfo();
        }
        
        if (command.includes('in stock') || command.includes('available')) {
            return this.handleStockInfo();
        }
        
        return null;
    }

    handleAddToCart() {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) {
            return `🔐 **Login Required**\\n\\nTo add items to your cart, you need to be logged in first.\\n\\n📝 Please go to the login page or create an account to continue shopping.\\n\\n🎤 Try saying: "go to login" or click the login link in the navigation.`;
        }
        
        // Check if we're on a product page
        if (this.currentPage.name === 'Single Product Page' && this.productContext.name) {
            // Simulate add to cart (you'll need to implement the actual cart API call)
            const addToCartBtn = document.getElementById('add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.click();
                return `🛒 **Added to Cart!**\\n\\n✅ ${this.productContext.name} has been added to your shopping cart.\\n\\n🎤 Say "go to cart" to view your items or "checkout" to complete your purchase.`;
            }
        }
        
        return `❌ **Cannot Add to Cart**\\n\\nPlease make sure you're on a product page and select your preferred size first.`;
    }

    handleBuyNow() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return `🔐 **Login Required**\\n\\nTo make a purchase, please log in first.\\n\\n🎤 Try saying: "go to login"`;
        }
        
        if (this.currentPage.name === 'Single Product Page') {
            return `🚀 **Quick Purchase**\\n\\nI'll add this item to your cart and take you to checkout.\\n\\n🎤 Say "add to cart" first, then "go to checkout" to complete your purchase quickly.`;
        }
        
        return `Please navigate to a product page first to make a purchase.`;
    }

    handleSizeInfo() {
        if (this.productContext.sizes) {
            return `📏 **Available Sizes**\\n\\n${this.productContext.name}:\\n• Sizes: ${this.productContext.sizes}\\n\\n💡 Need help choosing? Ask me about sizing recommendations!`;
        }
        
        return `📏 **Size Information**\\n\\nI can help you with sizing once you're viewing a specific product. Navigate to a product page and ask again!`;
    }

    handleStockInfo() {
        if (this.productContext.name) {
            const stockStatus = this.productContext.stock_quantity > 0 ? 'In Stock' : 'Out of Stock';
            return `📦 **Stock Status**\\n\\n${this.productContext.name}:\\n• Status: ${stockStatus}\\n• Available: ${this.productContext.stock_quantity} units\\n\\n${stockStatus === 'In Stock' ? '🎤 Say "add to cart" to purchase!' : '🔔 This item is currently unavailable.'}`;
        }
        
        return `📦 **Stock Information**\\n\\nI can check stock availability when you're viewing a specific product. Please navigate to a product page first.`;
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('customerVoiceBtn');
        if (voiceBtn) {
            voiceBtn.innerHTML = this.isListening ? '<i>🔴</i>' : '<i>🎤</i>';
            voiceBtn.title = this.isListening ? 'Stop listening...' : 'Voice search';
            voiceBtn.classList.toggle('listening', this.isListening);
        }
    }

    showVoiceIndicator() {
        const indicator = document.getElementById('customerVoiceIndicator');
        if (indicator) {
            indicator.style.display = 'flex';
        }
    }

    hideVoiceIndicator() {
        const indicator = document.getElementById('customerVoiceIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    init() {
        this.createCustomerChatbotHTML();
        this.bindEvents();
        this.addWelcomeMessage();
        this.detectPageAndContext();
    }

    detectPageAndContext() {
        const pageInfo = this.getCurrentPageInfo();
        this.currentPage = pageInfo;
        
        // Detect if we're on a single product page
        this.detectProductContext();
        
        // Add page-specific welcome message
        setTimeout(() => {
            if (pageInfo.contextMessage) {
                this.addBotMessage(pageInfo.contextMessage);
            }
        }, 1500);
    }

    detectProductContext() {
        // Check if we're on sproductpage.html
        if (window.location.pathname.includes('sproductpage.html') || window.location.href.includes('sproductpage.html')) {
            this.currentPage.name = 'Single Product Page';
            this.extractProductDetails();
            
            // If product details aren't loaded yet, retry after a delay
            setTimeout(() => {
                this.extractProductDetails();
            }, 2000);
        }
    }

    extractProductDetails() {
        try {
            // Extract product information from the page
            const productName = document.getElementById('product-name')?.textContent?.trim() || '';
            const productCategory = document.getElementById('product-category')?.textContent?.trim() || '';
            const productPrice = document.getElementById('product-price')?.textContent?.trim() || '';
            const productDescription = document.getElementById('product-description')?.textContent?.trim() || '';
            
            // Only update if we have actual product data
            if (productName && productPrice) {
                // Extract available sizes
                const sizeSelect = document.getElementById('product-size');
                let availableSizes = '';
                if (sizeSelect) {
                    const options = Array.from(sizeSelect.options);
                    availableSizes = options
                        .filter(option => option.value && option.value !== '')
                        .map(option => option.textContent)
                        .join(', ');
                }
                
                // Extract product image
                const productImage = document.getElementById('Main-image')?.src || '';
                
                // Get URL parameters for product ID
                const urlParams = new URLSearchParams(window.location.search);
                const productId = urlParams.get('id') || '';
                
                this.productContext = {
                    id: productId,
                    name: productName,
                    type: productCategory,
                    price: productPrice.replace('$', ''),
                    sizes: availableSizes,
                    description: productDescription,
                    image: productImage,
                    stock_quantity: 10 // Default value, can be enhanced later
                };
                
                console.log('Product context updated:', this.productContext);
                
                // Update welcome message for product page if this is the first time loading
                if (!this.productWelcomeSent) {
                    this.productWelcomeSent = true;
                    setTimeout(() => {
                        this.addBotMessage(`👕 **Welcome to ${productName}!**\\n\\nI can help you with:\\n• 📏 **Size guidance** and fit recommendations\\n• 📦 **Stock availability** and delivery info\\n• 🛒 **Add to cart** assistance (login required)\\n• 🔍 **Product details** and care instructions\\n• 💡 **Styling suggestions** and similar items\\n\\nWhat would you like to know about this product?`);
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Error extracting product details:', error);
            this.productContext = {};
        }
    }

    getStockQuantity() {
        // This could be enhanced to fetch from API, for now return a default
        const addToCartBtn = document.getElementById('add-to-cart');
        if (addToCartBtn && addToCartBtn.disabled) {
            return 0;
        }
        return 10; // Default assumption
    }

    getCurrentPageInfo() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        const pageContexts = {
            'index.html': {
                name: 'Home Page',
                contextMessage: `🏠 **Welcome to our Home Page!**\\n\\nI can help you with:\\n• 🛍️ **Product recommendations** based on your interests\\n• 🎯 **Featured deals** and current promotions\\n• 📱 **Navigation** to find exactly what you need\\n• 💡 **Store information** and policies\\n\\nWhat brings you to our store today?`,
                quickActions: ['Show me deals', 'Popular products', 'Store hours']
            },
            'shop.html': {
                name: 'Shop',
                contextMessage: `🛍️ **Welcome to our Shop!**\\n\\nI can assist you with:\\n• 🔍 **Finding products** in specific categories\\n• 💰 **Price comparisons** and best deals\\n• ⭐ **Product recommendations** based on reviews\\n• 📋 **Size guides** and product details\\n\\nWhat are you looking to buy today?`,
                quickActions: ['Size guide', 'Best sellers', 'On sale', 'Filter products']
            },
            'about.html': {
                name: 'About Us',
                contextMessage: `ℹ️ **Welcome to our About Page!**\\n\\nLearn more about:\\n• 🏢 **Our company** story and mission\\n• 👥 **Our team** and values\\n• 🎯 **Our commitment** to quality\\n• 🌟 **Customer testimonials**\\n\\nAny questions about who we are?`,
                quickActions: ['Company history', 'Our mission', 'Team info', 'Customer reviews']
            },
            'contact.html': {
                name: 'Contact Us',
                contextMessage: `📞 **Welcome to our Contact Page!**\\n\\nI can help you with:\\n• 📧 **Email support** - Get help via email\\n• 📱 **Phone support** - Talk to our team\\n• 📍 **Store locations** and directions\\n• 🕒 **Support hours** and availability\\n\\nHow would you like to get in touch?`,
                quickActions: ['Support hours', 'Email us', 'Store locations', 'Live chat']
            },
            'cart.html': {
                name: 'Shopping Cart',
                contextMessage: `🛒 **Welcome to your Cart!**\\n\\nI can help you:\\n• ✅ **Review your items** and quantities\\n• 💰 **Apply discount codes** and coupons\\n• 🚚 **Calculate shipping** costs\\n• 🔒 **Secure checkout** process\\n\\nReady to complete your purchase?`,
                quickActions: ['Discount codes', 'Shipping info', 'Checkout help', 'Save for later']
            },
            'checkout.html': {
                name: 'Checkout',
                contextMessage: `💳 **Welcome to Checkout!**\\n\\nI'm here to help with:\\n• 🔒 **Secure payment** options\\n• 🚚 **Shipping methods** and delivery\\n• 📋 **Order review** before purchase\\n• 🛡️ **Privacy & security** assurance\\n\\nAlmost there! Need any help?`,
                quickActions: ['Payment methods', 'Shipping options', 'Order summary', 'Security info']
            },
            'track-order.html': {
                name: 'Order Tracking',
                contextMessage: `📦 **Welcome to Order Tracking!**\\n\\nI can help you:\\n• 🔍 **Track your order** status and location\\n• 🚚 **Delivery updates** and estimated times\\n• 📧 **Order confirmation** details\\n• 🔄 **Order modifications** if possible\\n\\nWhat's your order number?`,
                quickActions: ['Track order', 'Delivery time', 'Order status', 'Contact delivery']
            },
            'blog.html': {
                name: 'Blog',
                contextMessage: `📝 **Welcome to our Blog!**\\n\\nDiscover:\\n• 📰 **Latest articles** and style guides\\n• 🎨 **Fashion tips** and trends\\n• 💡 **Product spotlights** and reviews\\n• 🌟 **Customer stories** and inspiration\\n\\nWhat topics interest you?`,
                quickActions: ['Latest posts', 'Fashion tips', 'Product guides', 'Style trends']
            },
            'sproductpage.html': {
                name: 'Product Details',
                contextMessage: `👕 **Welcome to our Product Page!**\\n\\nI can help you with:\\n• 📏 **Size guidance** and fit recommendations\\n• 📦 **Stock availability** and shipping details\\n• 🛒 **Add to cart** process (login required)\\n• 🔍 **Product specifications** and care instructions\\n• 💡 **Similar products** and styling tips\\n\\nWhat would you like to know about this product?`,
                quickActions: ['Size guide', 'Add to cart', 'Similar products', 'Care instructions']
            },
        };

        return pageContexts[filename] || {
            name: 'WebStore',
            contextMessage: `🌟 **Welcome to our store!**\\n\\nI'm here to help with anything you need. Ask me about products, orders, shipping, or any questions you have!`,
            quickActions: ['Help me shop', 'Track order', 'Store info', 'Customer service']
        };
    }

    createCustomerChatbotHTML() {
        const pageInfo = this.getCurrentPageInfo();
        
        const chatbotHTML = `
            <div class="chatbot-container">
                <!-- Floating Customer Chat Button -->
                <button class="chatbot-button" id="customerChatbotToggle">
                    <i class="chatbot-icon" id="customerChatbotIcon">�</i>
                </button>

                <!-- Customer Chat Popup -->
                <div class="chatbot-popup" id="customerChatbotPopup">
                    <!-- Header -->
                    <div class="chatbot-header">
                        <div class="chatbot-avatar">🤖</div>
                        <div class="chatbot-info">
                            <h3>WebStore Assistant</h3>
                            <p>Online • Ready to help with ${pageInfo.name}</p>
                        </div>
                        <button class="chatbot-expand-btn" id="customerChatbotExpand" title="Expand/Minimize">⛶</button>
                        <button class="chatbot-close" id="customerChatbotClose">×</button>
                    </div>

                    <!-- Page Context Banner -->
                    <div class="page-context-banner">
                        📍 Currently on: ${pageInfo.name} • Specialized assistance available
                    </div>

                    <!-- Messages -->
                    <div class="chatbot-messages" id="customerChatbotMessages">
                        <!-- Messages will be inserted here -->
                    </div>

                    <!-- Typing Indicator -->
                    <div class="typing-indicator" id="customerTypingIndicator">
                        <span>Assistant is typing</span>
                        <div class="typing-dots">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    </div>

                    <!-- Input Container -->
                    <div class="chatbot-input-container">
                        <!-- Quick Actions -->
                        <div class="chatbot-quick-actions" id="customerQuickActions">
                            ${pageInfo.quickActions.map(action => 
                                `<button class="quick-action" onclick="customerChatbot.sendQuickMessage('${action}')">${action}</button>`
                            ).join('')}
                            <button class="quick-action voice-quick" onclick="customerChatbot.toggleVoiceSearch()">🎤 Voice Search</button>
                        </div>

                    <!-- Input Wrapper -->
                    <div class="chatbot-input-wrapper">
                        <input type="text" class="chatbot-input" id="customerChatbotInput" 
                               placeholder="Ask about products, orders, or anything else..." 
                               maxlength="500">
                        <input type="file" id="customerImageInput" accept="image/*" style="display: none;">
                        <button class="chatbot-voice-btn" id="customerVoiceBtn" title="Voice search">
                            <i>🎤</i>
                        </button>
                        <button class="chatbot-image-btn" id="customerImageBtn" title="Upload image to search similar products">
                            <i>📷</i>
                        </button>
                        <button class="chatbot-send" id="customerChatbotSend">
                            <i>➤</i>
                        </button>
                    </div>

                    <!-- Voice Indicator -->
                    <div class="voice-indicator" id="customerVoiceIndicator">
                        <div class="voice-animation">
                            <div class="voice-wave"></div>
                            <div class="voice-wave"></div>
                            <div class="voice-wave"></div>
                        </div>
                        <span>Listening... Speak now</span>
                    </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    bindEvents() {
        const toggleBtn = document.getElementById('customerChatbotToggle');
        const closeBtn = document.getElementById('customerChatbotClose');
        const expandBtn = document.getElementById('customerChatbotExpand');
        const sendBtn = document.getElementById('customerChatbotSend');
        const input = document.getElementById('customerChatbotInput');
        const imageBtn = document.getElementById('customerImageBtn');
        const imageInput = document.getElementById('customerImageInput');
        const voiceBtn = document.getElementById('customerVoiceBtn');

        toggleBtn.addEventListener('click', () => this.toggle());
        closeBtn.addEventListener('click', () => this.close());
        expandBtn.addEventListener('click', () => this.toggleExpand());
        sendBtn.addEventListener('click', () => this.handleSend());
        imageBtn.addEventListener('click', () => imageInput.click());
        voiceBtn.addEventListener('click', () => this.toggleVoiceSearch());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        input.addEventListener('input', (e) => {
            const sendBtn = document.getElementById('customerChatbotSend');
            sendBtn.disabled = !e.target.value.trim();
        });

        imageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleImageUpload(e.target.files[0]);
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const popup = document.getElementById('customerChatbotPopup');
        const button = document.getElementById('customerChatbotToggle');
        const icon = document.getElementById('customerChatbotIcon');
        
        popup.classList.add('active');
        button.classList.add('active');
        icon.textContent = '✕';
        this.isOpen = true;

        // Focus on input
        setTimeout(() => {
            document.getElementById('customerChatbotInput').focus();
        }, 300);

        this.scrollToBottom();
    }

    close() {
        const popup = document.getElementById('customerChatbotPopup');
        const button = document.getElementById('customerChatbotToggle');
        const icon = document.getElementById('customerChatbotIcon');
        
        popup.classList.remove('active');
        button.classList.remove('active');
        icon.textContent = '�';
        this.isOpen = false;
    }

    toggleExpand() {
        const popup = document.getElementById('customerChatbotPopup');
        const expandBtn = document.getElementById('customerChatbotExpand');
        
        if (popup.classList.contains('expanded')) {
            popup.classList.remove('expanded');
            popup.classList.add('minimized');
            expandBtn.textContent = '⛶';
            expandBtn.title = 'Expand';
        } else {
            popup.classList.remove('minimized');
            popup.classList.add('expanded');
            expandBtn.textContent = '⛉';
            expandBtn.title = 'Minimize';
        }
        
        // Scroll to bottom after resize
        setTimeout(() => this.scrollToBottom(), 300);
    }

    toggleVoiceSearch() {
        if (!this.recognition) {
            this.addBotMessage("🎤 Voice search is not supported in your browser. Please use Chrome, Safari, or Edge for voice features.");
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.startListening();
        }
    }

    handleSend() {
        const input = document.getElementById('customerChatbotInput');
        const message = input.value.trim();
        
        if (message) {
            this.sendUserMessage(message);
            input.value = '';
            document.getElementById('customerChatbotSend').disabled = true;
        }
    }

    sendQuickMessage(message) {
        this.sendUserMessage(message);
    }

    sendUserMessage(message) {
        this.addUserMessage(message);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Send to backend with customer context
        this.sendToCustomerBackend(message);
    }

    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('Image file size must be less than 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.addImageMessage(imageData);
            this.showTypingIndicator();
            this.sendImageToBackend(imageData, "Do you have something similar to this?");
        };
        reader.readAsDataURL(file);
    }

    addImageMessage(imageData) {
        const messagesContainer = document.getElementById('customerChatbotMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        
        messageElement.innerHTML = `
            <div class="message-content">
                <img src="${imageData}" alt="Uploaded image" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-bottom: 8px;">
                <div>Do you have something similar to this? 🔍</div>
            </div>
            <div class="message-avatar">👤</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.messages.push({ type: 'user', content: 'Image uploaded', timestamp: new Date() });
        this.scrollToBottom();
    }

    async sendImageToBackend(imageData, message) {
        try {
            const response = await fetch('http://localhost:5000/api/image-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageData,
                    message: message
                })
            });

            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.response) {
                this.addBotMessage(data.response);
                
                // If products found, add interactive product cards
                if (data.products && data.products.length > 0) {
                    this.addProductCards(data.products);
                }
            } else {
                this.addBotMessage("I had trouble processing your image. Please try again or describe what you're looking for in text.");
            }
            
        } catch (error) {
            console.error('Image search API Error:', error);
            this.hideTypingIndicator();
            this.addBotMessage("I'm having trouble with image search right now 📷. You can describe what you're looking for in text, and I'll help you find similar products!");
        }
    }

    addProductCards(products) {
        const messagesContainer = document.getElementById('customerChatbotMessages');
        const productCardsElement = document.createElement('div');
        productCardsElement.className = 'message bot product-cards';
        
        let productsHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="product-grid">
        `;
        
        products.forEach(product => {
            const stockStatus = product.stock_quantity > 0 ? '✅ In Stock' : '❌ Out of Stock';
            const stockClass = product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock';
            
            // Create proper image URL using BLOB system
            let imageUrl = `/api/product-image/${product.product_id}`; // Use BLOB system
            const fallbackUrl = '/img/products/1.jpg'; // Default fallback
            
            productsHTML += `
                <div class="product-card ${stockClass}">
                    <div class="product-image">
                        <img src="${imageUrl}" 
                             alt="${product.product_name}" 
                             onerror="this.onerror=null; this.src='${fallbackUrl}';"
                             loading="lazy">
                    </div>
                    <div class="product-info">
                        <h4>${product.product_name}</h4>
                        <p class="product-type">${product.product_type || 'Fashion'}</p>
                        <p class="product-price">$${product.product_price}</p>
                        ${product.visual_similarity && product.visual_similarity > 0 ? 
                            `<p class="similarity-score">🎯 ${(product.visual_similarity * 100).toFixed(1)}% Visual Match</p>` : ''}
                        <p class="stock-status">${stockStatus} (${product.stock_quantity || 0} units)</p>
                        <a href="${product.product_link || `/sproductpage.html?id=${product.product_id}`}" target="_blank" class="product-link">
                            View Details →
                        </a>
                    </div>
                </div>
            `;
        });
        
        productsHTML += `
                </div>
            </div>
        `;
        
        productCardsElement.innerHTML = productsHTML;
        messagesContainer.appendChild(productCardsElement);
        this.scrollToBottom();
    }

    async sendToCustomerBackend(message) {
        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId,
                    user_type: 'customer',
                    current_page: this.currentPage.name,
                    page_context: this.currentPage,
                    product_context: this.productContext
                })
            });

            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.response) {
                this.addBotMessage(data.response);
            } else {
                this.addBotMessage("I'm sorry, I didn't get a response. Please try again or contact our support team.");
            }
            
        } catch (error) {
            console.error('Customer Chatbot API Error:', error);
            this.hideTypingIndicator();
            this.addBotMessage("I'm having trouble connecting right now 🔧. Please try again in a moment or contact our support team at support@webstore.com");
        }
    }

    addUserMessage(message) {
        const messagesContainer = document.getElementById('customerChatbotMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        
        messageElement.innerHTML = `
            <div class="message-content">${this.escapeHtml(message)}</div>
            <div class="message-avatar">👤</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.messages.push({ type: 'user', content: message, timestamp: new Date() });
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messagesContainer = document.getElementById('customerChatbotMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot';
        
        messageElement.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">${this.formatMessage(message)}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.messages.push({ type: 'bot', content: message, timestamp: new Date() });
        this.scrollToBottom();
    }

    formatMessage(message) {
        // Convert markdown-style formatting to HTML
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/•/g, '&bull;');
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showTypingIndicator() {
        const indicator = document.getElementById('customerTypingIndicator');
        indicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('customerTypingIndicator');
        indicator.style.display = 'none';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('customerChatbotMessages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    addWelcomeMessage() {
        const pageInfo = this.currentPage || this.getCurrentPageInfo();
        
        setTimeout(() => {
            let welcomeMessage = `🌟 **Welcome to WebStore!**\\n\\nI'm your personal shopping assistant, ready to help you with anything you need. I notice you're on our **${pageInfo.name}** - I have specialized knowledge about this section!`;
            
            // Add voice commands help
            welcomeMessage += `\\n\\n🎤 **Voice Commands Available:**\\n• "Go to shop" - Navigate to shop page\\n• "Add to cart" - Add current product to cart\\n• "What sizes available" - Check product sizes\\n• "Go to cart" - View shopping cart\\n• "Go home" - Return to homepage\\n• "Track order" - Check order status`;
            
            if (this.productContext.name) {
                welcomeMessage += `\\n\\n📍 **Current Product:** ${this.productContext.name}\\n💡 Ask me about sizes, stock, or say "add to cart"!`;
            }
            
            welcomeMessage += `\\n\\n✨ Try the quick action buttons below, ask me anything, or use 🎤 **Voice Search** to speak your questions!`;
            
            this.addBotMessage(welcomeMessage);
        }, 800);
    }
}

// Initialize Customer Chatbot
let customerChatbot;
document.addEventListener('DOMContentLoaded', function() {
    customerChatbot = new CustomerChatbot();
});
