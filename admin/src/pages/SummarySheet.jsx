// frontend/src/pages/Site.jsx
import React, { useState, useEffect } from 'react';

export default function Site() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token') || 'dev-token-123';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/sites`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSites(Array.isArray(data) ? data : []);
      } else {
        console.log('Failed to fetch sites:', res.status);
        setSites([]);
        if (res.status === 403) {
          setMessage('অনুমতি নেই। আপনি লগইন করেছেন?');
        }
      }
    } catch (err) {
      console.error('Error fetching sites:', err);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, address }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('সাইট সফলভাবে যোগ হয়েছে');
        setName('');
        setAddress('');
        fetchSites();
      } else {
        setMessage(data.message || 'সাইট যোগ করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      setMessage('সার্ভারের সাথে সংযোগ করতে সমস্যা');
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>নতুন সাইট যোগ করুন</h2>

      <form onSubmit={handleSubmit} style={{
        background: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '50px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>সাইটের নাম</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="যেমন: ধানমন্ডি প্রজেক্ট"
            style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>ঠিকানা</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows="4"
            placeholder="বিস্তারিত ঠিকানা লিখুন"
            style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '8px', resize: 'vertical' }}
          />
        </div>

        <button type="submit" style={{
          padding: '14px 32px',
          background: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
        }}>
          সাইট যোগ করুন
        </button>

        {message && (
          <p style={{
            marginTop: '15px',
            padding: '10px',
            borderRadius: '8px',
            background: message.includes('সফল') ? '#d4edda' : '#f8d7da',
            color: message.includes('সফল') ? '#155724' : '#721c24',
            fontWeight: 'bold'
          }}>
            {message}
          </p>
        )}
      </form>

      <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
        বর্তমান সাইটসমূহ ({sites.length})
      </h3>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '20px' }}>লোড হচ্ছে...</p>
      ) : sites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '12px' }}>
          <p style={{ fontSize: '18px', color: '#6c757d' }}>এখনো কোনো সাইট যোগ করা হয়নি</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ background: '#2c3e50', color: 'white' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>নাম</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>ঠিকানা</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>তৈরির তারিখ</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{s.name}</td>
                  <td style={{ padding: '15px' }}>{s.address}</td>
                  <td style={{ padding: '15px', color: '#666' }}>
                    {new Date(s.createdAt).toLocaleDateString('bn-BD')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}