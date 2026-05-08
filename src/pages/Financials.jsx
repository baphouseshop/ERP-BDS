import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label || payload[0].name}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ margin: 0, color: p.color || p.fill }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const renderProgressBar = (item, color, icon, calcTotal, calcKH) => {
  const actual = calcTotal(item);
  const target = calcKH(item);
  let pct = target > 0 ? (actual / target) * 100 : 0;
  const isExceeded = pct > 100;
  
  // For costs, exceeding 100% is bad, but for revenue it's good.
  const isCost = item['Loại'] === 'Chi phí' || item['Loại'] === 'Expense';
  const displayColor = isExceeded && isCost ? 'var(--danger)' : color;
  
  // Cap visual bar at 100%
  const barWidth = Math.min(pct, 100);

  return (
    <div className="fin-progress-item" key={item['Hạng mục']}>
      <div className="fin-progress-header">
        <div className="fin-progress-title">
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{item['Hạng mục']}</span>
            <span className="fin-progress-subtitle">{item['Ghi chú']} · Duyệt: {item['Người duyệt']}</span>
          </div>
        </div>
        <div className="fin-progress-stats">
          <span className="fin-progress-kh">KH: {target} tỷ</span>
          <span className="fin-progress-val" style={{ color: displayColor }}>{actual} tỷ</span>
          <span className="fin-progress-pct" style={{ color: displayColor, backgroundColor: displayColor + '33' }}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="fin-progress-bar-bg">
        <div 
          className="fin-progress-bar-fill" 
          style={{ width: `${barWidth}%`, backgroundColor: displayColor }}
        />
      </div>
    </div>
  );
};

function Financials() {
  const { financials, transactions, marketing, staff, addFinancial, editFinancial, deleteFinancial } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'Tháng', direction: 'desc' });
  const [formData, setFormData] = useState({
    'Tháng': new Date().toISOString().slice(0, 7),
    'Hạng mục': '',
    'Loại': 'Income',
    'Thực tế (tỷ)': '',
    'KH (tỷ)': '',
    'Ghi chú': '',
    'Người duyệt': '',
    '_approver_id': '',
    '_id': ''
  });

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormData({
      'Tháng': new Date().toISOString().slice(0, 7),
      'Hạng mục': '',
      'Loại': 'Income',
      'Thực tế (tỷ)': '',
      'KH (tỷ)': '',
      'Ghi chú': '',
      'Người duyệt': '',
      '_approver_id': ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (f) => {
    setIsEditMode(true);
    setFormData({
      'Tháng': f['Tháng'] || '',
      'Hạng mục': f['Hạng mục'] || '',
      'Loại': f['Loại'] || 'Income',
      'Thực tế (tỷ)': f['Thực tế (tỷ)'] || '',
      'KH (tỷ)': f['KH (tỷ)'] || '',
      'Ghi chú': f['Ghi chú'] || '',
      'Người duyệt': f['Người duyệt'] || '',
      '_approver_id': f['_approver_id'] || '',
      '_id': f['_id'] || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const actual = Number(formData['Thực tế (tỷ)']);
    const target = Number(formData['KH (tỷ)']);
    const pct = target > 0 ? (actual / target) * 100 : 0;
    
    const payload = {
      ...formData,
      '% Hoàn thành': pct,
      'Chênh lệch': actual - target
    };

    if (isEditMode) {
      editFinancial(payload);
    } else {
      addFinancial(payload);
    }
    setIsModalOpen(false);
  };

  const handleStaffChange = (e) => {
    const maNV = e.target.value;
    const selectedStaff = staff.find(s => s['Mã NV'] === maNV);
    if (selectedStaff) {
      setFormData({ ...formData, '_approver_id': maNV, 'Người duyệt': selectedStaff['Tên NV'] });
    } else {
      setFormData({ ...formData, '_approver_id': '', 'Người duyệt': '' });
    }
  };

  // --- DATA EXTRACTION ---
  // Map: accept both English (Supabase) and Vietnamese (local/db.json) category names
  const categoryAliases = {
    'Doanh thu thực thu': ['Revenue', 'Doanh thu thực thu', 'Doanh thu HĐMB'],
    'Chi phí vận hành': ['General Ops', 'Chi phí vận hành'],
    'Chi phí Marketing': ['Marketing', 'Chi phí Marketing'],
    'Quỹ lương & Hoa hồng': ['Salaries', 'Quỹ lương & Hoa hồng']
  };

  const sumFin = (name, key) => {
    const aliases = categoryAliases[name] || [name];
    return financials
      .filter(f => aliases.includes(f['Hạng mục']))
      .reduce((sum, f) => sum + Number(f[key] || 0), 0);
  };

  const doanhThuT = sumFin('Doanh thu thực thu', 'Thực tế (tỷ)');
  const doanhThuKH = sumFin('Doanh thu thực thu', 'KH (tỷ)');
  
  const chiPhiVHT = sumFin('Chi phí vận hành', 'Thực tế (tỷ)');
  const chiPhiVHKH = sumFin('Chi phí vận hành', 'KH (tỷ)');
  
  const chiPhiMktT = sumFin('Chi phí Marketing', 'Thực tế (tỷ)');
  const chiPhiMktKH = sumFin('Chi phí Marketing', 'KH (tỷ)');
  
  const luongHHT = sumFin('Quỹ lương & Hoa hồng', 'Thực tế (tỷ)');
  const luongHHKH = sumFin('Quỹ lương & Hoa hồng', 'KH (tỷ)');

  const sumChiPhi = chiPhiVHT + chiPhiMktT + luongHHT;
  const sumChiPhiKH = chiPhiVHKH + chiPhiMktKH + luongHHKH;

  const loiNhuanT = doanhThuT - sumChiPhi;
  const loiNhuanKH = doanhThuKH - sumChiPhiKH;

  // Mock object constructor for rendering Progress Bars
  const createFinObj = (name, actual, target, type) => ({
    'Hạng mục': name, 'Thực tế (tỷ)': actual, 'KH (tỷ)': target, 'Loại': type, 'Ghi chú': '', 'Người duyệt': '-'
  });

  const doanhThuObj = createFinObj('Doanh thu thực thu', doanhThuT.toFixed(2), doanhThuKH.toFixed(2), 'Income');
  const chiPhiVHObj = createFinObj('Chi phí vận hành', chiPhiVHT.toFixed(2), chiPhiVHKH.toFixed(2), 'Expense');
  const chiPhiMktObj = createFinObj('Chi phí Marketing', chiPhiMktT.toFixed(2), chiPhiMktKH.toFixed(2), 'Expense');
  const luongHHObj = createFinObj('Quỹ lương & Hoa hồng', luongHHT.toFixed(2), luongHHKH.toFixed(2), 'Expense');
  const loiNhuanObj = createFinObj('Lợi nhuận gộp', loiNhuanT.toFixed(2), loiNhuanKH.toFixed(2), 'Income');

  const calcTotal = (item) => Number(item['Thực tế (tỷ)'] || 0);
  const calcKH = (item) => Number(item['KH (tỷ)'] || 1); // fallback 1 to avoid div by 0

  // --- CHART DATA ---
  const actualVsPlanData = [
    { name: 'Doanh thu thực thu', 'Thực tế (tỷ)': doanhThuT.toFixed(2), 'KH (tỷ)': doanhThuKH.toFixed(2) },
    { name: 'Chi phí vận hành', 'Thực tế (tỷ)': chiPhiVHT.toFixed(2), 'KH (tỷ)': chiPhiVHKH.toFixed(2) },
    { name: 'Chi phí Marketing', 'Thực tế (tỷ)': chiPhiMktT.toFixed(2), 'KH (tỷ)': chiPhiMktKH.toFixed(2) },
    { name: 'Quỹ lương & Hoa hồng', 'Thực tế (tỷ)': luongHHT.toFixed(2), 'KH (tỷ)': luongHHKH.toFixed(2) },
    { name: 'Lợi nhuận gộp', 'Thực tế (tỷ)': loiNhuanT.toFixed(2), 'KH (tỷ)': loiNhuanKH.toFixed(2) },
  ];

  const costStructureData = [
    { name: 'Chi phí vận hành', value: Number(chiPhiVHT.toFixed(2)) },
    { name: 'Chi phí Marketing', value: Number(chiPhiMktT.toFixed(2)) },
    { name: 'Quỹ lương & Hoa hồng', value: Number(luongHHT.toFixed(2)) }
  ];
  const COST_COLORS = ['#ff4d94', '#4da6ff', '#ffcc00'];

  // --- LINKED DATA CALCULATION ---
  // Transactions -> Commissions
  const sumHH = transactions.reduce((sum, t) => sum + Number(t['Hoa hồng'] || 0), 0);
  
  // Marketing -> ROI
  const evaluateROI = (rate) => {
    if(rate >= 0.1) return { text: 'Xuất sắc', color: 'var(--accent)' };
    if(rate >= 0.05) return { text: 'Tốt', color: 'var(--success)' };
    if(rate >= 0.02) return { text: 'Trung bình', color: 'var(--warning)' };
    return <div style={{ color: 'var(--text-muted)' }}>-</div>;
  };


  const uniqueCategories = [...new Set(financials.map(f => f['Hạng mục']).filter(Boolean))];

  const filteredFinancials = financials.filter(f => {
    const text = searchText.toLowerCase().trim();
    if (text && !(
      String(f['Hạng mục'] || '').toLowerCase().includes(text) ||
      String(f['Ghi chú'] || '').toLowerCase().includes(text) ||
      String(f['Người duyệt'] || '').toLowerCase().includes(text)
    )) return false;
    if (filterType && f['Loại'] !== filterType) return false;
    if (filterCategory && f['Hạng mục'] !== filterCategory) return false;
    return true;
  }).sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === 'Tháng') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    } else {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const clearFilters = () => { setSearchText(''); setFilterType(''); setFilterCategory(''); };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFinancials = filteredFinancials.slice(indexOfFirstItem, indexOfLastItem);
  const totalPagesCount = Math.ceil(filteredFinancials.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Tài chính</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            className="filter-select" 
            style={{ width: '180px' }}
            value={`${sortConfig.key}-${sortConfig.direction}`} 
            onChange={e => {
              const [key, dir] = e.target.value.split('-');
              setSortConfig({ key, direction: dir });
            }}
          >
            <option value="Tháng-desc">Mới nhất lên đầu</option>
            <option value="Tháng-asc">Cũ nhất lên đầu</option>
            <option value="Hạng mục-asc">Hạng mục (A-Z)</option>
            <option value="Hạng mục-desc">Hạng mục (Z-A)</option>
          </select>
          <button onClick={handleOpenAddModal} className="btn-submit">Thêm Bản ghi</button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card card-revenue">
          <div className="dash-kpi-title">DOANH THU THỰC THU</div>
          <div className="dash-kpi-value">{doanhThuT.toFixed(2)}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">KH: {doanhThuKH.toFixed(2)} tỷ · {doanhThuKH ? ((doanhThuT/doanhThuKH)*100).toFixed(0) : 0}%</div>
        </div>
        
        <div className="dash-kpi-card" style={{ borderTopColor: '#ff4d94' }}>
          <div className="dash-kpi-title">CHI PHÍ VẬN HÀNH</div>
          <div className="dash-kpi-value" style={{ color: '#ff4d94' }}>{chiPhiVHT.toFixed(2)}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">KH: {chiPhiVHKH.toFixed(2)} tỷ · {chiPhiVHKH ? ((chiPhiVHT/chiPhiVHKH)*100).toFixed(0) : 0}%</div>
        </div>

        <div className="dash-kpi-card" style={{ borderTopColor: '#4da6ff' }}>
          <div className="dash-kpi-title">CHI PHÍ MARKETING</div>
          <div className="dash-kpi-value" style={{ color: '#4da6ff' }}>{chiPhiMktT.toFixed(2)}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">KH: {chiPhiMktKH.toFixed(2)} tỷ · {chiPhiMktKH ? ((chiPhiMktT/chiPhiMktKH)*100).toFixed(0) : 0}%</div>
        </div>

        <div className="dash-kpi-card" style={{ borderTopColor: '#ffcc00' }}>
          <div className="dash-kpi-title">QUỸ LƯƠNG & HOA HỒNG</div>
          <div className="dash-kpi-value" style={{ color: '#ffcc00' }}>{luongHHT.toFixed(2)}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">KH: {luongHHKH.toFixed(2)} tỷ · {luongHHKH ? ((luongHHT/luongHHKH)*100).toFixed(0) : 0}%</div>
        </div>

        <div className="dash-kpi-card card-profit">
          <div className="dash-kpi-title">LỢI NHUẬN GỘP</div>
          <div className="dash-kpi-value">{loiNhuanT.toFixed(2)}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">KH: {loiNhuanKH.toFixed(2)} tỷ · {loiNhuanKH ? ((loiNhuanT/loiNhuanKH)*100).toFixed(0) : 0}%</div>
        </div>

        <div className="dash-kpi-card" style={{ borderTopColor: '#b366ff' }}>
          <div className="dash-kpi-title">TỔNG CHI PHÍ</div>
          <div className="dash-kpi-value" style={{ color: '#b366ff' }}>{sumChiPhi.toFixed(2)}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">VH + MKT + Lương & HH</div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="fin-charts-grid">
        <div className="dash-chart-card">
          <div className="dash-chart-title">Thực tế vs Kế hoạch</div>
          <div className="dash-chart-subtitle">Đơn vị: Tỷ VNĐ</div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actualVsPlanData} margin={{ top: 20, right: 30, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                <XAxis dataKey="name" stroke="#8b92a5" fontSize={10} tickLine={false} axisLine={false} angle={-15} textAnchor="end" />
                <YAxis stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#252932' }} content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} verticalAlign="top" />
                <Bar dataKey="Thực tế (tỷ)" fill="#ccff00" radius={[2, 2, 0, 0]} />
                <Bar dataKey="KH (tỷ)" fill="#5c677d" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Cơ cấu chi phí</div>
          <div className="dash-chart-subtitle">Tổng: {sumChiPhi.toFixed(2)} tỷ</div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costStructureData} cx="40%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                  {costStructureData.map((entry, index) => <Cell key={`cell-${index}`} fill={COST_COLORS[index % COST_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DETAILED LIST & MANAGEMENT */}
      <div className="fin-details-section">
        <div className="dash-chart-title" style={{ marginBottom: '5px' }}>Quản lý chi tiết hạng mục</div>
        
        {/* FILTER BAR */}
        <div className="filter-bar" style={{ marginTop: '15px', marginBottom: '15px' }}>
          <input 
            className="filter-input" 
            placeholder="🔍 Tìm hạng mục, ghi chú, người duyệt..." 
            value={searchText} 
            onChange={e => setSearchText(e.target.value)} 
          />
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">-- Tất cả loại --</option>
            <option value="Income">Thu nhập (Income)</option>
            <option value="Expense">Chi phí (Expense)</option>
          </select>
          <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">-- Tất cả hạng mục --</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(searchText || filterType || filterCategory) && <button className="btn-clear-filter" onClick={clearFilters}>✕ Xóa lọc</button>}
          <span className="filter-count">Hiển thị <strong>{filteredFinancials.length}</strong>/{financials.length}</span>
        </div>

        <div className="table-container" style={{ marginTop: '10px' }}>
          <table>
            <thead>
              <tr>
                <th>Thao tác</th>
                <th>Tháng</th>
                <th>Hạng mục</th>
                <th>Loại</th>
                <th>Thực tế (tỷ)</th>
                <th>KH (tỷ)</th>
                <th>Hoàn thành</th>
                <th>Duyệt bởi</th>
              </tr>
            </thead>
            <tbody>
              {currentFinancials.map((f, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleOpenEditModal(f)} className="btn-edit">Sửa</button>
                      <button 
                        onClick={() => {
                          if(window.confirm(`Xóa bản ghi ${f['Hạng mục']}?`)) {
                            deleteFinancial(f['_id']);
                          }
                        }} 
                        className="btn-cancel" 
                        style={{ padding: '2px 8px', fontSize: '12px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                      >Xóa</button>
                    </div>
                  </td>
                  <td>{f['Tháng']}</td>
                  <td style={{ fontWeight: 'bold' }}>{f['Hạng mục']}</td>
                  <td>{f['Loại']}</td>
                  <td style={{ color: f['Loại'] === 'Income' ? 'var(--accent)' : 'var(--danger)', fontWeight: 'bold' }}>{f['Thực tế (tỷ)']} tỷ</td>
                  <td>{f['KH (tỷ)']} tỷ</td>
                  <td>{f['% Hoàn thành'] ? Number(f['% Hoàn thành']).toFixed(0) : 0}%</td>
                  <td>{f['Người duyệt']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPagesCount > 1 && (
          <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', marginBottom: '40px' }}>
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              Trải
            </button>
            
            {[...Array(totalPagesCount)].map((_, idx) => {
              const pageNum = idx + 1;
              if (totalPagesCount > 7) {
                if (pageNum !== 1 && pageNum !== totalPagesCount && (pageNum < currentPage - 1 || pageNum > currentPage + 1)) {
                  if (pageNum === 2 && currentPage > 3) return <span key="dots1" style={{ color: 'var(--text-muted)' }}>...</span>;
                  if (pageNum === totalPagesCount - 1 && currentPage < totalPagesCount - 2) return <span key="dots2" style={{ color: 'var(--text-muted)' }}>...</span>;
                  return null;
                }
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: currentPage === pageNum ? 'var(--accent)' : 'var(--border-color)',
                    background: currentPage === pageNum ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: currentPage === pageNum ? '#000' : 'var(--text-main)',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPagesCount}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: currentPage === totalPagesCount ? 'not-allowed' : 'pointer', opacity: currentPage === totalPagesCount ? 0.5 : 1 }}
            >
              Phải
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{isEditMode ? 'Chỉnh sửa Bản ghi' : 'Thêm Bản ghi Tài chính'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tháng (YYYY-MM)</label>
                  <input required disabled={isEditMode} type="month" className="input-field" value={formData['Tháng']} onChange={e => setFormData({...formData, 'Tháng': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Hạng mục</label>
                  <input required disabled={isEditMode} className="input-field" value={formData['Hạng mục']} onChange={e => setFormData({...formData, 'Hạng mục': e.target.value})} placeholder="VD: Chi phí Marketing" />
                </div>
                <div className="form-group">
                  <label>Loại</label>
                  <select className="input-field" value={formData['Loại']} onChange={e => setFormData({...formData, 'Loại': e.target.value})}>
                    <option value="Income">Thu nhập (Income)</option>
                    <option value="Expense">Chi phí (Expense)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Thực tế (Tỷ VNĐ)</label>
                  <input required type="number" step="0.01" className="input-field" value={formData['Thực tế (tỷ)']} onChange={e => setFormData({...formData, 'Thực tế (tỷ)': e.target.value})} placeholder="1.5" />
                </div>
                <div className="form-group">
                  <label>Kế hoạch (Tỷ VNĐ)</label>
                  <input required type="number" step="0.01" className="input-field" value={formData['KH (tỷ)']} onChange={e => setFormData({...formData, 'KH (tỷ)': e.target.value})} placeholder="2.0" />
                </div>
                <div className="form-group">
                  <label>Người duyệt (Nhân viên)</label>
                  <select className="input-field" value={formData['_approver_id']} onChange={handleStaffChange}>
                    <option value="">-- Chọn nhân viên --</option>
                    {staff.map((s, idx) => (
                      <option key={idx} value={s['Mã NV']}>{s['Mã NV']} - {s['Tên NV']}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Ghi chú</label>
                  <input className="input-field" value={formData['Ghi chú']} onChange={e => setFormData({...formData, 'Ghi chú': e.target.value})} placeholder="Ghi chú thêm..." />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-submit">Lưu Bản ghi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financials;
