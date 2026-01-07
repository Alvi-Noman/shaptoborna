// frontend/src/pages/SummarySheet.jsx
import React, { useState, useEffect } from 'react';
import SummaryCards from '../components/SummaryCards';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import Popup from '../components/Popup';

const LABELS = {
  lDep: "সর্বমোট জমা",
  lExp: "সর্বমোট খরচ",
  lDue: "সর্বমোট বকেয়া",
  lBal: "সর্বমোট উদ্বৃত্ত",
  sFrom: "তারিখ (হতে)",
  sTo: "তারিখ (পর্যন্ত)",
  sProv: "প্রদানকারী",
  sSite: "সাইট",
  hSl: "ক্রঃ নং",
  hDt: "তারিখ",
  hPr: "প্রদানকারী",
  hSt: "সাইট",
  hDp: "জমা",
  hEx: "খরচ",
  hBl: "উদ্বৃত্ত",
  loading: "লোড হচ্ছে...",
  noData: "কোনো রেকর্ড পাওয়া যায়নি"
};

export default function SummarySheet() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    dep: "0.00",
    exp: "0.00",
    due: "0.00",
    bal: "0.00"
  });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`${API_URL}/api/expenses`);
        const data = await response.json();

        if (response.ok) {
          setExpenses(data);

          const totalDeposit = data.reduce((sum, e) => sum + (Number(e.deposit) || 0), 0);
          const totalExpense = data.reduce((sum, e) => sum + (Number(e.totals?.grandTotalCash) || 0), 0);

          const totalRemainingDue = data.reduce((sum, e) => {
            const dueFromRows = e.rows?.reduce((acc, row) => {
              const amt = parseFloat(row.amt) || 0;
              const cash = parseFloat(row.cash) || 0;
              return acc + (amt - cash);
            }, 0) || 0;

            const duePaid = Number(e.totals?.duePaid) || Number(e.lastRowCash) || 0;
            return sum + (dueFromRows - duePaid);
          }, 0);

          const totalBalance = data.reduce((sum, e) => sum + (Number(e.totals?.balance) || 0), 0);

          setSummary({
            dep: totalDeposit.toFixed(2),
            exp: totalExpense.toFixed(2),
            due: totalRemainingDue.toFixed(2),
            bal: totalBalance.toFixed(2)
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('bn-BD', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh' }}>
      <SummaryCards
        summary={summary}
        labels={{
          lDep: LABELS.lDep,
          lExp: LABELS.lExp,
          lDue: LABELS.lDue,
          lBal: LABELS.lBal
        }}
      />

      <FilterPanel
        labels={{
          sFrom: LABELS.sFrom,
          sTo: LABELS.sTo,
          sProv: LABELS.sProv,
          sSite: LABELS.sSite
        }}
      />

      <DataTable
        expenses={expenses}
        loading={loading}
        labels={LABELS}
        formatDate={formatDate}
        onDetailsClick={(exp) => {
          setSelectedExpense(exp);
          setShowPopup(true);
        }}
      />

      {showPopup && (
        <Popup
          expense={selectedExpense}
          onClose={() => {
            setShowPopup(false);
            setSelectedExpense(null);
          }}
        />
      )}
    </div>
  );
}