import React from 'react';
import DetailsButton from './DetailsButton';

interface DataTableProps {
  expenses: any[];
  loading: boolean;
  labels: any;
  formatDate: (date: string) => string;
  onDetailsClick: (expense: any) => void;
}

export default function DataTable({
  expenses,
  loading,
  labels,
  formatDate,
  onDetailsClick
}: DataTableProps) {

  // বাকী খরচ = প্রতিটি রো থেকে (amt - cash)
  const getTotalDueFromRows = (expense: any): number => {
    if (!expense.rows || !Array.isArray(expense.rows)) return 0;
    return expense.rows.reduce((sum: number, row: any) => {
      const amt = parseFloat(row.amt) || 0;
      const cash = parseFloat(row.cash) || 0;
      return sum + (amt - cash);
    }, 0);
  };

  return (
    <>
      <style>{`
        .table-container { 
          flex: 1; overflow-y: auto; padding: 10px; background: white;
        }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        thead th { 
          position: sticky; top: 0; background: #2c3e50; color: white; 
          padding: 16px; border: 1px solid #444; font-size: 14px; font-weight: bold;
        }
        tbody td { 
          padding: 14px; text-align: center; border: 1px solid #ddd; font-size: 13px;
        }
        .loading-row td { padding: 60px; font-size: 18px; color: #7f8c8d; }
        .actions-cell { text-align: center; }
      `}</style>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{labels.hSl}</th>
              <th>{labels.hDt}</th>
              <th>{labels.hPr}</th>
              <th>{labels.hSt}</th>
              <th>{labels.hDp}</th>
              <th>নগদ খরচ</th>
              <th>বাকী খরচ</th>
              <th>{labels.hBl}</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={9}>{labels.loading}</td></tr>
            ) : expenses.length === 0 ? (
              <tr className="loading-row"><td colSpan={9}>{labels.noData}</td></tr>
            ) : (
              expenses.map((expense, index) => {
                const totalDue = getTotalDueFromRows(expense);

                return (
                  <tr key={expense._id}>
                    <td>{index + 1}</td>
                    <td>{formatDate(expense.date)}</td>
                    <td>{expense.userId?.name || 'Unknown'}</td>
                    <td>{expense.siteName}</td>

                    {/* জমা */}
                    <td>৳{(expense.deposit || 0).toFixed(2)}</td>

                    {/* নগদ খরচ (including বাকি পরিশোধ) */}
                    <td>৳{(expense.totals?.grandTotalCash || 0).toFixed(2)}</td>

                    {/* বাকী খরচ – শুধু সেই দিনের বাকী */}
                    <td style={{ fontWeight: 'bold', color: totalDue > 0 ? '#e67e22' : '#27ae60' }}>
                      ৳{totalDue.toFixed(2)}
                    </td>

                    {/* উদ্বৃত্ত */}
                    <td>৳{(expense.totals?.balance || 0).toFixed(2)}</td>

                    <td className="actions-cell">
                      <DetailsButton onClick={() => onDetailsClick(expense)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}