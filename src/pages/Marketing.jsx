import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useData } from '../context/DataContext';

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

function Marketing() {
  const { 
    marketing, marketingTotal, marketingPage, setMarketingPage, 
    marketingSearch, setMarketingSearch, marketingSort, setMarketingSort,
    itemsPerPage, addMarketing, editMarketing, deleteMarketing 
  } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Debounced Search Logic
  const [localSearch, setLocalSearch] = useState(marketingSearch);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== marketingSearch) {
        setMarketingSearch(localSearch);
        setMarketingPage(1);
      }
    }, 500); // 500ms delay
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Sync local search when global search is cleared
  useEffect(() => {
    setLocalSearch(marketingSearch);
  }, [marketingSearch]);
  const [filterChannel, setFilterChannel] = useState('');

  const [formData, setFormData] = useState({
    'Tháng': new Date().toISOString().slice(0, 7), // YYYY-MM
    'Tên chiến dịch': '',
    'Kênh': 'Facebook Ads',
    'CP (VNĐ)': '',
    'Lead': '',
    'Booking': '',
    'Click': '',
    'Ghi chú': '',
    '_id': ''
  });

  const handleNumberChange = (field, value) => {
    const rawValue = value.replace(/\D/g, '');
    setFormData(prev => ({...prev, [field]: rawValue}));
  };

  const displayNumber = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormData({
      'Tháng': new Date().toISOString().slice(0, 7),
      'Tên chiến dịch': '',
      'Kênh': 'Facebook Ads',
      'CP (VNĐ)': '',
      'Lead': '',
      'Booking': '',
      'Click': '',
      'Ghi chú': ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m) => {
    setIsEditMode(true);
    setFormData({
      'Tháng': m['Tháng'] || '',
      'Tên chiến dịch': m['Tên chiến dịch'] || '',
      'Kênh': m['Kênh'] || '',
      'CP (VNĐ)': (Number(m['CP (tr)'] || 0) * 1000000).toString(),
      'Lead': m['Lead'] || '',
      'Booking': m['Booking'] || '',
      'Click': m['Click'] || '',
      'Ghi chú': m['Ghi chú'] || '',
      '_id': m['_id'] || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const costVNĐ = Number(formData['CP (VNĐ)']);
    const costTr = costVNĐ / 1000000;
    const cpl = Number(formData['Lead']) > 0 ? costTr / Number(formData['Lead']) : 0;
    const cpBook = Number(formData['Booking']) > 0 ? costTr / Number(formData['Booking']) : 0;
    
    const payload = {
      ...formData,
      'CP (tr)': costTr,
      'CPL (tr)': isFinite(cpl) ? cpl : 0,
      'CP/Book (tr)': isFinite(cpBook) ? cpBook : 0
    };

    if (isEditMode) {
      // Assuming Tên chiến dịch is the unique ID here
      editMarketing(payload);
    } else {
      addMarketing(payload);
    }
    
    setIsModalOpen(false);
  };

  // --- KPI CALCULATIONS ---
  const totalCPRaw = marketing.reduce((sum, m) => sum + Number(m['CP (tr)'] || 0), 0);
  const totalCP = Number(totalCPRaw.toFixed(1)); // Fix precision issues
  const totalLead = marketing.reduce((sum, m) => sum + Number(m['Lead'] || 0), 0);
  const totalBooking = marketing.reduce((sum, m) => sum + Number(m['Booking'] || 0), 0);
  const avgCPL = totalLead > 0 ? (totalCP * 1000) / totalLead : 0; // in K
  const avgConv = totalLead > 0 ? (totalBooking / totalLead) * 100 : 0;

  // Aggregate by channel
  const channelData = {};
  marketing.forEach(m => {
    const k = m['Kênh'] || 'Khác';
    if (!channelData[k]) channelData[k] = { Lead: 0, Booking: 0, CP: 0, name: k };
    channelData[k].Lead += Number(m['Lead'] || 0);
    channelData[k].Booking += Number(m['Booking'] || 0);
    channelData[k].CP += Number(m['CP (tr)'] || 0);
  });

  const channels = Object.values(channelData);
  let bestChannel = null;
  let worstChannel = null;
  
  if (channels.length > 0) {
    // Sort by conversion rate
    channels.sort((a, b) => {
      const rateA = a.Lead > 0 ? a.Booking / a.Lead : 0;
      const rateB = b.Lead > 0 ? b.Booking / b.Lead : 0;
      return rateB - rateA;
    });
    bestChannel = channels[0];
    worstChannel = channels[channels.length - 1];
  }

  // --- CHART DATA ---
  const chart1Data = channels.map(c => ({
    name: c.name.replace('Sự kiện ', '').replace(' Ads', ''), // Shorten names for axis
    Lead: c.Lead,
    Booking: c.Booking
  }));

  const chart2Data = channels.map(c => ({
    name: c.name.replace('Sự kiện ', '').replace(' Ads', ''),
    'Tỷ lệ CĐ (%)': c.Lead > 0 ? Number(((c.Booking / c.Lead) * 100).toFixed(2)) : 0
  }));

  const COLORS = {
    'Facebook': '#4da6ff',
    'Google': '#00e5ff',
    'TikTok': '#ff4d94',
    'Offline': '#ccff00'
  };
  
  const getChannelColor = (name) => {
    for (let key in COLORS) {
      if (name.includes(key)) return COLORS[key];
    }
    return '#8884d8';
  };

  const evalColor = (rate) => {
    if (rate >= 10) return 'var(--success)';
    if (rate >= 5) return 'var(--cyan)';
    if (rate >= 2) return 'var(--warning)';
    return 'var(--danger)';
  };

  const clearFilters = () => { setMarketingSearch(''); setFilterChannel(''); };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Marketing</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            className="filter-select" 
            style={{ width: '180px' }}
            value={`${marketingSort.column}-${marketingSort.ascending ? 'asc' : 'desc'}`} 
            onChange={e => {
              const [col, dir] = e.target.value.split('-');
              setMarketingSort({ column: col, ascending: dir === 'asc' });
            }}
          >
            <option value="thang-desc">Mới nhất lên đầu</option>
            <option value="thang-asc">Cũ nhất lên đầu</option>
            <option value="ten_chien_dich-asc">Tên chiến dịch (A-Z)</option>
            <option value="ten_chien_dich-desc">Tên chiến dịch (Z-A)</option>
          </select>
          <button onClick={handleOpenAddModal} className="btn-submit">Thêm Chiến dịch</button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        <input 
          className="filter-input" 
          placeholder="🔍 Tìm tên chiến dịch, kênh, ghi chú..." 
          value={localSearch} 
          onChange={e => setLocalSearch(e.target.value)} 
        />
        {/* Optional: Filter by channel could be implemented server-side as well, but for now we focus on text search */}
        {marketingSearch && <button className="btn-clear-filter" onClick={clearFilters}>✕ Xóa lọc</button>}
        <span className="filter-count">Hiển thị trang <strong>{marketingPage}</strong> (Tổng <strong>{marketingTotal}</strong> bản ghi)</span>
      </div>

      {/* KPI GRID */}
      <div className="dash-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="dash-kpi-card" style={{ borderTopColor: 'var(--text-muted)' }}>
          <div className="dash-kpi-title">TỔNG CP MARKETING</div>
          <div className="dash-kpi-value" style={{ color: 'var(--warning)' }}>{totalCP}<span className="dash-kpi-unit">tr</span></div>
          <div className="dash-kpi-subtext">KH 500tr - Đạt {Math.round((totalCP/500)*100)}%</div>
        </div>
        
        <div className="dash-kpi-card" style={{ borderTopColor: 'var(--cyan)' }}>
          <div className="dash-kpi-title">TỔNG LEAD</div>
          <div className="dash-kpi-value" style={{ color: 'var(--cyan)' }}>{totalLead}</div>
          <div className="dash-kpi-subtext">{marketing.length} chiến dịch - {channels.length} kênh</div>
        </div>

        <div className="dash-kpi-card" style={{ borderTopColor: 'var(--cyan)' }}>
          <div className="dash-kpi-title">TỔNG BOOKING</div>
          <div className="dash-kpi-value" style={{ color: 'var(--cyan)' }}>{totalBooking}</div>
          <div className="dash-kpi-subtext">CĐ TB {avgConv.toFixed(1)}% - CPL TB {avgCPL.toFixed(0)}k</div>
        </div>

        <div className="dash-kpi-card" style={{ borderTopColor: 'var(--warning)' }}>
          <div className="dash-kpi-title">KÊNH TỐT NHẤT</div>
          <div className="dash-kpi-value" style={{ color: 'var(--warning)', fontSize: '20px', marginTop: '10px' }}>
            🎪 {bestChannel ? bestChannel.name : '-'}
          </div>
          <div className="dash-kpi-subtext">
            {bestChannel ? `CĐ ${((bestChannel.Booking/bestChannel.Lead)*100).toFixed(2)}% - ${bestChannel.Booking} booking` : ''}
          </div>
        </div>

        <div className="dash-kpi-card" style={{ borderTopColor: 'var(--danger)' }}>
          <div className="dash-kpi-title">CẦN CẢI THIỆN</div>
          <div className="dash-kpi-value" style={{ color: 'var(--danger)', fontSize: '20px', marginTop: '10px' }}>
            🎵 {worstChannel ? worstChannel.name : '-'}
          </div>
          <div className="dash-kpi-subtext">
            {worstChannel ? `CĐ ${((worstChannel.Booking/worstChannel.Lead)*100).toFixed(0)}% - Đề xuất cắt giảm` : ''}
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="mkt-charts-grid">
        <div className="dash-chart-card">
          <div className="dash-chart-title">Lead & Booking theo kênh (gộp)</div>
          <div className="dash-chart-subtitle">Tất cả chiến dịch</div>
          <div style={{ height: '250px', marginTop: '15px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart1Data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                <XAxis dataKey="name" stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#252932' }} content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} verticalAlign="top" />
                <Bar dataKey="Lead" fill="#4da6ff" radius={[2, 2, 0, 0]} barSize={30} />
                <Bar dataKey="Booking" fill="#00e5ff" radius={[2, 2, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Tỷ lệ chuyển đổi (%)</div>
          <div className="dash-chart-subtitle">Lead → Booking · theo kênh</div>
          <div style={{ height: '250px', marginTop: '15px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart2Data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                <XAxis dataKey="name" stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} tickFormatter={tick => `${tick}%`} />
                <Tooltip cursor={{ fill: '#252932' }} content={<CustomTooltip />} />
                <Bar dataKey="Tỷ lệ CĐ (%)" radius={[2, 2, 0, 0]} barSize={40}>
                  {chart2Data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getChannelColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CAMPAIGNS LIST */}
      <div className="section-title" style={{ marginTop: '30px' }}>▶ Chi tiết từng chiến dịch</div>
      <div>
        {marketing.map((m, index) => {
          const leads = Number(m['Lead'] || 0);
          const bookings = Number(m['Booking'] || 0);
          const cp = Number(m['CP (tr)'] || 0);
          const clicks = m['Click'] ? Number(m['Click']).toLocaleString('vi-VN') : '-';
          
          const rate = leads > 0 ? (bookings / leads) * 100 : 0;
          const badgeColor = evalColor(rate);
          const barColor = getChannelColor(m['Kênh']);
          
          // Using random target max CP just for visual bar scale (e.g. 200tr)
          const barWidth = Math.min((cp / 150) * 100, 100);

          return (
            <div className="mkt-campaign-card" key={index} style={{ borderLeft: `4px solid ${barColor}` }}>
              <div className="mkt-card-header">
                <div>
                  <div className="mkt-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', backgroundColor: barColor }}></div>
                    {m['Tên chiến dịch']}
                  </div>
                  <div className="mkt-card-subtitle">{m['Kênh']} · {m['Tháng'] || 'T4/2026'}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button onClick={() => handleOpenEditModal(m)} className="btn-edit" style={{ padding: '4px 12px' }}>Sửa</button>
                  <button 
                    onClick={() => {
                      if(window.confirm(`Xóa chiến dịch ${m['Tên chiến dịch']}?`)) {
                        deleteMarketing(m['_id']);
                      }
                    }} 
                    className="btn-cancel" 
                    style={{ padding: '4px 12px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                  >Xóa</button>
                  <div className="mkt-card-badge" style={{ color: badgeColor, border: `1px solid ${badgeColor}` }}>
                    CĐ {rate.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="mkt-card-body">
                <div className="mkt-stat-item">
                  <div className="mkt-stat-value" style={{ color: 'var(--warning)' }}>{cp}</div>
                  <div className="mkt-stat-label">CHI PHÍ (TR)</div>
                  <div className="mkt-progress-bg">
                    <div className="mkt-progress-fill" style={{ width: `${barWidth}%`, backgroundColor: barColor }}></div>
                  </div>
                </div>
                <div className="mkt-stat-item">
                  <div className="mkt-stat-value">{leads}</div>
                  <div className="mkt-stat-label">LEAD</div>
                </div>
                <div className="mkt-stat-item">
                  <div className="mkt-stat-value" style={{ color: 'var(--cyan)' }}>{bookings}</div>
                  <div className="mkt-stat-label">BOOKING</div>
                </div>
                <div className="mkt-stat-item">
                  <div className="mkt-stat-value">{clicks}</div>
                  <div className="mkt-stat-label">CLICK</div>
                </div>
              </div>

              {m['Ghi chú'] && (
                <div className="mkt-card-footer">
                  {m['Ghi chú']} {m['CPL (tr)'] ? `· CPL: ${Math.round(Number(m['CPL (tr)'])*1000)}k` : ''} {m['CP/Book (tr)'] ? `· CP/Booking: ${Number(m['CP/Book (tr)']).toFixed(1)}tr` : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {marketingTotal > itemsPerPage && (
        <div className="pagination" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '30px', marginBottom: '20px' }}>
          <button 
            onClick={() => setMarketingPage(prev => Math.max(prev - 1, 1))} 
            disabled={marketingPage === 1}
            className="btn-cancel"
            style={{ padding: '6px 15px', opacity: marketingPage === 1 ? 0.5 : 1 }}
          >Trước</button>
          
          {Array.from({ length: Math.ceil(marketingTotal / itemsPerPage) }).map((_, idx) => {
            const pageNum = idx + 1;
            const totalPages = Math.ceil(marketingTotal / itemsPerPage);
            if (totalPages > 7) {
              if (pageNum !== 1 && pageNum !== totalPages && (pageNum < marketingPage - 1 || pageNum > marketingPage + 1)) {
                if (pageNum === 2 && marketingPage > 3) return <span key="dots1" style={{ color: 'var(--text-muted)' }}>...</span>;
                if (pageNum === totalPages - 1 && marketingPage < totalPages - 2) return <span key="dots2" style={{ color: 'var(--text-muted)' }}>...</span>;
                return null;
              }
            }
            return (
              <button 
                key={pageNum} 
                onClick={() => setMarketingPage(pageNum)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: marketingPage === pageNum ? 'var(--accent)' : 'var(--border-color)',
                  background: marketingPage === pageNum ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: marketingPage === pageNum ? '#000' : 'var(--text-main)',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >{pageNum}</button>
            );
          })}

          <button 
            onClick={() => setMarketingPage(prev => Math.min(prev + 1, Math.ceil(marketingTotal / itemsPerPage)))} 
            disabled={marketingPage >= Math.ceil(marketingTotal / itemsPerPage)}
            className="btn-cancel"
            style={{ padding: '6px 15px', opacity: marketingPage >= Math.ceil(marketingTotal / itemsPerPage) ? 0.5 : 1 }}
          >Sau</button>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Thêm Chiến dịch mới</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tháng (YYYY-MM)</label>
                  <input required type="month" className="input-field" value={formData['Tháng']} onChange={e => setFormData({...formData, 'Tháng': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tên chiến dịch</label>
                  <input required className="input-field" value={formData['Tên chiến dịch']} onChange={e => setFormData({...formData, 'Tên chiến dịch': e.target.value})} placeholder="Chiến dịch 1" />
                </div>
                <div className="form-group">
                  <label>Kênh</label>
                  <input 
                    required 
                    className="input-field" 
                    value={formData['Kênh']} 
                    onChange={e => setFormData({...formData, 'Kênh': e.target.value})} 
                    placeholder="Nhập hoặc chọn kênh..." 
                    list="channel-options" 
                  />
                  <datalist id="channel-options">
                    <option value="Facebook Ads" />
                    <option value="Google Ads" />
                    <option value="TikTok" />
                    <option value="Sự kiện Offline" />
                    <option value="Zalo Ads" />
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Chi phí (VNĐ)</label>
                  <input required type="text" className="input-field" value={displayNumber(formData['CP (VNĐ)'])} onChange={e => handleNumberChange('CP (VNĐ)', e.target.value)} placeholder="50.000.000" />
                </div>
                <div className="form-group">
                  <label>Số lượng Click</label>
                  <input type="number" className="input-field" value={formData['Click']} onChange={e => handleNumberChange('Click', e.target.value)} placeholder="1000" />
                </div>
                <div className="form-group">
                  <label>Số lượng Lead</label>
                  <input required type="number" className="input-field" value={formData['Lead']} onChange={e => handleNumberChange('Lead', e.target.value)} placeholder="100" />
                </div>
                <div className="form-group">
                  <label>Số lượng Booking</label>
                  <input required type="number" className="input-field" value={formData['Booking']} onChange={e => handleNumberChange('Booking', e.target.value)} placeholder="10" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Ghi chú</label>
                  <input className="input-field" value={formData['Ghi chú']} onChange={e => setFormData({...formData, 'Ghi chú': e.target.value})} placeholder="Ghi chú thêm..." />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-submit">Lưu Chiến dịch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Marketing;
