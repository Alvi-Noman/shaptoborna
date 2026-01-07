import React from 'react';

interface FilterPanelProps {
  labels: {
    sFrom: string;
    sTo: string;
    sProv: string;
    sSite: string;
  };
}

export default function FilterPanel({ labels }: FilterPanelProps) {
  return (
    <>
      <style>{`
        .filter-panel {
          background: #ffffff;
          padding: 20px;
          border-bottom: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .left-filters, .right-filters {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .search-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .search-group label {
          font-weight: bold;
          font-size: 14px;
          color: #2c3e50;
        }

        .search-group input {
          padding: 12px;
          border: 1px solid #bdc3c7;
          border-radius: 8px;
          font-size: 14px;
          min-width: 180px;
        }

        @media (max-width: 768px) {
          .filter-panel { flex-direction: column; }
          .left-filters, .right-filters { justify-content: stretch; width: 100%; }
          .search-group input { min-width: 100%; }
        }
      `}</style>

      <div className="filter-panel">
        <div className="left-filters">
          <div className="search-group">
            <label>{labels.sProv}</label>
            <input type="text" placeholder="..." />
          </div>
          <div className="search-group">
            <label>{labels.sSite}</label>
            <input type="text" placeholder="..." />
          </div>
        </div>

        <div className="right-filters">
          <div className="search-group">
            <label>{labels.sFrom}</label>
            <input type="date" />
          </div>
          <div className="search-group">
            <label>{labels.sTo}</label>
            <input type="date" />
          </div>
        </div>
      </div>
    </>
  );
}