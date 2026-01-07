// frontend/src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { label: 'ড্যাশবোর্ড', path: '/dashboard' },
    { label: 'টিমমেট', path: '/teammates' },
    { label: 'সাইট', path: '/site' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    
    // এই লাইনটা অবশ্যই যোগ করুন — App.jsx কে জানাবে যে লগআউট হয়েছে
    window.dispatchEvent(new Event('logout'));
    
    navigate('/login');
  };

  return (
    <>
      <style>{`
        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #2c3e50, #1a2533);
          color: white;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          padding: 30px 20px;
          box-shadow: 5px 0 15px rgba(0,0,0,0.2);
          z-index: 1000;
        }

        .logo {
          text-align: center;
          margin-bottom: 50px;
          font-size: 28px;
          font-weight: 800;
          color: #3498db;
        }

        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-item {
          margin-bottom: 8px;
        }

        .nav-link {
          display: block;
          padding: 14px 20px;
          color: #ecf0f1;
          text-decoration: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          background: #3498db;
          color: white;
          transform: translateX(8px);
        }

        .nav-link.active {
          background: #3498db;
          color: white;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
        }

        .logout-btn {
          display: block;
          width: 100%;
          padding: 14px 20px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          margin-top: 30px;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: #c0392b;
          transform: translateX(8px);
        }

        @media (max-width: 992px) {
          .sidebar { 
            width: 80px; 
            padding: 20px 10px; 
          }
          .logo, .nav-link span, .logout-btn span { 
            display: none; 
          }
          .nav-link { 
            text-align: center; 
            padding: 16px; 
          }
          .logout-btn {
            padding: 16px;
            margin-top: 20px;
          }
        }
      `}</style>

      <aside className="sidebar">
        <div className="logo">সপ্তবর্ণা</div>
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* লগআউট বাটন */}
        <button onClick={handleLogout} className="logout-btn">
          <span>লগআউট</span>
        </button>
      </aside>
    </>
  );
}