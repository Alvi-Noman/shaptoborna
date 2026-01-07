// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';

export default function Dashboard({ onLogout }) {
  const [dateTime, setDateTime] = useState(new Date().toLocaleString('bn-BD'));
  const [siteName, setSiteName] = useState('');
  const [deposit, setDeposit] = useState(0);
  const [rows, setRows] = useState([{ id: 1, desc: '', amt: 0, cash: 0 }]);
  const [lastRowCash, setLastRowCash] = useState(0);
  const [note, setNote] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  // নতুন: ডাটাবেস থেকে সাইট লোড করার জন্য
  const [sites, setSites] = useState([]);
  // নতুন: লগইন করা ইউজারের নাম
  const [userName, setUserName] = useState('লোড হচ্ছে...');

  const token = localStorage.getItem('token');

  // সাইট লোড করুন
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/sites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSites(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.log('সাইট লোড করতে সমস্যা');
      }
    };
    fetchSites();
  }, [token]);

  // ইউজারের নাম বের করুন (JWT থেকে)
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.name || 'অজানা');
      } catch (err) {
        setUserName('অজানা');
      }
    }
  }, [token]);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date().toLocaleString('bn-BD')), 1000);
    return () => clearInterval(timer);
  }, []);

  const addNewRow = () => {
    setRows([...rows, { id: rows.length + 1, desc: '', amt: 0, cash: 0 }]);
  };

  const updateRow = (index, field, value) => {
    const updatedRows = [...rows];
    const numValue = parseFloat(value) || 0;

    if (field === 'amt') {
      updatedRows[index].amt = numValue;
      updatedRows[index].cash = numValue;
    } else if (field === 'cash') {
      updatedRows[index].cash = numValue;
    } else if (field === 'due') {
      updatedRows[index].cash = (updatedRows[index].amt || 0) - numValue;
    } else if (field === 'desc') {
      updatedRows[index].desc = value;
    }

    setRows(updatedRows);
  };

  const calculateTotals = () => {
    let totalAmt = 0;
    let totalCash = 0;
    let totalDue = 0;

    rows.forEach(row => {
      const amt = parseFloat(row.amt || 0);
      const cash = parseFloat(row.cash || 0);
      totalAmt += amt;
      totalCash += cash;
      totalDue += (amt - cash);
    });

    const duePaid = parseFloat(lastRowCash || 0);
    const grandTotalCash = totalCash + duePaid;
    const grandTotalDue = totalDue - duePaid;
    const balance = (parseFloat(deposit) || 0) - grandTotalCash;

    return { totalAmt, grandTotalCash, totalDue, duePaid, grandTotalDue, balance };
  };

  const { totalAmt, grandTotalCash, totalDue, duePaid, grandTotalDue, balance } = calculateTotals();

  const handleSubmit = async () => {
    if (!siteName) return alert("একটি সাইট নির্বাচন করুন!");

    const totals = calculateTotals();

    const expenseData = {
      siteName,
      deposit,
      rows: rows.map(row => ({
        desc: row.desc || '',
        amt: parseFloat(row.amt) || 0,
        cash: parseFloat(row.cash) || 0
      })),
      lastRowCash: parseFloat(lastRowCash) || 0,
      note,
      totals: {
        totalAmt: totals.totalAmt,
        grandTotalCash: totals.grandTotalCash,
        totalDue: totals.totalDue,
        duePaid: totals.duePaid,
        grandTotalDue: totals.grandTotalDue,
        balance: totals.balance
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
      });

      const data = await response.json();
      if (response.ok) {
        setIsLocked(true);
        alert("ডেটা সফলভাবে সংরক্ষিত হয়েছে!");
      } else {
        alert(data.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      alert('সার্ভারের সাথে সংযোগ করা যাচ্ছে না');
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

        .app-body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background-color: var(--bg-color);
          min-height: 100vh;
          padding: 10px;
          display: flex;
          justify-content: center;
        }

        .calculator-frame {
          background-color: var(--bg-color);
          padding: 15px;
          border-radius: 25px;
          box-shadow: var(--shadow);
          max-width: 500px;
          width: 100%;
          position: relative;
        }

        .header-top {
          text-align: right;
          font-size: 12px;
          color: #666;
        }

        .main-title {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
        }

        .info-section {
          background: var(--bg-color);
          padding: 12px;
          border-radius: 15px;
          box-shadow: var(--inner-shadow);
          margin-bottom: 15px;
        }

        .info-row {
          font-size: 13px;
          margin-bottom: 8px;
          border-bottom: 1px dashed #ccc;
          padding-bottom: 5px;
        }

        input, textarea, select {
          width: 100%;
          border: none;
          padding: 10px;
          border-radius: 8px;
          background: var(--bg-color);
          box-shadow: var(--inner-shadow);
          outline: none;
          margin-top: 5px;
          box-sizing: border-box;
        }

        select {
          font-size: 14px;
        }

        .btn-add {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          background: #fff;
          border-radius: 8px;
          margin-top: 10px;
        }

        th {
          background: #444;
          color: white;
          padding: 8px;
        }

        td {
          border: 1px solid #eee;
          padding: 5px;
          text-align: center;
        }

        .total-row {
          background: #333 !important;
          color: white;
          font-weight: bold;
        }

        .balance-display {
          background: #d1d9e6;
          padding: 15px;
          border-radius: 15px;
          margin-top: 15px;
          box-shadow: var(--inner-shadow);
          text-align: center;
          font-size: 16px;
          font-weight: bold;
        }

        .button-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }

        .btn {
          padding: 12px 25px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: var(--shadow);
        }

        .btn-cancel {
          background: #e74c3c;
          color: white;
        }

        .btn-submit {
          background: #3498db;
          color: white;
        }

        .btn-logout {
          background: #95a5a6;
          color: white;
          font-size: 12px;
          padding: 8px 16px;
        }

        .locked {
          pointer-events: none;
          opacity: 0.7;
        }
      `}</style>

      <div className="app-body">
        <div className={`calculator-frame ${isLocked ? 'locked' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="header-top">ফরম - ক</div>
            <button className="btn btn-logout" onClick={onLogout}>লগআউট</button>
          </div>

          <div className="main-title">দৈনিক সাইট খরচ</div>

          <div className="info-section">
            <div className="info-row"><b>তারিখ ও সময়:</b> {dateTime}</div>
            <div className="info-row"><b>হিসাব প্রদানকারী:</b> {userName}</div>

            <label>সাইটের নাম:</label>
            <select value={siteName} onChange={(e) => setSiteName(e.target.value)} disabled={isLocked}>
              <option value="">— সাইট নির্বাচন করুন —</option>
              {sites.map(site => (
                <option key={site._id} value={site.name}>
                  {site.name}
                </option>
              ))}
            </select>

            <label style={{ display: 'block', marginTop: '10px' }}>জমা:</label>
            <input
              type="number"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              placeholder="0.00"
              disabled={isLocked}
            />
          </div>

          {/* বাকি সব আপনার কোড অপরিবর্তিত */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#444' }}>খরচ বিবরণী:</span>
            {!isLocked && <button className="btn-add" onClick={addNewRow}>[ সারি যুক্ত করুন ]</button>}
          </div>

          {/* টেবিল, টোটাল, ব্যালেন্স — আপনার আগের মতোই */}
          <table>
            <thead>
              <tr>
                <th>ক্র:</th>
                <th>বিবরণ</th>
                <th>পরিমাণ</th>
                <th>নগদ</th>
                <th>বাকী</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <input
                      type="text"
                      style={{boxShadow:'none', background:'transparent'}}
                      value={row.desc}
                      onChange={(e) => updateRow(index, 'desc', e.target.value)}
                      disabled={isLocked}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{boxShadow:'none', background:'transparent'}}
                      value={row.amt}
                      onChange={(e) => updateRow(index, 'amt', e.target.value)}
                      disabled={isLocked}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{boxShadow:'none', background:'transparent'}}
                      value={row.cash}
                      onChange={(e) => updateRow(index, 'cash', e.target.value)}
                      disabled={isLocked}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{boxShadow:'none', background:'transparent'}}
                      value={Math.floor(parseFloat(row.amt || 0) - parseFloat(row.cash || 0))}
                      onChange={(e) => updateRow(index, 'due', e.target.value)}
                      disabled={isLocked}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#fff3cd', fontWeight: 'bold' }}>
                <td>{rows.length + 1}</td>
                <td>বাকি পরিশোধ *</td>
                <td>---</td>
                <td>
                  <input
                    type="number"
                    style={{boxShadow:'none', background:'transparent'}}
                    value={lastRowCash}
                    onChange={(e) => setLastRowCash(e.target.value)}
                    disabled={isLocked}
                  />
                </td>
                <td>---</td>
              </tr>
              <tr className="total-row">
                <td colSpan="2">মোট</td>
                <td>{totalAmt.toFixed(2)}</td>
                <td>{grandTotalCash.toFixed(2)}</td>
                <td>{grandTotalDue.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="balance-display" style={{ color: balance < 0 ? 'red' : 'black' }}>
            উদ্বৃত্ত / অতিরিক্ত: {balance.toFixed(2)}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="মন্তব্য লিখুন..."
            disabled={isLocked}
          ></textarea>

          <div className="button-group">
            <button className="btn btn-cancel" onClick={() => window.location.reload()}>CANCEL</button>
            {!isLocked && <button className="btn btn-submit" onClick={handleSubmit}>SUBMIT</button>}
          </div>
        </div>
      </div>
    </>
  );
}