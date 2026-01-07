// src/pages/Login.jsx
import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // VITE এর জন্য .env থেকে API URL নেওয়া
  // .env.local এ VITE_API_URL=http://localhost:5000 রাখবেন
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLogin(); // ড্যাশবোর্ডে নিয়ে যাবে
      } else {
        setError(data.message || 'লগইন ব্যর্থ হয়েছে!');
      }
    } catch (err) {
      setError('সার্ভারের সাথে সংযোগ করা যাচ্ছে না।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --bg-color: #e0e5ec;
          --shadow: 9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5);
          --inner-shadow: inset 6px 6px 12px #b8b9be, inset -6px -6px 12px #ffffff;
        }
        .login-body {
          background-color: var(--bg-color);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Segoe UI', Arial, sans-serif;
        }
        .login-card {
          background: var(--bg-color);
          padding: 40px;
          border-radius: 25px;
          box-shadow: var(--shadow);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        .login-title {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 30px;
        }
        .login-form input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: none;
          border-radius: 10px;
          background: var(--bg-color);
          box-shadow: var(--inner-shadow);
          outline: none;
          font-size: 16px;
          box-sizing: border-box;
        }
        .login-btn {
          background: #3498db;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 20px;
          box-shadow: var(--shadow);
          font-size: 16px;
          opacity: ${loading ? 0.7 : 1};
          transition: opacity 0.3s;
        }
        .login-btn:disabled {
          cursor: not-allowed;
        }
        .error {
          color: #e74c3c;
          margin-top: 15px;
          font-weight: bold;
          background: #fadad7;
          padding: 10px;
          border-radius: 8px;
        }
      `}</style>

      <div className="login-body">
        <div className="login-card">
          <h1 className="login-title">দৈনিক সাইট খরচ - লগইন</h1>
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              placeholder="ফোন নম্বর"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="পাসওয়ার্ড"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {error && <div className="error">{error}</div>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}