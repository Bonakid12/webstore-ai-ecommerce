// Advanced Admin Chatbot with Analytics and Reports
class AdminChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.sessionId = this.generateSessionId();
        this.isListening = false;
        this.recognition = null;
        this.initVoiceRecognition();
        this.init();
    }

    generateSessionId() {
        return 'admin_session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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
                this.addBotMessage("Sorry, I couldn't hear you clearly. Please try again or type your query.");
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
                this.addBotMessage("Voice search is not available in your browser. Please type your query instead.");
            }
        }
    }

    stopListening() {
        this.isListening = false;
        this.updateVoiceButton();
        this.hideVoiceIndicator();
    }

    handleVoiceResult(transcript) {
        const input = document.getElementById('adminChatbotInput');
        input.value = transcript;
        this.addUserMessage(`🎤 "${transcript}"`);
        this.sendToAdminBackend(transcript);
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('adminVoiceBtn');
        if (voiceBtn) {
            voiceBtn.innerHTML = this.isListening ? '<i>🔴</i>' : '<i>🎤</i>';
            voiceBtn.title = this.isListening ? 'Stop listening...' : 'Voice analytics query';
            voiceBtn.classList.toggle('listening', this.isListening);
        }
    }

    showVoiceIndicator() {
        const indicator = document.getElementById('adminVoiceIndicator');
        if (indicator) {
            indicator.style.display = 'flex';
        }
    }

    hideVoiceIndicator() {
        const indicator = document.getElementById('adminVoiceIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    init() {
        this.createAdminChatbotHTML();
        this.bindEvents();
        this.addWelcomeMessage();
        this.detectPage();
    }

    detectPage() {
        const currentPage = this.getCurrentPageName();
        this.currentPage = currentPage;
        
        // Update welcome message based on page
        setTimeout(() => {
            if (currentPage) {
                this.addBotMessage(`🎯 **${currentPage} Analytics Ready!** I can provide insights, reports, and data analysis for this section. What would you like to know?`);
            }
        }, 1500);
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'dashboard';
        
        const pageMap = {
            'index.html': 'Admin Dashboard',
            'orders.html': 'Orders Management',
            'inventory.html': 'Inventory Management', 
            'customerpg.html': 'Customer Analytics',
            'Messages.html': 'Message Center',
            'add_product.html': 'Product Management',
            'discount.html': 'Discount Management',
            'settings.html': 'System Settings'
        };

        return pageMap[filename] || 'Admin Panel';
    }

    createAdminChatbotHTML() {
        const chatbotHTML = `
            <div class="admin-chatbot-container">
                <!-- Floating Admin Chat Button -->
                <button class="admin-chatbot-button" id="adminChatbotToggle">
                    <i class="admin-chatbot-icon" id="adminChatbotIcon">�</i>
                </button>

                <!-- Admin Chat Popup -->
                <div class="admin-chatbot-popup" id="adminChatbotPopup">
                    <!-- Header -->
                    <div class="admin-chatbot-header">
                        <div class="admin-chatbot-avatar">🎯</div>
                        <div class="admin-chatbot-info">
                            <h3>Admin AI Assistant</h3>
                            <p>Analytics • Reports • Insights</p>
                        </div>
                        <button class="admin-chatbot-expand-btn" id="adminChatbotExpand" title="Expand/Minimize">⛶</button>
                        <button class="admin-chatbot-close" id="adminChatbotClose">×</button>
                    </div>

                    <!-- Messages -->
                    <div class="admin-chatbot-messages" id="adminChatbotMessages">
                        <!-- Messages will be inserted here -->
                    </div>

                    <!-- Typing Indicator -->
                    <div class="admin-typing-indicator" id="adminTypingIndicator">
                        <span>Admin AI is analyzing</span>
                        <div class="admin-typing-dots">
                            <div class="admin-typing-dot"></div>
                            <div class="admin-typing-dot"></div>
                            <div class="admin-typing-dot"></div>
                        </div>
                    </div>

                    <!-- Input Container -->
                    <div class="admin-chatbot-input-container">
                        <!-- Quick Actions -->
                        <div class="admin-chatbot-quick-actions">
                            <button class="admin-quick-action" onclick="adminChatbot.sendQuickMessage('Today\\'s report')">📈 Today's Report</button>
                            <button class="admin-quick-action" onclick="adminChatbot.sendQuickMessage('Sales analytics')">💰 Sales Analytics</button>
                            <button class="admin-quick-action" onclick="adminChatbot.sendQuickMessage('Customer insights')">👥 Customer Data</button>
                            <button class="admin-quick-action" onclick="adminChatbot.sendQuickMessage('Inventory status')">📦 Inventory Status</button>
                            <button class="admin-quick-action voice-quick" onclick="adminChatbot.toggleVoiceSearch()">🎤 Voice Query</button>
                        </div>

                        <!-- Input Wrapper -->
                        <div class="admin-chatbot-input-wrapper">
                            <input type="text" class="admin-chatbot-input" id="adminChatbotInput" 
                                   placeholder="Ask about reports, analytics, or data insights..." 
                                   maxlength="500">
                            <button class="admin-chatbot-voice-btn" id="adminVoiceBtn" title="Voice analytics query">
                                <i>🎤</i>
                            </button>
                            <button class="admin-chatbot-send" id="adminChatbotSend">
                                <i>📤</i>
                            </button>
                        </div>

                        <!-- Voice Indicator -->
                        <div class="admin-voice-indicator" id="adminVoiceIndicator">
                            <div class="admin-voice-animation">
                                <div class="admin-voice-wave"></div>
                                <div class="admin-voice-wave"></div>
                                <div class="admin-voice-wave"></div>
                            </div>
                            <span>Listening for analytics query...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    bindEvents() {
        const toggleBtn = document.getElementById('adminChatbotToggle');
        const closeBtn = document.getElementById('adminChatbotClose');
        const expandBtn = document.getElementById('adminChatbotExpand');
        const sendBtn = document.getElementById('adminChatbotSend');
        const input = document.getElementById('adminChatbotInput');
        const voiceBtn = document.getElementById('adminVoiceBtn');

        toggleBtn.addEventListener('click', () => this.toggle());
        closeBtn.addEventListener('click', () => this.close());
        expandBtn.addEventListener('click', () => this.toggleExpand());
        sendBtn.addEventListener('click', () => this.handleSend());
        voiceBtn.addEventListener('click', () => this.toggleVoiceSearch());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        input.addEventListener('input', (e) => {
            const sendBtn = document.getElementById('adminChatbotSend');
            sendBtn.disabled = !e.target.value.trim();
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
        const popup = document.getElementById('adminChatbotPopup');
        const button = document.getElementById('adminChatbotToggle');
        const icon = document.getElementById('adminChatbotIcon');
        
        popup.classList.add('active');
        button.classList.add('active');
        icon.textContent = '✖️';
        this.isOpen = true;

        // Focus on input
        setTimeout(() => {
            document.getElementById('adminChatbotInput').focus();
        }, 300);

        this.scrollToBottom();
    }

    close() {
        const popup = document.getElementById('adminChatbotPopup');
        const button = document.getElementById('adminChatbotToggle');
        const icon = document.getElementById('adminChatbotIcon');
        
        popup.classList.remove('active');
        button.classList.remove('active');
        icon.textContent = '�';
        this.isOpen = false;
    }

    toggleExpand() {
        const popup = document.getElementById('adminChatbotPopup');
        const expandBtn = document.getElementById('adminChatbotExpand');
        
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
        const input = document.getElementById('adminChatbotInput');
        const message = input.value.trim();
        
        if (message) {
            this.sendUserMessage(message);
            input.value = '';
            document.getElementById('adminChatbotSend').disabled = true;
        }
    }

    sendQuickMessage(message) {
        this.sendUserMessage(message);
    }

    sendUserMessage(message) {
        this.addUserMessage(message);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Send to backend with admin context
        this.sendToAdminBackend(message);
    }

    async sendToAdminBackend(message) {
        try {
            const response = await fetch('http://localhost:5000/api/admin/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId,
                    admin_context: true,
                    current_page: this.currentPage,
                    user_type: 'admin'
                })
            });

            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.response) {
                this.addBotMessage(data.response, data.report_data);
            } else {
                this.addBotMessage("I'm having trouble accessing the admin systems right now. Please try again or check the server status.");
            }
            
        } catch (error) {
            console.error('Admin Chatbot API Error:', error);
            this.hideTypingIndicator();
            this.addBotMessage("🔧 **System Error**: Unable to connect to admin analytics. Please check if the backend server is running and try again.");
        }
    }

    addUserMessage(message) {
        const messagesContainer = document.getElementById('adminChatbotMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'admin-message user';
        
        messageElement.innerHTML = `
            <div class="admin-message-content">${this.escapeHtml(message)}</div>
            <div class="admin-message-avatar">👤</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.messages.push({ type: 'user', content: message, timestamp: new Date() });
        this.scrollToBottom();
    }

    addBotMessage(message, reportData = null) {
        const messagesContainer = document.getElementById('adminChatbotMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'admin-message bot';
        
        let content = `<div class="admin-message-content">${this.formatMessage(message)}`;
        
        // Add report card if data provided
        if (reportData) {
            content += this.generateReportCard(reportData);
        }
        
        content += `</div>`;
        
        messageElement.innerHTML = `
            <div class="admin-message-avatar">🎯</div>
            ${content}
        `;
        
        messagesContainer.appendChild(messageElement);
        this.messages.push({ type: 'bot', content: message, reportData, timestamp: new Date() });
        this.scrollToBottom();
    }

    generateReportCard(data) {
        if (!data || typeof data !== 'object') return '';
        
        let card = `<div class="admin-report-card">`;
        
        if (data.title) {
            card += `<h4>${data.title}</h4>`;
        }
        
        if (data.stats && Array.isArray(data.stats)) {
            card += `<div class="report-stats">`;
            data.stats.forEach(stat => {
                card += `
                    <div class="stat">
                        <span class="stat-value">${stat.value}</span>
                        <span class="stat-label">${stat.label}</span>
                    </div>
                `;
            });
            card += `</div>`;
        }
        
        card += `</div>`;
        return card;
    }

    formatMessage(message) {
        // Convert markdown-style formatting to HTML
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
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
        const indicator = document.getElementById('adminTypingIndicator');
        indicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('adminTypingIndicator');
        indicator.style.display = 'none';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('adminChatbotMessages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    addWelcomeMessage() {
        setTimeout(() => {
            this.addBotMessage(`🎯 **Welcome to Admin AI Assistant!**\\n\\nI'm here to help with:\\n• 📊 **Real-time Analytics** - Sales, customers, orders\\n• 📈 **Performance Reports** - Daily, weekly, monthly insights\\n• 💡 **Business Intelligence** - Trends and recommendations\\n• ⚡ **System Monitoring** - Server status and performance\\n\\nTry asking: *"What's today's report?"* or use 🎤 **Voice Query** to speak your requests!`);
        }, 800);
    }
}

// Initialize Admin Chatbot
let adminChatbot;
document.addEventListener('DOMContentLoaded', function() {
    adminChatbot = new AdminChatbot();
});
