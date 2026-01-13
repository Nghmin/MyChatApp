import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './features/auth/RegisterPage';
import LoginPage from './features/auth/LoginPage';
import ChatPage from './features/chat/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Mặc định vào trang Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/chat" element={<ChatPage/>} />
      </Routes>
    </Router>
  );
}

export default App;