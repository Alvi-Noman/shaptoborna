import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { bn } from 'date-fns/locale';

interface Site { _id: string; name: string; }
interface User { _id: string; name: string; }

interface FilterPanelProps {
  labels: any;
  filters: { provider: string; site: string; fromDate: string; toDate: string; };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  sites: Site[];
  users: User[];
}

export default function FilterPanel({ labels, filters, setFilters, sites, users }: FilterPanelProps) {
  
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setFilters((prev: any) => ({
      ...prev,
      fromDate: start ? start.toISOString() : '',
      toDate: end ? end.toISOString() : ''
    }));
  };

  const clearFilters = () => {
    setFilters({ provider: '', site: '', fromDate: '', toDate: '' });
  };

  return (
    <>
      <style>{`
        .filter-panel {
          background: #ffffff; padding: 20px; border-bottom: 1px solid #ddd;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 20px;
        }
        .left-filters, .right-filters { display: flex; gap: 15px; align-items: flex-end; }
        .search-group { display: flex; flex-direction: column; gap: 6px; }
        .search-group label { font-weight: bold; font-size: 13px; color: #64748b; }
        
        /* Facebook Style Date Input */
        .custom-date-input {
          padding: 10px; border: 1px solid #bdc3c7; border-radius: 8px;
          font-size: 14px; min-width: 250px; cursor: pointer; background: white;
        }
        .search-group select {
          padding: 10px; border: 1px solid #bdc3c7; border-radius: 8px;
          font-size: 14px; min-width: 160px; outline: none;
        }
        .btn-reset {
          padding: 10px 20px; background: #f1f5f9; border: 1px solid #cbd5e1;
          border-radius: 8px; cursor: pointer; font-weight: 600; color: #475569;
        }
        .btn-reset:hover { background: #e2e8f0; }
      `}</style>

      <div className="filter-panel">
        <div className="left-filters">
          <div className="search-group">
            <label>{labels.sProv}</label>
            <select name="provider" value={filters.provider} onChange={handleDropdownChange}>
              <option value="">সকল প্রদানকারী</option>
              {users.map(u => <option key={u._id} value={u.name}>{u.name}</option>)}
            </select>
          </div>

          <div className="search-group">
            <label>{labels.sSite}</label>
            <select name="site" value={filters.site} onChange={handleDropdownChange}>
              <option value="">সকল সাইট</option>
              {sites.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="right-filters">
          <div className="search-group">
            <label>তারিখের পরিসর (শুরু - শেষ)</label>
            <DatePicker
              selectsRange={true}
              startDate={filters.fromDate ? new Date(filters.fromDate) : null}
              endDate={filters.toDate ? new Date(filters.toDate) : null}
              onChange={handleDateChange}
              isClearable={true}
              locale={bn}
              dateFormat="dd/MM/yyyy"
              placeholderText="তারিখ নির্বাচন করুন"
              className="custom-date-input"
            />
          </div>
          <button className="btn-reset" onClick={clearFilters}>রিসেট</button>
        </div>
      </div>
    </>
  );
}