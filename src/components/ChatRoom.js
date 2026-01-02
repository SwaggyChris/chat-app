// components/ChatRoom.js
import React, { useState, useEffect, useRef } from 'react';

const ChatRoom = ({ currentUser, onLogout }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialize messages from localStorage
  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    setMessages(savedMessages);
    
    // Simulate online users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    setOnlineUsers(users.map(u => u.username));
  }, []);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: currentUser.username,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    setMessage('');
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
      localStorage.removeItem('chatMessages');
    }
  };

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
                <span>{user}</span>
                {user === currentUser.username && <span className="you-badge">You</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <button onClick={clearChat} className="clear-chat-button">
            Clear Chat
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        <div className="chat-header">
          <h2>Global Chat Room</h2>
          <p>Welcome to the community chat!</p>
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
                className={`message ${msg.isOwn ? 'own-message' : 'other-message'}`}
              >
                <div className="message-header">
                  <span className="message-sender">{msg.sender}</span>
                  <span className="message-time">{msg.timestamp}</span>
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
          />
          <button type="submit" className="send-button" disabled={!message.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;