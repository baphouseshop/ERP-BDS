import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { useData } from '../context/DataContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '13px' }}>{label || payload[0].name}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ margin: 0, color: p.color || p.fill, fontSize: '12px', display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
            <span>{p.name}:</span>
            <span style={{ fontWeight: 'bold' }}>{p.value.toLocaleString()}</span>
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
    itemsPerPage, addMarketing, editMarketing, deleteMarketing,
    dashboardStats
  } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [localSearch, setLocalSearch] = useState(marketingSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== marketingSearch) {
        setMarketingSearch(localSearch);
        setMarketingPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  useEffect(() => { setLocalSearch(marketingSearch); }, [marketingSearch]);

  const [formData, setFormData] = useState({
    'Tháng': new Date().toISOString().slice(0, 7),
    'Tên chiến dịch': '', 'Kênh': 'Facebook Ads', 'CP (VNĐ)': '', 'Lead': '', 'Booking': '', 'Click': '', 'Ghi chú': '', '_id': ''
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
      'Tên chiến dịch': '', 'Kênh': 'Facebook Ads', 'CP (VNĐ)': '', 'Lead': '', 'Booking': '', 'Click': '', 'Ghi chú': ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m) => {
    setIsEditMode(true);
    setFormData({
      'Tháng': m['Tháng'] || '', 'Tên chiến dịch': m['Tên chiến dịch'] || '', 'Kênh': m['Kênh'] || '',
      'CP (VNĐ)': (Number(m['CP (tr)'] || 0) * 1000000).toString(),
      'Lead': m['Lead'] || '', 'Booking': m['Booking'] || '', 'Click': m['Click'] || '', 'Ghi chú': m['Ghi chú'] || '', '_id': m['_id'] || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const costVNĐ = Number(formData['CP (VNĐ)']);
    const costTr = costVNĐ / 1000000;
    const cpl = Number(formData['Lead']) > 0 ? costTr / Number(formData['Lead']) : 0;
    const cpBook = Number(formData['Booking']) > 0 ? costTr / Number(formData['Booking']) : 0;
    const payload = { ...formData, 'CP (tr)': costTr, 'CPL (tr)': isFinite(cpl) ? cpl : 0, 'CP/Book (tr)': isFinite(cpBook) ? cpBook : 0 };
    if (isEditMode) editMarketing(payload); else addMarketing(payload);
    setIsModalOpen(false);
  };

  const mktStats = dashboardStats?.mkt_performance || { total_cost: 0, total_leads: 0, total_bookings: 0, channels: {} };
  const totalCP = Number((mktStats.total_cost || 0).toFixed(1));
  const totalLead = mktStats.total_leads || 0;
  const totalBooking = mktStats.total_bookings || 0;
  const avgCPL = totalLead > 0 ? (totalCP * 1000) / totalLead : 0;
  const avgConv = totalLead > 0 ? (totalBooking / totalLead) * 100 : 0;

  const channels = Object.values(mktStats.channels || {});
  let bestChannel = null;
  if (channels.length > 0) {
    bestChannel = [...channels].sort((a, b) => (b.Booking / (b.Lead || 1)) - (a.Booking / (a.Lead || 1)))[0];
  }

  const chart1Data = channels.map(c => ({
    name: c.name.replace('Sự kiện ', '').replace(' Ads', ''),
    'Lead': c.Lead,
    'Booking': c.Booking
  }));

  const COLORS = { 'Facebook': 'var(--accent)', 'Google': 'var(--cyan)', 'TikTok': 'var(--pink)', 'Offline': 'var(--purple)' };
  const getChannelColor = (name) => {
    for (let key in COLORS) if (name.includes(key)) return COLORS[key];
    return 'var(--text-muted)';
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Marketing Hiệu suất</h1>
        <button onClick={handleOpenAddModal} className="btn-submit" style={{ borderRadius: '12px', padding: '10px 20px' }}>+ Chiến dịch</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: '25px', background: 'var(--bg-secondary)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <input 
          className="filter-input" 
          placeholder="🔍 Tìm chiến dịch, kênh..." 
          value={localSearch} 
          onChange={e => setLocalSearch(e.target.value)} 
          style={{ background: 'var(--bg-primary)', border: 'none', padding: '10px 15px', borderRadius: '8px', flex: 1 }}
        />
        <span className="filter-count" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Tổng <strong>{marketingTotal}</strong> bản ghi</span>
      </div>

      <div className="dash-kpi-grid">
        <div className="dash-kpi-card card-mkt">
          <div className="dash-kpi-title">Chi phí MKT</div>
          <div className="dash-kpi-value">{totalCP}<span className="dash-kpi-unit">tr</span></div>
          <div className="dash-kpi-subtext">CPL trung bình: {avgCPL.toFixed(0)}k</div>
        </div>
        <div className="dash-kpi-card card-leads">
          <div className="dash-kpi-title">Tổng Lead</div>
          <div className="dash-kpi-value">{totalLead}</div>
          <div className="dash-kpi-subtext">{channels.length} kênh tiếp cận</div>
        </div>
        <div className="dash-kpi-card card-deals">
          <div className="dash-kpi-title">Tổng Booking</div>
          <div className="dash-kpi-value">{totalBooking}</div>
          <div className="dash-kpi-subtext">Tỷ lệ CĐ: {avgConv.toFixed(1)}%</div>
        </div>
        <div className="dash-kpi-card card-profit" style={{ borderBottomColor: 'var(--accent)' }}>
          <div className="dash-kpi-title">Kênh Tốt nhất</div>
          <div className="dash-kpi-value" style={{ fontSize: '20px', color: 'var(--accent)' }}>{bestChannel?.name || '-'}</div>
          <div className="dash-kpi-subtext">{bestChannel ? `Booking: ${bestChannel.Booking}` : ''}</div>
        </div>
      </div>

      <div className="mkt-charts-grid">
        <div className="dash-chart-card">
          <div className="dash-chart-title">Phân bổ Lead & Booking</div>
          <div className="dash-chart-subtitle">Hiệu suất theo từng kênh</div>
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={chart1Data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Lead" fill="var(--cyan)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Booking" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Xu hướng Chuyển đổi</div>
          <div className="dash-chart-subtitle">Tỷ lệ Lead sang Booking</div>
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
              <AreaChart data={chart1Data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMkt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--purple)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Booking" name="Chuyển đổi" stroke="var(--purple)" strokeWidth={3} fillOpacity={1} fill="url(#colorMkt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="section-title">▶ Danh sách Chiến dịch</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
        {marketing.map((m, idx) => (
          <div className="mkt-campaign-card" key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-secondary)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{m['Tên chiến dịch']}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m['Kênh']} · {m['Tháng']}</div>
            </div>
            <div style={{ display: 'flex', gap: '30px', textAlign: 'center' }}>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--accent)' }}>{Number(m['CP (tr)'] || 0).toFixed(1)}tr</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chi phí</div>
              </div>
              <div>
                <div style={{ fontWeight: '700' }}>{m['Lead']}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lead</div>
              </div>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--cyan)' }}>{m['Booking']}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleOpenEditModal(m)} className="btn-edit" style={{ borderRadius: '8px' }}>Sửa</button>
              <button onClick={() => deleteMarketing(m['_id'])} className="btn-cancel" style={{ borderRadius: '8px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marketing;
