import React from 'react';

interface DetailsButtonProps {
  onClick: () => void;
}

export default function DetailsButton({ onClick }: DetailsButtonProps) {
  return (
    <>
      <style>{`
        .details-btn {
          padding: 8px 16px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
        }

        .details-btn:hover {
          background: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
        }

        .details-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <button className="details-btn" onClick={onClick}>
        Details
      </button>
    </>
  );
}