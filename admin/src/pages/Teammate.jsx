// frontend/src/pages/Teammate.jsx
import React, { useState, useEffect } from 'react';

export default function Teammate() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token') || 'dev-token-123';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchTeammates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/teammates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTeammates(Array.isArray(data) ? data : []);
      } else {
        console.log('Failed to fetch teammates:', res.status);
        setTeammates([]);
      }
    } catch (err) {
      console.error('Error fetching teammates:', err);
      setTeammates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/teammates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('টিমমেট সফলভাবে যোগ হয়েছে');
        setName('');
        setPhone('');
        setPassword('');
        fetchTeammates();
      } else {
        setMessage(data.message || 'কিছু ভুল হয়েছে');
      }
    } catch (err) {
      setMessage('সার্ভারের সাথে সংযোগ করতে সমস্যা');
    }
  };

  useEffect(() => {
    fetchTeammates();
  }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>টিমমেট যোগ করুন</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '50px', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>নাম</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '8px' }}
            placeholder="উদাহরণ: রহিম"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>ফোন নম্বর</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '8px' }}
            placeholder="উদাহরণ: 01700000000"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>পাসওয়ার্ড</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '8px' }}
            placeholder="কমপক্ষে ৬ অক্ষর"
          />
        </div>

        <button
          type="submit"
          style={{
            padding: '14px 32px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          টিমমেট যোগ করুন
        </button>

        {message && (
          <p style={{ marginTop: '15px', color: message.includes('সফল') ? 'green' : 'red', fontWeight: 'bold' }}>
            {message}
          </p>
        )}
      </form>

      <h3>বর্তমান টিমমেট ({teammates.length})</h3>
      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : teammates.length === 0 ? (
        <p>কোনো টিমমেট নেই</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#2c3e50', color: 'white' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>নাম</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>ফোন</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>তারিখ</th>
            </tr>
          </thead>
          <tbody>
            {teammates.map((t) => (
              <tr key={t._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{t.name}</td>
                <td style={{ padding: '15px' }}>{t.phone}</td>
                <td style={{ padding: '15px' }}>
                  {new Date(t.createdAt).toLocaleDateString('bn-BD')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}