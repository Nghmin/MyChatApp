import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './features/auth/RegisterPage';
import LoginPage from './features/auth/LoginPage';
import ChatPage from './features/chat/ChatPage';
import VideoCallPage from './features/chat/VideoCallPage';


function App() {
  return (
    <Router>
      <Routes>
        {/* Mặc định vào trang Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/chat" element={<ChatPage/>} />
        <Route path="/video-call" element={<VideoCallPage />} />
      </Routes>
    </Router>
  );
}

export default App;