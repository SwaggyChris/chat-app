const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// In-memory database (for demo)
let users = [];
let messages = [];

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Signup endpoint - ONLY username and password
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    // Check if username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    console.log('New user created:', newUser.username);

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint - ONLY username and password
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user by username
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    user: req.user
  });
});

// Get all messages
app.get('/api/messages', authenticateToken, (req, res) => {
  res.json({
    messages: messages.slice(-50) // Return last 50 messages
  });
});

// Send message
app.post('/api/messages', authenticateToken, (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const newMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: req.user.username,
      senderId: req.user.userId,
      timestamp: new Date().toISOString()
    };

    messages.push(newMessage);

    // Simulate bot response after 1 second
    setTimeout(() => {
      const responses = [
        "Hello! How are you doing?",
        "Thanks for your message!",
        "How can I help you today?",
        "That's interesting, tell me more!",
        "I understand what you're saying.",
        "Let's discuss this further.",
        "Great point!",
        "What are your thoughts on this?",
        "I agree with you.",
        "Thanks for sharing!"
      ];
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: "ChatBot",
        senderId: "bot",
        timestamp: new Date().toISOString()
      };
      
      messages.push(botMessage);
    }, 1000);

    res.status(201).json({
      message: 'Message sent successfully',
      // eslint-disable-next-line no-dupe-keys
      message: newMessage
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get online users
app.get('/api/users/online', authenticateToken, (req, res) => {
  const onlineUsers = users.map(user => ({
    username: user.username,
    isCurrentUser: user.id === req.user.userId
  }));
  
  res.json({ users: onlineUsers });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    totalUsers: users.length,
    totalMessages: messages.length
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Chat App Server running on port ${PORT}`);
  console.log(`📝 API Endpoints:`);
  console.log(`   POST /api/signup - Create account`);
  console.log(`   POST /api/login - Login`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /api/messages - Get messages (authenticated)`);
  console.log(`   POST /api/messages - Send message (authenticated)`);
  console.log(`   GET  /api/users/online - Get online users (authenticated)`);
});