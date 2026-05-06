import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Transactions from './pages/Transactions';
import Sales from './pages/Sales';
import Marketing from './pages/Marketing';
import Financials from './pages/Financials';
import Staff from './pages/Staff';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useData } from './context/DataContext';
import { supabase } from './supabaseClient';

function DateFilter() {
  const { globalFilter, setGlobalFilter } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState('month');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('1');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    if (globalFilter === 'all') {
      setFilterType('all');
    } else {
      const [type, val] = globalFilter.split(':');
      setFilterType(type);
      if (type === 'day') {
        const [d, m, y] = val.split('/');
        setSelectedDay(`${y}-${m}-${d}`);
      } else if (type === 'month') {
        const [m, y] = val.split('/');
        setSelectedMonth(`${y}-${m}`);
      } else if (type === 'quarter') {
        setSelectedQuarter(val.charAt(1));
        setSelectedYear(val.split('/')[1]);
      } else if (type === 'year') {
        setSelectedYear(val);
      }
    }
  }, [globalFilter]);

  const applyFilter = () => {
    if (filterType === 'all') {
      setGlobalFilter('all');
    } else if (filterType === 'day') {
      if (!selectedDay) return;
      const [y, m, d] = selectedDay.split('-');
      setGlobalFilter(`day:${d}/${m}/${y}`);
    } else if (filterType === 'month') {
      if (!selectedMonth) return;
      const [y, m] = selectedMonth.split('-');
      setGlobalFilter(`month:${m}/${y}`);
    } else if (filterType === 'quarter') {
      if (!selectedYear) return;
      setGlobalFilter(`quarter:Q${selectedQuarter}/${selectedYear}`);
    } else if (filterType === 'year') {
      if (!selectedYear) return;
      setGlobalFilter(`year:${selectedYear}`);
    }
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (globalFilter === 'all') return 'Tất cả thời gian';
    const [type, val] = globalFilter.split(':');
    if (type === 'day') return `Ngày ${val}`;
    if (type === 'month') return `Tháng ${val}`;
    if (type === 'quarter') return `Quý ${val.replace('Q', '')}`;
    if (type === 'year') return `Năm ${val}`;
    return 'Lọc thời gian';
  };

  return (
    <div className="date-filter-container" style={{ position: 'relative', marginLeft: '20px' }}>
      <button className="global-filter-select" onClick={() => setIsOpen(!isOpen)} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
        📅 {getDisplayText()}
      </button>

      {isOpen && (
        <div className="date-filter-popover" style={{ position: 'absolute', top: '40px', left: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', width: '250px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Loại bộ lọc</label>
            <select className="input-field" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: '100%' }}>
              <option value="all">Tất cả thời gian</option>
              <option value="day">Theo Ngày</option>
              <option value="month">Theo Tháng</option>
              <option value="quarter">Theo Quý</option>
              <option value="year">Theo Năm</option>
            </select>
          </div>

          {filterType === 'day' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Chọn ngày</label>
              <input type="date" className="input-field" value={selectedDay} onChange={e => setSelectedDay(e.target.value)} style={{ width: '100%' }} />
            </div>
          )}

          {filterType === 'month' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Chọn tháng</label>
              <input type="month" className="input-field" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: '100%' }} />
            </div>
          )}

          {filterType === 'quarter' && (
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Quý</label>
                <select className="input-field" value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)} style={{ width: '100%' }}>
                  <option value="1">Q1</option>
                  <option value="2">Q2</option>
                  <option value="3">Q3</option>
                  <option value="4">Q4</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Năm</label>
                <input type="number" className="input-field" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>
          )}

          {filterType === 'year' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Nhập năm</label>
              <input type="number" className="input-field" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ width: '100%' }} />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setIsOpen(false)} className="btn-cancel" style={{ padding: '6px 12px', fontSize: '12px', minWidth: 'auto' }}>Đóng</button>
            <button onClick={applyFilter} className="btn-submit" style={{ padding: '6px 12px', fontSize: '12px', minWidth: 'auto' }}>Áp dụng</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TopBar({ session }) {
  const location = useLocation();
  const { currentUser } = useData();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Get current date string like "03/05/2026 - 09:08"
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const role = currentUser?.role || 'Admin';

  const tabConfig = [
    { path: '/', label: 'TỔNG QUAN', roles: ['Admin', 'BOD', 'Sales', 'Marketing', 'Kế toán', 'HR'] },
    { path: '/financials', label: 'TÀI CHÍNH', roles: ['Admin', 'BOD', 'Kế toán'] },
    { path: '/sales', label: 'SALES TEAM', roles: ['Admin', 'BOD', 'Sales', 'Marketing'] },
    { path: '/transactions', label: 'GIAO DỊCH', roles: ['Admin', 'BOD', 'Sales', 'Kế toán'] },
    { path: '/marketing', label: 'MARKETING', roles: ['Admin', 'BOD', 'Marketing'] },
    { path: '/leads', label: 'CRM LEADS', roles: ['Admin', 'BOD', 'Sales', 'Marketing'] },
    { path: '/staff', label: 'NHÂN SỰ', roles: ['Admin', 'BOD', 'HR'] },
    { path: '/logs', label: 'LỊCH SỬ', roles: ['Admin', 'BOD'] },
    { path: '/settings', label: 'CÀI ĐẶT', roles: ['Admin', 'BOD'] },
  ];

  return (
    <div className="topbar">
      <div className="topbar-header">
        <div className="topbar-left">
          <div className="brand-logo">B</div>
          <div className="brand-name">
            <span style={{ color: 'white' }}>Blanca BĐS</span> <span style={{ color: '#ccff00' }}>{role}</span>
          </div>
          <DateFilter />
        </div>
        <div className="topbar-right">
          <div className="live-badge">
            <span className="live-dot"></span> Live
          </div>
          <div className="time-display">{dateStr}</div>
          <button onClick={handleLogout} style={{ marginLeft: '15px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Đăng xuất
          </button>
        </div>
      </div>
      <div className="nav-tabs">
        {tabConfig.filter(tab => tab.roles.includes(role)).map(tab => (
          <NavLink key={tab.path} to={tab.path} className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`} end={tab.path === '/'}>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, loadingData } = useData();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading...</div>;
  }

  if (!session) {
    return <Login />;
  }

  const role = currentUser?.role || 'Admin';

  const checkAccess = (allowedRoles) => {
    return allowedRoles.includes(role);
  };

  return (
    <div className="app-container">
      <TopBar session={session} />
      <div className="main-content">
        {loadingData ? (
           <div style={{ padding: '20px', color: 'var(--text-primary)' }}>Đang tải dữ liệu...</div>
        ) : (
          <Routes>
            <Route path="/" element={checkAccess(['Admin', 'BOD', 'Sales', 'Marketing', 'Kế toán', 'HR']) ? <Dashboard /> : <div style={{padding: '20px'}}>Bạn không có quyền truy cập trang này.</div>} />
            <Route path="/leads" element={checkAccess(['Admin', 'BOD', 'Sales', 'Marketing']) ? <Leads /> : <div style={{padding: '20px'}}>Bạn không có quyền truy cập trang này.</div>} />
            <Route path="/transactions" element={checkAccess(['Admin', 'BOD', 'Sales', 'Kế toán']) ? <Transactions /> : <div style={{padding: '20px'}}>Bạn không có quyền truy cập trang này.</div>} />
            <Route path="/sales" element={checkAccess(['Admin', 'BOD', 'Sales', 'Marketing']) ? <Sales /> : <div style={{padding: '20px'}}>Bạn không có quyền truy cập trang này.</div>} />
            <Route path="/marketing" element={checkAccess(['Admin', 'BOD', 'Marketing']) ? <Marketing /> : <div style={{padding: '20px'}}>Bạn không có quyền truy cập trang này.</div>} />
            <Route path="/financials" element={checkAccess(['Admin', 'BOD', 'Kế toán']) ? <Financials /> : <div style={{padding: '20px'}}>Bạn không có quyền truy cập trang này.</div>} />
            <Route path="/staff" element={checkAccess(['Admin', 'BOD', 'HR']) ? <Staff /> : <div style={{padding: '20px'}}>Bạn không có quyền truy cập trang này.</div>} />
            <Route path="/logs" element={checkAccess(['Admin', 'BOD']) ? <Logs /> : <div style={{padding: '20px'}}>Bạn không có quyền truy cập trang này.</div>} />
            <Route path="/settings" element={checkAccess(['Admin', 'BOD']) ? <Settings /> : <div style={{padding: '20px'}}>Bạn không có quyền truy cập trang này.</div>} />
          </Routes>
        )}
      </div>
    </div>
  );
}

export default App;
