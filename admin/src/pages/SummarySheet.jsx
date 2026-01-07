import React, { useState, useEffect, useMemo } from 'react';
import SummaryCards from '../components/SummaryCards';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import Popup from '../components/Popup';

const LABELS = {
  lDep: "সর্বমোট জমা", lExp: "সর্বমোট খরচ", lDue: "সর্বমোট বকেয়া", lBal: "সর্বমোট উদ্বৃত্ত",
  sFrom: "তারিখ (হতে)", sTo: "তারিখ (পর্যন্ত)", sProv: "প্রদানকারী", sSite: "সাইট",
  hSl: "ক্রঃ নং", 
  hDt: "খরচের তারিখ", // এখানে 'তারিখ' থেকে 'খরচের তারিখ' করা হয়েছে
  hPr: "প্রদানকারী", hSt: "সাইট", hDp: "জমা",
  hEx: "খরচ", hBl: "উদ্বৃত্ত", loading: "লোড হচ্ছে...", noData: "কোনো রেকর্ড পাওয়া যায়নি"
};

export default function SummarySheet() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ dep: "0.00", exp: "0.00", due: "0.00", bal: "0.00" });
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ provider: '', site: '', fromDate: '', toDate: '' });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [expRes, siteRes, userRes] = await Promise.all([
          fetch(`${API_URL}/api/expenses`),
          fetch(`${API_URL}/api/sites`, { headers }),
          fetch(`${API_URL}/api/teammates`, { headers })
        ]);

        if (expRes.ok) setExpenses(await expRes.json());
        if (siteRes.ok) setSites(await siteRes.json());
        if (userRes.ok) setUsers(await userRes.json());
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL, token]);

  // Optimized Filter Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchProv = !filters.provider || exp.userId?.name === filters.provider;
      const matchSite = !filters.site || exp.siteName === filters.site;
      
      const expDate = new Date(exp.date).setHours(0,0,0,0);
      const start = filters.fromDate ? new Date(filters.fromDate).setHours(0,0,0,0) : null;
      const end = filters.toDate ? new Date(filters.toDate).setHours(0,0,0,0) : null;

      let matchDate = true;
      if (start && end) {
        // Between two dates
        matchDate = expDate >= start && expDate <= end;
      } else if (start) {
        // Exactly one date
        matchDate = expDate === start;
      }

      return matchProv && matchSite && matchDate;
    });
  }, [expenses, filters]);

  // Recalculate summary automatically when filtered list changes
  useEffect(() => {
    const totals = filteredExpenses.reduce((acc, e) => {
      acc.dep += (Number(e.deposit) || 0);
      acc.exp += (Number(e.totals?.grandTotalCash) || 0);
      
      const dueFromRows = e.rows?.reduce((sum, row) => sum + ((parseFloat(row.amt) || 0) - (parseFloat(row.cash) || 0)), 0) || 0;
      const duePaid = Number(e.totals?.duePaid) || Number(e.lastRowCash) || 0;
      acc.due += (dueFromRows - duePaid);
      
      acc.bal += (Number(e.totals?.balance) || 0);
      return acc;
    }, { dep: 0, exp: 0, due: 0, bal: 0 });

    setSummary({
      dep: totals.dep.toFixed(2),
      exp: totals.exp.toFixed(2),
      due: totals.due.toFixed(2),
      bal: totals.bal.toFixed(2)
    });
  }, [filteredExpenses]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('bn-BD', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh' }}>
      <SummaryCards summary={summary} labels={LABELS} />

      <FilterPanel 
        labels={LABELS} 
        filters={filters} 
        setFilters={setFilters}
        sites={sites}
        users={users}
      />

      <DataTable
        expenses={filteredExpenses}
        loading={loading}
        labels={LABELS}
        formatDate={formatDate}
        onDetailsClick={(exp) => {
          setSelectedExpense(exp);
          setShowPopup(true);
        }}
      />

      {showPopup && (
        <Popup expense={selectedExpense} onClose={() => { setShowPopup(false); setSelectedExpense(null); }} />
      )}
    </div>
  );
}