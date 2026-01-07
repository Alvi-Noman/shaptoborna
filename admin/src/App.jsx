// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Teammate from './pages/Teammate';
import Site from './pages/Site';
import SummarySheet from './pages/SummarySheet';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  // এই state টা রিয়েল-টাইমে চেক করবে
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // যখনই localStorage চেঞ্জ হবে, তখনই রি-রেন্ডার হবে
  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    // প্রথমবার চেক
    checkLoginStatus();

    // localStorage চেঞ্জ হলে চেক করবে (যেমন লগআউট করলে)
    window.addEventListener('storage', checkLoginStatus);

    // ম্যানুয়ালি চেক করার জন্য একটা কাস্টম ইভেন্ট
    window.addEventListener('logout', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('logout', checkLoginStatus);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        {/* সাইডবার শুধু লগইন থাকলে দেখাবে */}
        {isLoggedIn && <Sidebar />}

        <main 
          className="main-content" 
          style={{ 
            marginLeft: isLoggedIn ? '280px' : '0',
            padding: isLoggedIn ? '60px 40px' : '0'  // লগইন পেজে প্যাডিং লাগবে না
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route 
              path="/" 
              element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SummarySheet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teammates"
              element={
                <ProtectedRoute>
                  <Teammate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/site"
              element={
                <ProtectedRoute>
                  <Site />
                </ProtectedRoute>
              }
            />
            <Route
              path="/summary"
              element={
                <ProtectedRoute>
                  <SummarySheet />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>

      {/* আপনার সুন্দর স্টাইল */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background-color: #f4f7f9; 
          color: #333;
        }
        .app-container { display: flex; min-height: 100vh; }
        .main-content {
          flex: 1;
          transition: margin-left 0.3s ease;
          width: 100%;
        }
        @media (max-width: 992px) {
          .main-content { 
            margin-left: ${isLoggedIn ? '80px' : '0'} !important; 
            padding: ${isLoggedIn ? '40px 20px' : '0'}; 
          }
        }
        @media (max-width: 480px) {
          .main-content { margin-left: 0 !important; padding: 30px 15px; }
        }
      `}</style>
    </Router>
  );
}