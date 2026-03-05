import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    Bot, 
    Send, 
    Loader, 
    FileText, 
    AlertCircle, 
    Lightbulb,
    Search,
    Zap,
    MessageSquare,
    RefreshCw
} from 'lucide-react';
import '../styles/AIDocumentChat.css';

const AIDocumentChat = () => {
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [chatSession, setChatSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingDocuments, setLoadingDocuments] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    // Quick action buttons
    const quickActions = [
        { id: 'summarize', label: 'Summarize', icon: FileText, prompt: 'Summarize this document' },
        { id: 'risks', label: 'Find Risks', icon: AlertCircle, prompt: 'Analyze risks in this document' },
        { id: 'key-points', label: 'Key Points', icon: Lightbulb, prompt: 'Extract key points' },
        { id: 'simplify', label: 'Simplify', icon: Zap, prompt: 'Explain this in simple terms' },
    ];

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load user's documents
    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setLoadingDocuments(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/documents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(response.data.documents || []);
        } catch (error) {
            console.error('Error loading documents:', error);
            setError('Failed to load documents');
        } finally {
            setLoadingDocuments(false);
        }
    };

    // Load chat session when document is selected
    const loadChatSession = async (documentId) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/chat/${documentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChatSession(response.data);
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Error loading chat session:', error);
            setError('Failed to load chat session');
        } finally {
            setLoading(false);
        }
    };

    // Send message to AI
    const sendMessage = async (messageText) => {
        if (!selectedDocument || !messageText.trim()) return;

        const userMessage = {
            role: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/chat/${selectedDocument._id}/message`,
                { message: messageText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiMessage = response.data.message;
            setMessages(prev => [...prev, aiMessage]);

            // Update chat session stats
            if (response.data.chat) {
                setChatSession(response.data.chat);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setError(error.response?.data?.message || 'Failed to send message');
            // Remove the user message if sending failed
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setLoading(false);
        }
    };

    // Handle quick action
    const handleQuickAction = (action) => {
        sendMessage(action.prompt);
    };

    // Handle document selection
    const handleDocumentSelect = (doc) => {
        setSelectedDocument(doc);
        loadChatSession(doc._id);
    };

    // Handle new chat
    const handleNewChat = () => {
        setSelectedDocument(null);
        setChatSession(null);
        setMessages([]);
        setError(null);
    };

    return (
        <div className="ai-chat-container">
            {/* Sidebar - Document List */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <div className="header-content">
                        <Bot size={24} className="header-icon" />
                        <div>
                            <h3>AI Document Chat</h3>
                            <p>Chat with your documents</p>
                        </div>
                    </div>
                    {selectedDocument && (
                        <button className="new-chat-btn" onClick={handleNewChat}>
                            <RefreshCw size={16} />
                        </button>
                    )}
                </div>

                <div className="documents-list">
                    {loadingDocuments ? (
                        <div className="loading-state">
                            <Loader className="spinner" />
                            <p>Loading documents...</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={48} />
                            <p>No documents yet</p>
                            <span>Create a document to start chatting</span>
                        </div>
                    ) : (
                        documents.map(doc => (
                            <div
                                key={doc._id}
                                className={`document-item ${selectedDocument?._id === doc._id ? 'active' : ''}`}
                                onClick={() => handleDocumentSelect(doc)}
                            >
                                <FileText size={20} />
                                <div className="document-info">
                                    <h4>{doc.title}</h4>
                                    <span>{doc.type || 'Document'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-main">
                {!selectedDocument ? (
                    <div className="chat-welcome">
                        <div className="welcome-content">
                            <Bot size={64} className="welcome-icon" />
                            <h2>AI Document Assistant</h2>
                            <p>Select a document to start an intelligent conversation</p>
                            <div className="welcome-features">
                                <div className="feature">
                                    <MessageSquare size={24} />
                                    <span>Ask questions about your documents</span>
                                </div>
                                <div className="feature">
                                    <Search size={24} />
                                    <span>Extract key information instantly</span>
                                </div>
                                <div className="feature">
                                    <Lightbulb size={24} />
                                    <span>Get smart suggestions and insights</span>
                                </div>
                                <div className="feature">
                                    <AlertCircle size={24} />
                                    <span>Identify risks and issues</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="chat-header">
                            <div className="chat-header-content">
                                <FileText size={24} />
                                <div>
                                    <h3>{selectedDocument.title}</h3>
                                    <span>{selectedDocument.type || 'Document'}</span>
                                </div>
                            </div>
                            {chatSession && (
                                <div className="chat-stats">
                                    <span>{chatSession.stats?.totalMessages || 0} messages</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        {messages.length === 0 && (
                            <div className="quick-actions">
                                <p>Quick Actions:</p>
                                <div className="actions-grid">
                                    {quickActions.map(action => (
                                        <button
                                            key={action.id}
                                            className="quick-action-btn"
                                            onClick={() => handleQuickAction(action)}
                                            disabled={loading}
                                        >
                                            <action.icon size={18} />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.length === 0 && !loading && (
                                <div className="empty-chat">
                                    <Bot size={48} />
                                    <p>Ask me anything about this document!</p>
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.role}`}>
                                    <div className="message-avatar">
                                        {msg.role === 'user' ? '👤' : <Bot size={20} />}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-text">{msg.content}</div>
                                        {msg.timestamp && (
                                            <div className="message-time">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="message assistant">
                                    <div className="message-avatar">
                                        <Bot size={20} />
                                    </div>
                                    <div className="message-content">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="error-message">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="chat-input-area">
                            <div className="chat-input-wrapper">
                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder="Ask about this document..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !loading) {
                                            sendMessage(inputMessage);
                                        }
                                    }}
                                    disabled={loading}
                                />
                                <button
                                    className="send-btn"
                                    onClick={() => sendMessage(inputMessage)}
                                    disabled={loading || !inputMessage.trim()}
                                >
                                    {loading ? <Loader className="spinner" size={20} /> : <Send size={20} />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AIDocumentChat;
