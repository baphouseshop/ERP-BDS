import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { KpiCard, SectionHead, DonutChart, BarChart, ChartCard, fmt } from '../components/VisualLanguage';

function Financials() {
  const { 
    financials, financialsTotal, financialsPage, setFinancialsPage,
    financialsSearch, setFinancialsSearch, financialsSort, setFinancialsSort,
    staff, addFinancial, editFinancial, deleteFinancial,
    itemsPerPage, dashboardStats
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [formData, setFormData] = useState({
    'Tháng': new Date().toISOString().slice(0, 7),
    'Hạng mục': '',
    'Loại': 'Doanh thu',
    'Thực tế (tỷ)': '',
    'KH (tỷ)': '',
    'Ghi chú': '',
    'Người duyệt': '',
    '_approver_id': '',
    '_id': ''
  });

  // --- STATS ---
  const stats = dashboardStats?.financial_stats || {
    revenue: 0, revenue_kh: 0, ops_cost: 0, ops_cost_kh: 0,
    mkt_cost: 0, mkt_cost_kh: 0, salary_cost: 0, salary_cost_kh: 0,
    expense: 0
  };

  const kpiData = useMemo(() => {
    const rev = Number(stats.revenue || 0) * 1_000_000_000;
    const revKh = Number(stats.revenue_kh || 0) * 1_000_000_000;
    const ops = Number(stats.ops_cost || 0) * 1_000_000_000;
    const opsKh = Number(stats.ops_cost_kh || 0) * 1_000_000_000;
    const mkt = Number(stats.mkt_cost || 0) * 1_000_000_000;
    const mktKh = Number(stats.mkt_cost_kh || 0) * 1_000_000_000;
    const sal = Number(stats.salary_cost || 0) * 1_000_000_000;
    const salKh = Number(stats.salary_cost_kh || 0) * 1_000_000_000;
    const exp = Number(stats.expense || 0) * 1_000_000_000;
    const profit = rev - exp;

    return {
      rev: fmt(rev), revSub: `KH: ${fmt(revKh)} · ${revKh ? ((rev/revKh)*100).toFixed(0) : 0}%`,
      ops: fmt(ops), opsSub: `KH: ${fmt(opsKh)} · ${opsKh ? ((ops/opsKh)*100).toFixed(0) : 0}%`,
      mkt: fmt(mkt), mktSub: `KH: ${fmt(mktKh)} · ${mktKh ? ((mkt/mktKh)*100).toFixed(0) : 0}%`,
      sal: fmt(sal), salSub: `KH: ${fmt(salKh)} · ${salKh ? ((sal/salKh)*100).toFixed(0) : 0}%`,
      profit: fmt(profit), profitSub: `${rev ? ((profit/rev)*100).toFixed(1) : 0}% biên LN`,
      exp: fmt(exp), expSub: 'VH + MKT + Lương'
    };
  }, [stats]);

  // --- CHARTS ---
  const barsData = [
    { label: 'D.Thu', val: Number(stats.revenue || 0), color: '#ccff00' },
    { label: 'LN Gộp', val: Number(stats.revenue || 0) - Number(stats.expense || 0), color: '#00e5ff' },
    { label: 'CP VH', val: Number(stats.ops_cost || 0), color: '#ff4d94' },
    { label: 'CP MKT', val: Number(stats.mkt_cost || 0), color: '#a78bfa' },
    { label: 'Lương', val: Number(stats.salary_cost || 0), color: '#ffcc00' }
  ];

  const costSegments = [
    { label: 'Vận hành', pct: stats.expense ? Math.round((stats.ops_cost / stats.expense) * 100) : 0, color: '#ff4d94', count: stats.ops_cost + ' tỷ' },
    { label: 'Marketing', pct: stats.expense ? Math.round((stats.mkt_cost / stats.expense) * 100) : 0, color: '#a78bfa', count: stats.mkt_cost + ' tỷ' },
    { label: 'Lương & HH', pct: stats.expense ? Math.round((stats.salary_cost / stats.expense) * 100) : 0, color: '#ffcc00', count: stats.salary_cost + ' tỷ' }
  ];

  // --- HANDLERS ---
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormData({ 'Tháng': new Date().toISOString().slice(0, 7), 'Hạng mục': '', 'Loại': 'Doanh thu', 'Thực tế (tỷ)': '', 'KH (tỷ)': '', 'Ghi chú': '', 'Người duyệt': '', '_approver_id': '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (f) => {
    setIsEditMode(true);
    setFormData({ 'Tháng': f['Tháng'] || '', 'Hạng mục': f['Hạng mục'] || '', 'Loại': f['Loại'] || 'Doanh thu', 'Thực tế (tỷ)': f['Thực tế (tỷ)'] || '', 'KH (tỷ)': f['KH (tỷ)'] || '', 'Ghi chú': f['Ghi chú'] || '', 'Người duyệt': f['Người duyệt'] || '', '_approver_id': f['_approver_id'] || '', '_id': f['_id'] || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const actual = Number(formData['Thực tế (tỷ)']);
    const target = Number(formData['KH (tỷ)']);
    const pct = target > 0 ? (actual / target) * 100 : 0;
    const payload = { ...formData, '% Hoàn thành': pct, 'Chênh lệch': actual - target };
    if (isEditMode) editFinancial(payload);
    else addFinancial(payload);
    setIsModalOpen(false);
  };

  const handleStaffChange = (e) => {
    const maNV = e.target.value;
    const selectedStaff = staff.find(s => s['Mã NV'] === maNV);
    setFormData({ ...formData, '_approver_id': maNV, 'Người duyệt': selectedStaff ? selectedStaff['Tên NV'] : '' });
  };

  const uniqueCategories = Array.from(new Set(financials.map(f => f['Hạng mục']).filter(Boolean)));
  const totalPages = Math.ceil(financialsTotal / itemsPerPage);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Tài chính</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select className="filter-select" style={{ width: '180px' }} value={`${financialsSort.column}-${financialsSort.ascending ? 'asc' : 'desc'}`} onChange={e => { const [column, dir] = e.target.value.split('-'); setFinancialsSort({ column, ascending: dir === 'asc' }); }}>
            <option value="thang-desc">Mới nhất lên đầu</option>
            <option value="thang-asc">Cũ nhất lên đầu</option>
            <option value="hang_muc-asc">Hạng mục (A-Z)</option>
            <option value="hang_muc-desc">Hạng mục (Z-A)</option>
          </select>
          <button onClick={handleOpenAddModal} className="btn-submit">Thêm Bản ghi</button>
        </div>
      </div>

      <div className="dash-kpi-grid-res" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 10, marginBottom: 20 }}>
        <KpiCard colorClass="lime"   label="Doanh thu thực thu" value={kpiData.rev}    sub={kpiData.revSub} />
        <KpiCard colorClass="pink"   label="Chi phí vận hành"   value={kpiData.ops}    sub={kpiData.opsSub} />
        <KpiCard colorClass="purple" label="Chi phí Marketing"  value={kpiData.mkt}    sub={kpiData.mktSub} />
        <KpiCard colorClass="amber"  label="Lương & Hoa hồng"   value={kpiData.sal}    sub={kpiData.salSub} />
        <KpiCard colorClass="cyan"   label="Lợi nhuận gộp"      value={kpiData.profit} sub={kpiData.profitSub} />
        <KpiCard colorClass="blue"   label="Tổng chi phí"       value={kpiData.exp}    sub={kpiData.expSub} />
      </div>

      <div className="dash-grid-res-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <ChartCard title="Thực tế vs Kế hoạch" sub="Đơn vị: Tỷ VNĐ">
          <BarChart bars={barsData} />
        </ChartCard>
        <ChartCard title="Cơ cấu chi phí" sub={`Tổng chi phí: ${stats.expense} tỷ`}>
          <DonutChart segments={costSegments} total={stats.expense} label="tỷ" />
        </ChartCard>
      </div>

      <SectionHead icon="ti-list" label="Quản lý chi tiết hạng mục" />
      <div className="filter-bar" style={{ marginBottom: 15 }}>
        <input className="filter-input" placeholder="🔍 Tìm hạng mục, ghi chú, người duyệt..." value={financialsSearch} onChange={e => setFinancialsSearch(e.target.value)} />
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">-- Tất cả loại --</option>
          <option value="Income">Thu nhập (Income)</option>
          <option value="Expense">Chi phí (Expense)</option>
        </select>
        <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">-- Tất cả hạng mục --</option>
          {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(financialsSearch || filterType || filterCategory) && <button className="btn-clear-filter" onClick={() => { setFinancialsSearch(''); setFilterType(''); setFilterCategory(''); }}>✕ Xóa lọc</button>}
      </div>

      <div className="table-container">
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
            {financials.map((f, i) => (
              <tr key={i}>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleOpenEditModal(f)} className="btn-edit">Sửa</button>
                    <button onClick={() => { if(window.confirm(`Xóa bản ghi ${f['Hạng mục']}?`)) deleteFinancial(f['_id']); }} className="btn-cancel" style={{ padding: '2px 8px', fontSize: '12px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>Xóa</button>
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

      {totalPages > 1 && (
        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', marginBottom: '40px' }}>
          <button onClick={() => setFinancialsPage(financialsPage - 1)} disabled={financialsPage === 1} className="btn-nav">Trái</button>
          {[...Array(totalPages)].map((_, idx) => (
            <button key={idx} onClick={() => setFinancialsPage(idx + 1)} className={financialsPage === idx + 1 ? 'btn-nav active' : 'btn-nav'}>{idx + 1}</button>
          ))}
          <button onClick={() => setFinancialsPage(financialsPage + 1)} disabled={financialsPage === totalPages} className="btn-nav">Phải</button>
        </div>
      )}

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
                  <select required className="input-field" value={formData['Loại']} onChange={e => setFormData({...formData, 'Loại': e.target.value})}>
                    <option value="Doanh thu">Doanh thu (Income)</option>
                    <option value="Chi phí">Chi phí (Expense)</option>
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
