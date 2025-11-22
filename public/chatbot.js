// Chatbot functionality
class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.sessionId = this.generateSessionId();
        this.isListening = false;
        this.recognition = null;
        this.init();
        this.initVoiceRecognition();
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    init() {
        this.createChatbotHTML();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div class="chatbot-container">
                <!-- Floating Chat Button -->
                <button class="chatbot-button" id="chatbotToggle">
                    <i class="chatbot-icon" id="chatbotIcon">💬</i>
                </button>

                <!-- Chat Popup -->
                <div class="chatbot-popup" id="chatbotPopup">
                    <!-- Header -->
                    <div class="chatbot-header">
                        <div class="chatbot-avatar">🤖</div>
                        <div class="chatbot-info">
                            <h3>WebStore Assistant</h3>
                            <p>Online • Always ready to help</p>
                        </div>
                        <button class="chatbot-close" id="chatbotClose">×</button>
                    </div>

                    <!-- Messages Area -->
                    <div class="chatbot-messages" id="chatbotMessages">
                        <!-- Messages will be added here dynamically -->
                        <div class="typing-indicator" id="typingIndicator">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <button class="quick-action" data-message="Hello! I need help">👋 Say Hello</button>
                        <button class="quick-action" data-message="Show me your products">🛍️ Products</button>
                        <button class="quick-action" data-message="I need customer support">💬 Support</button>
                        <button class="quick-action" data-message="Track my order">📦 Track Order</button>
                    </div>

                    <!-- Input Area -->
                    <div class="chatbot-input">
                        <div class="input-container">
                            <textarea 
                                class="message-input" 
                                id="messageInput" 
                                placeholder="Type your message here..."
                                rows="1"
                            ></textarea>
                            <button class="voice-button" id="voiceButton" title="Voice input">
                                <i>🎤</i>
                            </button>
                            <button class="send-button" id="sendButton">
                                <i>➤</i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add chatbot to body
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    bindEvents() {
        const toggle = document.getElementById('chatbotToggle');
        const close = document.getElementById('chatbotClose');
        const sendButton = document.getElementById('sendButton');
        const voiceButton = document.getElementById('voiceButton');
        const messageInput = document.getElementById('messageInput');
        const quickActions = document.querySelectorAll('.quick-action');

        // Toggle chatbot
        toggle.addEventListener('click', () => this.toggleChatbot());
        close.addEventListener('click', () => this.closeChatbot());

        // Send message
        sendButton.addEventListener('click', () => this.sendMessage());
        voiceButton.addEventListener('click', () => this.toggleVoiceRecognition());
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        messageInput.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 80) + 'px';
        });

        // Quick actions
        quickActions.forEach(action => {
            action.addEventListener('click', () => {
                const message = action.dataset.message;
                this.sendUserMessage(message);
            });
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChatbot();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            const chatbotContainer = document.querySelector('.chatbot-container');
            if (this.isOpen && !chatbotContainer.contains(e.target)) {
                this.closeChatbot();
            }
        });
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        this.isOpen = true;
        const popup = document.getElementById('chatbotPopup');
        const button = document.getElementById('chatbotToggle');
        const icon = document.getElementById('chatbotIcon');

        popup.classList.add('active');
        button.classList.add('active');
        icon.textContent = '×';

        // Focus on input
        setTimeout(() => {
            document.getElementById('messageInput').focus();
        }, 300);

        // Add some entrance animation
        this.addBotMessage("Hi there! 👋 How can I help you today?", 500);
    }

    closeChatbot() {
        this.isOpen = false;
        const popup = document.getElementById('chatbotPopup');
        const button = document.getElementById('chatbotToggle');
        const icon = document.getElementById('chatbotIcon');

        popup.classList.remove('active');
        button.classList.remove('active');
        icon.textContent = '💬';
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();

        if (message) {
            this.sendUserMessage(message);
            input.value = '';
            input.style.height = 'auto';
        }
    }

    sendUserMessage(message) {
        this.addUserMessage(message);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Send to Flask backend
        this.sendToBackend(message);
    }

    async sendToBackend(message) {
        try {
            // Detect current page and product context
            const currentPage = this.getCurrentPageInfo();
            const productContext = this.getProductContext();
            
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId,
                    user_email: this.getUserEmail(),
                    current_page: currentPage,
                    product_context: productContext
                })
            });

            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.response) {
                this.addBotMessage(data.response);
                
                // Store session ID for conversation continuity
                this.sessionId = data.session_id;
                
                // Log intent for debugging (remove in production)
                if (data.intent) {
                    console.log(`Intent detected: ${data.intent} (confidence: ${data.confidence})`);
                }
            } else {
                this.addBotMessage("I'm sorry, I didn't get a response. Please try again.");
            }
            
        } catch (error) {
            console.error('Chatbot API Error:', error);
            this.hideTypingIndicator();
            this.addBotMessage("I'm having trouble connecting to my brain 🧠. Please try again in a moment or contact our support team.");
        }
    }

    getUserEmail() {
        // Try to get user email from localStorage, session, or cookies
        return localStorage.getItem('userEmail') || 
               sessionStorage.getItem('userEmail') || 
               this.getCookie('userEmail') || 
               null;
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    addUserMessage(message) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        messageElement.textContent = message;
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    addBotMessage(message, delay = 0) {
        setTimeout(() => {
            const messagesContainer = document.getElementById('chatbotMessages');
            const messageElement = document.createElement('div');
            messageElement.className = 'message bot';
            messageElement.textContent = message;
            
            messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
        }, delay);
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        indicator.classList.add('active');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        indicator.classList.remove('active');
    }

    generateBotResponse(userMessage) {
        // Legacy fallback responses (used if backend is unavailable)
        const responses = [
            "Thanks for your message! Our AI assistant will provide a better response once fully connected.",
            "I'm still learning about your store. How can I help you today?",
            "Let me connect you with our customer service team for the best assistance.",
        ];
        
        this.addBotMessage(responses[Math.floor(Math.random() * responses.length)]);
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    addWelcomeMessage() {
        // Add initial welcome message after a delay
        setTimeout(() => {
            if (!this.isOpen) {
                this.addBotMessage("Welcome to WebStore! 🛍️ I'm here to help you with any questions.");
            }
        }, 2000);
    }

    getCurrentPageInfo() {
        // Detect what page the user is on
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        const pageMap = {
            'index.html': 'Homepage',
            'shop.html': 'Shop Page',
            'cart.html': 'Cart Page',
            'checkout.html': 'Checkout Page',
            'sproductpage.html': 'Single Product Page',
            'about.html': 'About Page',
            'contact.html': 'Contact Page',
            'user.html': 'User Account',
            'wishlist.html': 'Wishlist',
            'track-order.html': 'Order Tracking'
        };
        
        return pageMap[filename] || 'Website';
    }

    getProductContext() {
        // Only get product context if we're on a single product page
        if (!window.location.pathname.includes('sproductpage.html')) {
            return {};
        }
        
        try {
            // Extract product information from the current page
            const productContext = {};
            
            // Get product ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            if (productId) {
                productContext.id = productId;
            }
            
            // Get product information from DOM elements
            const nameElement = document.getElementById('product-name');
            const priceElement = document.getElementById('product-price');
            const categoryElement = document.getElementById('product-category');
            const sizeSelect = document.getElementById('product-size');
            const descriptionElement = document.getElementById('product-description');
            const mainImage = document.getElementById('Main-image');
            
            if (nameElement && nameElement.textContent.trim()) {
                productContext.name = nameElement.textContent.trim();
            }
            
            if (priceElement && priceElement.textContent.trim()) {
                productContext.price = priceElement.textContent.trim().replace('$', '');
            }
            
            if (categoryElement && categoryElement.textContent.trim()) {
                productContext.type = categoryElement.textContent.trim();
            }
            
            if (sizeSelect) {
                const availableSizes = Array.from(sizeSelect.options)
                    .map(option => option.value)
                    .filter(value => value && value !== 'Select Size');
                if (availableSizes.length > 0) {
                    productContext.sizes = availableSizes.join(', ');
                }
            }
            
            if (descriptionElement && descriptionElement.textContent.trim()) {
                productContext.description = descriptionElement.textContent.trim();
            }
            
            if (mainImage && mainImage.src) {
                productContext.image = mainImage.src;
            }
            
            return productContext;
            
        } catch (error) {
            console.error('Error getting product context:', error);
            return {};
        }
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
                const voiceButton = document.getElementById('voiceButton');
                voiceButton.innerHTML = '<i>🔴</i>';
                voiceButton.style.backgroundColor = '#ff4444';
                this.addBotMessage("🎤 Listening... Speak now!");
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const input = document.getElementById('messageInput');
                input.value = transcript;
                this.sendMessage();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopVoiceRecognition();
                this.addBotMessage("Sorry, I couldn't hear you clearly. Please try again or type your message.");
            };
            
            this.recognition.onend = () => {
                this.stopVoiceRecognition();
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }

    toggleVoiceRecognition() {
        if (this.isListening) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }

    startVoiceRecognition() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                this.addBotMessage("Voice recognition is not available right now. Please type your message.");
            }
        }
    }

    stopVoiceRecognition() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        this.isListening = false;
        const voiceButton = document.getElementById('voiceButton');
        voiceButton.innerHTML = '<i>🎤</i>';
        voiceButton.style.backgroundColor = '';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
        new Chatbot();
    }, 1000);
});

// Add some utility functions for future use
window.ChatbotAPI = {
    sendMessage: function(message) {
        // This will be used later to integrate with your Flask backend
        console.log('Message to be sent to backend:', message);
    },
    
    addCustomResponse: function(message) {
        // Function to add custom bot responses
        const chatbot = window.chatbotInstance;
        if (chatbot) {
            chatbot.addBotMessage(message);
        }
    }
};
