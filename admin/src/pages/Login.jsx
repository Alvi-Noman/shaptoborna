// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // .env থেকে API URL নেওয়া হচ্ছে
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);

        window.dispatchEvent(new Event('storage'));

        setMessage('লগইন সফল! ড্যাশবোর্ডে নিয়ে যাচ্ছি...');
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        setMessage(data.message || 'ভুল ইউজারনেম বা পাসওয়ার্ড');
      }
    } catch (err) {
      setMessage('সার্ভারের সাথে সংযোগ করতে সমস্যা');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '50px 40px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '10px', color: '#2c3e50', fontSize: '32px' }}>সপ্তবর্ণা</h1>
        <p style={{ color: '#7f8c8d', marginBottom: '40px', fontSize: '18px' }}>অ্যাডমিন প্যানেলে স্বাগতম</p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '25px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#2c3e50' }}>
              ইউজারনেম
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="ইউজারনেম লিখুন"
              autoComplete="username"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '17px',
                border: '2px solid #ddd',
                borderRadius: '12px',
                outline: 'none',
                transition: '0.3s'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#2c3e50' }}>
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="পাসওয়ার্ড লিখুন"
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '17px',
                border: '2px solid #ddd',
                borderRadius: '12px',
                outline: 'none',
                transition: '0.3s'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>

        {message && (
          <p style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '10px',
            background: message.includes('সফল') ? '#d4edda' : '#f8d7da',
            color: message.includes('সফল') ? '#155724' : '#721c24',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}