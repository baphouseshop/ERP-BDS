import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '13px' }}>{label || payload[0].name}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ margin: 0, color: p.color || p.fill, fontSize: '12px', display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
            <span>{p.name}:</span>
            <span style={{ fontWeight: 'bold' }}>{Number(p.value).toFixed(2)} tỷ</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const renderProgressBar = (item, color, icon, calcTotal, calcKH) => {
  const actual = Number(calcTotal(item));
  const target = Number(calcKH(item));
  let pct = target > 0 ? (actual / target) * 100 : 0;
  const isExceeded = pct > 100;
  
  const isCost = item['Loại'] === 'Chi phí' || item['Loại'] === 'Expense';
  const displayColor = isExceeded && isCost ? 'var(--danger)' : color;
  const barWidth = Math.min(pct, 100);

  return (
    <div className="fin-progress-item" key={item['Hạng mục']}>
      <div className="fin-progress-header">
        <div className="fin-progress-title">
          <span style={{ fontSize: '18px', opacity: 0.8 }}>{icon}</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{item['Hạng mục']}</span>
            <span className="fin-progress-subtitle" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item['Ghi chú'] || 'Duyệt bởi ' + item['Người duyệt']}</span>
          </div>
        </div>
        <div className="fin-progress-stats">
          <div style={{ textAlign: 'right' }}>
            <span className="fin-progress-val" style={{ color: displayColor, fontSize: '18px', fontWeight: '700' }}>{actual.toFixed(2)}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>tỷ</span>
          </div>
          <span className="fin-progress-pct" style={{ color: displayColor, backgroundColor: displayColor + '15', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="fin-progress-bar-bg" style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
        <div 
          className="fin-progress-bar-fill" 
          style={{ width: `${barWidth}%`, backgroundColor: displayColor, borderRadius: '4px', boxShadow: `0 0 10px ${displayColor}40` }}
        />
      </div>
    </div>
  );
};

function Financials() {
  const { 
    financials, financialsTotal, financialsPage, setFinancialsPage,
    financialsSearch, setFinancialsSearch, financialsSort, setFinancialsSort,
    staff, addFinancial, editFinancial, deleteFinancial,
    itemsPerPage, dashboardStats, transactions
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [formData, setFormData] = useState({
    'Tháng': new Date().toISOString().slice(0, 7),
    'Hạng mục': '', 'Loại': 'Doanh thu', 'Thực tế (tỷ)': '', 'KH (tỷ)': '',
    'Ghi chú': '', 'Người duyệt': '', '_approver_id': '', '_id': ''
  });

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormData({
      'Tháng': new Date().toISOString().slice(0, 7),
      'Hạng mục': '', 'Loại': 'Doanh thu', 'Thực tế (tỷ)': '', 'KH (tỷ)': '',
      'Ghi chú': '', 'Người duyệt': '', '_approver_id': ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (f) => {
    setIsEditMode(true);
    setFormData({
      'Tháng': f['Tháng'] || '', 'Hạng mục': f['Hạng mục'] || '', 'Loại': f['Loại'] || 'Doanh thu',
      'Thực tế (tỷ)': f['Thực tế (tỷ)'] || '', 'KH (tỷ)': f['KH (tỷ)'] || '',
      'Ghi chú': f['Ghi chú'] || '', 'Người duyệt': f['Người duyệt'] || '',
      '_approver_id': f['_approver_id'] || '', '_id': f['_id'] || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const actual = Number(formData['Thực tế (tỷ)']);
    const target = Number(formData['KH (tỷ)']);
    const pct = target > 0 ? (actual / target) * 100 : 0;
    const payload = { ...formData, '% Hoàn thành': pct, 'Chênh lệch': actual - target };
    if (isEditMode) editFinancial(payload); else addFinancial(payload);
    setIsModalOpen(false);
  };

  const handleStaffChange = (e) => {
    const maNV = e.target.value;
    const selectedStaff = staff.find(s => s['Mã NV'] === maNV);
    if (selectedStaff) setFormData({ ...formData, '_approver_id': maNV, 'Người duyệt': selectedStaff['Tên NV'] });
    else setFormData({ ...formData, '_approver_id': '', 'Người duyệt': '' });
  };

  const stats = dashboardStats?.financial_stats || {
    revenue: 0, revenue_kh: 0, ops_cost: 0, ops_cost_kh: 0, mkt_cost: 0, mkt_cost_kh: 0, salary_cost: 0, salary_cost_kh: 0, expense: 0
  };

  const doanhThuT = Number(stats.revenue || 0);
  const doanhThuKH = Number(stats.revenue_kh || 0);
  const chiPhiVHT = Number(stats.ops_cost || 0);
  const chiPhiVHKH = Number(stats.ops_cost_kh || 0);
  const chiPhiMktT = Number(stats.mkt_cost || 0);
  const chiPhiMktKH = Number(stats.mkt_cost_kh || 0);
  const luongHHT = Number(stats.salary_cost || 0);
  const luongHHKH = Number(stats.salary_cost_kh || 0);
  const sumChiPhi = Number(stats.expense || 0);
  const loiNhuanT = doanhThuT - sumChiPhi;

  const actualVsPlanData = [
    { name: 'Doanh thu', 'Thực tế': doanhThuT, 'KH': doanhThuKH },
    { name: 'Chi phí VH', 'Thực tế': chiPhiVHT, 'KH': chiPhiVHKH },
    { name: 'Chi phí MKT', 'Thực tế': chiPhiMktT, 'KH': chiPhiMktKH },
    { name: 'Lương & HH', 'Thực tế': luongHHT, 'KH': luongHHKH },
  ];

  const COST_COLORS = ['#ff5e9e', '#00f2ff', '#ffb800'];
  const costStructureData = [
    { name: 'Vận hành', value: chiPhiVHT },
    { name: 'Marketing', value: chiPhiMktT },
    { name: 'Lương & HH', value: luongHHT }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Tài chính Doanh nghiệp</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleOpenAddModal} className="btn-submit" style={{ borderRadius: '12px', padding: '10px 20px' }}>+ Thêm Bản ghi</button>
        </div>
      </div>

      <div className="dash-kpi-grid">
        <div className="dash-kpi-card card-revenue">
          <div className="dash-kpi-title">Doanh thu</div>
          <div className="dash-kpi-value">{doanhThuT.toFixed(2)}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">KH: {doanhThuKH.toFixed(2)} tỷ · {doanhThuKH ? ((doanhThuT/doanhThuKH)*100).toFixed(0) : 0}%</div>
        </div>
        <div className="dash-kpi-card card-burn">
          <div className="dash-kpi-title">Tổng Chi phí</div>
          <div className="dash-kpi-value">{sumChiPhi.toFixed(2)}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">VH + MKT + Lương & HH</div>
        </div>
        <div className="dash-kpi-card card-profit">
          <div className="dash-kpi-title">Lợi nhuận gộp</div>
          <div className="dash-kpi-value">{loiNhuanT.toFixed(2)}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">Biên LN: {doanhThuT ? ((loiNhuanT/doanhThuT)*100).toFixed(1) : 0}%</div>
        </div>
      </div>

      <div className="fin-charts-grid">
        <div className="dash-chart-card">
          <div className="dash-chart-title">Thực tế vs Kế hoạch</div>
          <div className="dash-chart-subtitle">Đơn vị: Tỷ VNĐ</div>
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={actualVsPlanData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Thực tế" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="KH" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Cơ cấu Chi phí</div>
          <div className="dash-chart-subtitle">Tỷ lệ phân bổ ngân sách</div>
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={costStructureData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {costStructureData.map((entry, index) => <Cell key={`cell-${index}`} fill={COST_COLORS[index % COST_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="fin-details-section" style={{ borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
        <div className="dash-chart-title" style={{ marginBottom: '20px', fontSize: '18px' }}>Theo dõi Hạng mục Mục tiêu</div>
        {renderProgressBar({ 'Hạng mục': 'Doanh thu thực thu', 'Loại': 'Income', 'Ghi chú': 'Tổng hợp từ hợp đồng' }, 'var(--accent)', '💰', () => doanhThuT, () => doanhThuKH)}
        {renderProgressBar({ 'Hạng mục': 'Chi phí vận hành', 'Loại': 'Expense', 'Ghi chú': 'Văn phòng, mặt bằng, điện nước' }, 'var(--pink)', '🏢', () => chiPhiVHT, () => chiPhiVHKH)}
        {renderProgressBar({ 'Hạng mục': 'Chi phí Marketing', 'Loại': 'Expense', 'Ghi chú': 'Ads, sự kiện, branding' }, 'var(--cyan)', '📢', () => chiPhiMktT, () => chiPhiMktKH)}
        {renderProgressBar({ 'Hạng mục': 'Quỹ lương & Hoa hồng', 'Loại': 'Expense', 'Ghi chú': 'Lương cứng + Thưởng DS' }, 'var(--warning)', '👥', () => luongHHT, () => luongHHKH)}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '20px', padding: '32px' }}>
            <h2 className="modal-title" style={{ marginBottom: '24px' }}>{isEditMode ? 'Cập nhật Bản ghi' : 'Thêm Giao dịch Tài chính'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tháng</label>
                  <input required type="month" className="input-field" value={formData['Tháng']} onChange={e => setFormData({...formData, 'Tháng': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Hạng mục</label>
                  <input required className="input-field" value={formData['Hạng mục']} onChange={e => setFormData({...formData, 'Hạng mục': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Loại</label>
                  <select className="input-field" value={formData['Loại']} onChange={e => setFormData({...formData, 'Loại': e.target.value})}>
                    <option value="Doanh thu">Doanh thu (Income)</option>
                    <option value="Chi phí">Chi phí (Expense)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Thực tế (Tỷ)</label>
                  <input required type="number" step="0.01" className="input-field" value={formData['Thực tế (tỷ)']} onChange={e => setFormData({...formData, 'Thực tế (tỷ)': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Kế hoạch (Tỷ)</label>
                  <input required type="number" step="0.01" className="input-field" value={formData['KH (tỷ)']} onChange={e => setFormData({...formData, 'KH (tỷ)': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Người duyệt</label>
                  <select className="input-field" value={formData['_approver_id']} onChange={handleStaffChange}>
                    <option value="">-- Chọn nhân viên --</option>
                    {staff.map((s, idx) => <option key={idx} value={s['Mã NV']}>{s['Tên NV']}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel" style={{ borderRadius: '12px' }}>Hủy</button>
                <button type="submit" className="btn-submit" style={{ borderRadius: '12px' }}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financials;
