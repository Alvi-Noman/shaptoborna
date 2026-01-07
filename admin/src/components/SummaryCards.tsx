import React from 'react';

interface SummaryCardsProps {
  summary: {
    dep: string;
    exp: string;
    due: string;   // এটা এখন "মোট বাকী" (remaining due)
    bal: string;
  };
  labels: {
    lDep: string;
    lExp: string;
    lDue: string;  // এটা লেবেল হবে "সর্বমোট বকেয়া" বা "মোট বাকী"
    lBal: string;
  };
}

export default function SummaryCards({ summary, labels }: SummaryCardsProps) {
  return (
    <>
      <style>{`
        .summary-wrapper {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          padding: 30px 20px;
          background: transparent;
          width: 100%;
          max-width: none;
          margin: 0;
        }

        .summary-card {
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
          text-align: left;
        }

        .summary-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .summary-label {
          font-size: 15px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .summary-value {
          font-size: 36px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .summary-value.due-positive { color: #c0392b; }
        .summary-value.due-zero    { color: #7f8c8d; }
        .summary-value.positive    { color: #10b981; }
        .summary-value.negative    { color: #ef4444; }

        @media (max-width: 768px) {
          .summary-wrapper { gap: 20px; padding: 20px 15px; }
          .summary-value { font-size: 32px; }
        }
        @media (max-width: 480px) {
          .summary-wrapper { grid-template-columns: 1fr; }
          .summary-value { font-size: 30px; }
        }
      `}</style>

      <div className="summary-wrapper">
        <div className="summary-card">
          <div className="summary-label">{labels.lDep}</div>
          <div className="summary-value">৳{summary.dep}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">{labels.lExp}</div>
          <div className="summary-value">৳{summary.exp}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">{labels.lDue}</div>
          <div className={`summary-value ${
            parseFloat(summary.due) > 0 ? 'due-positive' : 
            parseFloat(summary.due) === 0 ? 'due-zero' : 'positive'
          }`}>
            ৳{summary.due}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">{labels.lBal}</div>
          <div className={`summary-value ${parseFloat(summary.bal) >= 0 ? 'positive' : 'negative'}`}>
            ৳{summary.bal}
          </div>
        </div>
      </div>
    </>
  );
}