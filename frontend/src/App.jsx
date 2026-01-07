import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { jwtDecode } from 'jwt-decode';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        return false;
      }
      return true;
    } catch (err) {
      localStorage.removeItem('token');
      return false;
    }
  };

  useEffect(() => {
    setIsLoggedIn(checkAuth());
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}