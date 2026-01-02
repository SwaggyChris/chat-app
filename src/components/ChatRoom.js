import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';

const ChatRoom = ({ currentUser, onLogout }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize messages and online users
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch messages from API
        const messagesResponse = await chatAPI.getMessages();
        setMessages(messagesResponse.data.messages);
        
        // Fetch online users
        const usersResponse = await chatAPI.getOnlineUsers();
        setOnlineUsers(usersResponse.data.users);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to showing just current user
        setOnlineUsers([{ username: currentUser.username, isCurrentUser: true }]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up interval to refresh online users every 30 seconds
    const interval = setInterval(async () => {
      try {
        const usersResponse = await chatAPI.getOnlineUsers();
        setOnlineUsers(usersResponse.data.users);
      } catch (error) {
        console.error('Error refreshing online users:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || sending) return;

    setSending(true);

    try {
      const response = await chatAPI.sendMessage(message);
      const newMessage = response.data.message;
      
      // Add the new message to the list
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-main" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{currentUser.username}</h3>
              <p className="user-status">Online</p>
            </div>
          </div>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>

        <div className="sidebar-section">
          <h4>Online Users ({onlineUsers.length})</h4>
          <div className="users-list">
            {onlineUsers.map((user, index) => (
              <div key={index} className="user-item">
                <span className="online-indicator"></span>
                <span>{user.username}</span>
                {user.isCurrentUser && <span className="you-badge">You</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <button onClick={clearChat} className="clear-chat-button">
            Clear Chat History
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        <div className="chat-header">
          <h2>Global Chat Room</h2>
          <p>Welcome to the community chat, {currentUser.username}!</p>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-icon">💬</div>
              <h3>No messages yet</h3>
              <p>Start a conversation by sending a message!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender === currentUser.username ? 'own-message' : 'other-message'}`}
              >
                <div className="message-header">
                  <span className="message-sender">{msg.sender}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="message-input"
            disabled={sending}
          />
          <button 
            type="submit" 
            className="send-button" 
            disabled={!message.trim() || sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;