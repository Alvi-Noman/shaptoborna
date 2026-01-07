import React from 'react';

interface PopupProps {
  expense: any; // Full expense object from database
  onClose: () => void;
}

export default function Popup({ expense, onClose }: PopupProps) {
  if (!expense) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <style>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .popup-content {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .popup-header {
          padding: 30px;
          background: linear-gradient(135deg, #2c3e50, #3498db);
          color: white;
          border-radius: 20px 20px 0 0;
          text-align: center;
        }

        .popup-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 10px 0;
        }

        .popup-subtitle {
          font-size: 18px;
          opacity: 0.9;
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 30px;
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          transition: 0.3s;
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.4);
        }

        .popup-body {
          padding: 30px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-item {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 12px;
          border-left: 5px solid #3498db;
        }

        .info-label {
          font-size: 14px;
          color: #7f8c8d;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .info-value {
          font-size: 20px;
          font-weight: 700;
          color: #2c3e50;
        }

        .rows-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        .rows-table th {
          background: #2c3e50;
          color: white;
          padding: 14px;
          text-align: left;
        }

        .rows-table td {
          padding: 14px;
          border-bottom: 1px solid #eee;
        }

        .rows-table tr:hover {
          background: #f8fbff;
        }

        .note-box {
          background: #fff9e6;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #ffeaa7;
          margin-top: 20px;
          font-style: italic;
          color: #636e72;
        }

        @media (max-width: 768px) {
          .popup-content {
            width: 95%;
            margin: 20px;
          }
          .popup-header {
            padding: 20px;
          }
          .popup-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
          <div className="popup-header">
            <h2 className="popup-title">{expense.siteName}</h2>
            <p className="popup-subtitle">
              {formatDate(expense.date)} — {expense.userId?.name || 'Unknown'}
            </p>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="popup-body">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">জমা</div>
                <div className="info-value">৳{(expense.deposit || 0).toFixed(2)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">মোট খরচ</div>
                <div className="info-value">৳{(expense.totals?.grandTotalCash || 0).toFixed(2)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">মোট বকেয়া</div>
                <div className="info-value">৳{(expense.totals?.grandTotalDue || 0).toFixed(2)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">উদ্বৃত্ত</div>
                <div className="info-value" style={{ 
                  color: (expense.totals?.balance || 0) >= 0 ? '#27ae60' : '#e74c3c' 
                }}>
                  ৳{(expense.totals?.balance || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <h3 style={{ margin: '30px 0 15px 0', color: '#2c3e50', fontSize: '22px' }}>
              খরচের বিবরণ
            </h3>

            <table className="rows-table">
              <thead>
                <tr>
                  <th>ক্রঃ</th>
                  <th>বিবরণ</th>
                  <th>পরিমাণ</th>
                  <th>নগদ</th>
                  <th>বাকী</th>
                </tr>
              </thead>
              <tbody>
                {expense.rows.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{row.desc || '-'}</td>
                    <td>৳{(row.amt || 0).toFixed(2)}</td>
                    <td>৳{(row.cash || 0).toFixed(2)}</td>
                    <td>{(row.due || 0).toFixed(0)}</td>
                  </tr>
                ))}
                {expense.lastRowCash > 0 && (
                  <tr style={{ background: '#fff3cd', fontWeight: 'bold' }}>
                    <td>{expense.rows.length + 1}</td>
                    <td>বাকি পরিশোধ *</td>
                    <td>-</td>
                    <td>৳{expense.lastRowCash.toFixed(2)}</td>
                    <td>-</td>
                  </tr>
                )}
              </tbody>
            </table>

            {expense.note && (
              <div className="note-box">
                <strong>মন্তব্য:</strong> {expense.note}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}