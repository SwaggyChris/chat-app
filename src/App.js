// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ChatRoom from './components/ChatRoom';
import './index.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app load
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              currentUser ? 
              <Navigate to="/chat" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              currentUser ? 
              <Navigate to="/chat" /> : 
              <SignUp onSignup={handleLogin} />
            } 
          />
          <Route 
            path="/chat" 
            element={
              currentUser ? 
              <ChatRoom currentUser={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;