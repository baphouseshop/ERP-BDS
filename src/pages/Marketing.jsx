import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { 
  KpiCard, ChartCard, SectionHead, BarChart, fmt 
} from '../components/VisualLanguage';
import { downloadTemplate } from '../utils/templateGenerator';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

function Marketing() {
  const { 
    marketing, marketingTotal, marketingPage, setMarketingPage, 
    marketingSearch, setMarketingSearch, marketingSort, setMarketingSort,
    itemsPerPage, addMarketing, editMarketing, deleteMarketing, addMultipleMarketing,
    dashboardStats
  } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        addMultipleMarketing(data);
      } catch (err) {
        toast.error("Lỗi đọc file: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  // Debounced Search Logic
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

  useEffect(() => {
    setLocalSearch(marketingSearch);
  }, [marketingSearch]);

  const [formData, setFormData] = useState({
    'Tháng': new Date().toISOString().slice(0, 7),
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
      editMarketing(payload);
    } else {
      addMarketing(payload);
    }
    setIsModalOpen(false);
  };

  // --- KPI CALCULATIONS ---
  const mktStats = dashboardStats?.mkt_performance || { total_cost: 0, total_leads: 0, total_bookings: 0, channels: {} };
  const totalCP = Number((mktStats.total_cost || 0).toFixed(1));
  const totalLead = mktStats.total_leads || 0;
  const totalBooking = mktStats.total_bookings || 0;
  const avgCPL = totalLead > 0 ? (totalCP * 1000) / totalLead : 0;
  const avgConv = totalLead > 0 ? (totalBooking / totalLead) * 100 : 0;

  const channels = Object.values(mktStats.channels || {});
  let bestChannel = null;
  let worstChannel = null;
  
  if (channels.length > 0) {
    const sortedChannels = [...channels].sort((a, b) => {
      const rateA = a.Lead > 0 ? a.Booking / a.Lead : 0;
      const rateB = b.Lead > 0 ? b.Booking / b.Lead : 0;
      return rateB - rateA;
    });
    bestChannel = sortedChannels[0];
    worstChannel = sortedChannels[sortedChannels.length - 1];
  }

  // --- COLORS ---
  const COLORS = {
    'Facebook': '#ccff00',
    'Google': '#00e5ff',
    'TikTok': '#ff4d94',
    'Offline': '#ffcc00'
  };
  const getChannelColor = (name) => {
    for (let key in COLORS) {
      if (name.includes(key)) return COLORS[key];
    }
    return '#60a5fa';
  };

  const evalColor = (rate) => {
    if (rate >= 10) return '#ccff00';
    if (rate >= 5) return '#00e5ff';
    if (rate >= 2) return '#ffcc00';
    return '#f87171';
  };

  const clearFilters = () => { setLocalSearch(''); setMarketingSearch(''); };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: 'clamp(20px, 5vw, 28px)' }}>Marketing</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Quản lý hiệu suất và chi phí các chiến dịch</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-cancel" style={{ 
              borderColor: 'var(--accent)', 
              color: 'var(--accent)', 
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 13
            }} onClick={() => {
              toast.success("Đang chuẩn bị mẫu nhập liệu...");
              downloadTemplate('marketing');
            }}>
              <i className="ti ti-download" style={{ marginRight: 6 }}></i> Tải mẫu nhập liệu
            </button>
            <button className="btn-cancel" style={{ 
              borderColor: 'var(--cyan)', 
              color: 'var(--cyan)', 
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 13
            }} onClick={() => fileInputRef.current.click()}>
              <i className="ti ti-upload" style={{ marginRight: 6 }}></i> Up file hàng loạt
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
            />
            <select 
              className="filter-select" 
              style={{ width: 180, margin: 0 }}
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
            <button onClick={handleOpenAddModal} className="btn-submit" style={{ 
              padding: '8px 20px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center'
            }}>
              <i className="ti ti-plus" style={{ marginRight: 6 }}></i> Thêm Chiến dịch
            </button>
          </div>
        </div>
      </div>

      <div className="filter-bar" style={{ 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 12, 
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
          <input className="filter-input" placeholder="Tìm tên chiến dịch, kênh, ghi chú..." style={{ paddingLeft: 36, width: '100%', margin: 0 }} value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
        </div>
        {marketingSearch && <button onClick={clearFilters} style={{ background: 'transparent', border: 'none', color: 'var(--red)', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>XÓA LỌC</button>}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Trang <strong>{marketingPage}</strong> · Tổng <strong>{marketingTotal}</strong> chiến dịch
        </span>
      </div>

      <div className="dash-kpi-grid-res" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard 
          label="Tổng Chi Phí" 
          value={fmt(totalCP * 1000000)} 
          sub={`KH 500tr · Đạt ${Math.round((totalCP/500)*100)}%`}
          colorClass="amber"
        />
        <KpiCard 
          label="Tổng Lead" 
          value={totalLead.toLocaleString()} 
          sub={`${marketing.length} chiến dịch · ${channels.length} kênh`}
          colorClass="cyan"
        />
        <KpiCard 
          label="Tổng Booking" 
          value={totalBooking.toLocaleString()} 
          sub={`CĐ TB ${avgConv.toFixed(1)}% · CPL ${avgCPL.toFixed(0)}k`}
          colorClass="lime"
        />
        <KpiCard 
          label="Kênh Hiệu Quả" 
          value={bestChannel ? bestChannel.name : '—'} 
          sub={bestChannel ? `CĐ ${((bestChannel.Booking/bestChannel.Lead)*100).toFixed(1)}% · ${bestChannel.Booking} book` : ''}
          colorClass="lime"
        />
        <KpiCard 
          label="Kênh Yếu" 
          value={worstChannel ? worstChannel.name : '—'} 
          sub={worstChannel ? `CĐ ${((worstChannel.Booking/worstChannel.Lead)*100).toFixed(1)}% · Cần tối ưu` : ''}
          colorClass="red"
        />
      </div>

      <div className="dash-grid-res-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <ChartCard title="Phân bổ Lead & Booking" sub="Thống kê gộp theo kênh tiếp cận">
          <BarChart bars={channels.map(c => ({
            label: c.name.split(' ')[0],
            val: c.Lead,
            color: getChannelColor(c.name)
          }))} />
        </ChartCard>

        <ChartCard title="Tỷ lệ chuyển đổi (%)" sub="Hiệu suất Lead → Booking theo kênh">
          <BarChart bars={channels.map(c => ({
            label: c.name.split(' ')[0],
            val: c.Lead > 0 ? Number(((c.Booking / c.Lead) * 100).toFixed(1)) : 0,
            color: getChannelColor(c.name)
          }))} />
        </ChartCard>
      </div>

      <SectionHead label="Chi tiết từng chiến dịch" icon="ti-list-details" />
      
      <div className="dash-grid-res-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
        {marketing.map((m, index) => {
          const leads = Number(m['Lead'] || 0);
          const bookings = Number(m['Booking'] || 0);
          const cp = Number(m['CP (tr)'] || 0);
          const rate = leads > 0 ? (bookings / leads) * 100 : 0;
          const barColor = getChannelColor(m['Kênh']);
          
          return (
            <div key={index} style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 12, 
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{m['Tên chiến dịch']}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m['Kênh']} · {m['Tháng']}</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleOpenEditModal(m)} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', padding: 4 }} title="Sửa"><i className="ti ti-pencil" style={{ fontSize: 16 }}></i></button>
                  <button 
                    onClick={() => window.confirm(`Xóa chiến dịch ${m['Tên chiến dịch']}?`) && deleteMarketing(m['_id'])} 
                    style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 4 }} 
                    title="Xóa"
                  ><i className="ti ti-trash" style={{ fontSize: 16 }}></i></button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '10px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#ffcc00' }}>{fmt(cp * 1000000)}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chi phí</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{leads}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lead</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#00e5ff' }}>{bookings}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: evalColor(rate) }}>{rate.toFixed(1)}%</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tỉ lệ CĐ</div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {m['Ghi chú'] || 'Không có ghi chú'} 
                {m['CPL (tr)'] ? ` · CPL: ${Math.round(Number(m['CPL (tr)'])*1000)}k` : ''}
              </div>
            </div>
          );
        })}
      </div>

      {marketingTotal > itemsPerPage && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32, flexWrap: 'wrap' }}>
          <button 
            onClick={() => setMarketingPage(prev => Math.max(prev - 1, 1))} 
            disabled={marketingPage === 1} 
            className="btn-page"
            style={{ padding: '8px 12px' }}
          >
            <i className="ti ti-angle-left"></i>
          </button>
          
          {(() => {
            const pages = [];
            const showRange = 1;
            const totalPages = Math.ceil(marketingTotal / itemsPerPage);
            
            pages.push(
              <button key={1} onClick={() => setMarketingPage(1)} className={`btn-page ${marketingPage === 1 ? 'active' : ''}`}>1</button>
            );
            
            if (marketingPage > showRange + 2) {
              pages.push(<span key="dots-1" style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>);
            }
            
            for (let i = Math.max(2, marketingPage - showRange); i <= Math.min(totalPages - 1, marketingPage + showRange); i++) {
              pages.push(
                <button key={i} onClick={() => setMarketingPage(i)} className={`btn-page ${marketingPage === i ? 'active' : ''}`}>{i}</button>
              );
            }
            
            if (marketingPage < totalPages - showRange - 1) {
              pages.push(<span key="dots-2" style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>);
            }
            
            if (totalPages > 1) {
              pages.push(
                <button key={totalPages} onClick={() => setMarketingPage(totalPages)} className={`btn-page ${marketingPage === totalPages ? 'active' : ''}`}>{totalPages}</button>
              );
            }
            
            return pages;
          })()}
          
          <button 
            onClick={() => setMarketingPage(prev => Math.min(prev + 1, Math.ceil(marketingTotal / itemsPerPage)))} 
            disabled={marketingPage >= Math.ceil(marketingTotal / itemsPerPage)} 
            className="btn-page"
            style={{ padding: '8px 12px' }}
          >
            <i className="ti ti-angle-right"></i>
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <h2 className="modal-title">{isEditMode ? 'Cập nhật' : 'Thêm'} Chiến dịch</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tháng</label>
                  <input required type="month" className="input-field" value={formData['Tháng']} onChange={e => setFormData({...formData, 'Tháng': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tên chiến dịch</label>
                  <input required className="input-field" value={formData['Tên chiến dịch']} onChange={e => setFormData({...formData, 'Tên chiến dịch': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Kênh</label>
                  <input required className="input-field" value={formData['Kênh']} onChange={e => setFormData({...formData, 'Kênh': e.target.value})} list="channel-options" />
                  <datalist id="channel-options">
                    <option value="Facebook Ads" /><option value="Google Ads" /><option value="TikTok" /><option value="Sự kiện Offline" />
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Chi phí (VNĐ)</label>
                  <input required type="text" className="input-field" value={displayNumber(formData['CP (VNĐ)'])} onChange={e => handleNumberChange('CP (VNĐ)', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Click</label>
                  <input type="number" className="input-field" value={formData['Click']} onChange={e => setFormData({...formData, 'Click': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Lead</label>
                  <input required type="number" className="input-field" value={formData['Lead']} onChange={e => setFormData({...formData, 'Lead': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Booking</label>
                  <input required type="number" className="input-field" value={formData['Booking']} onChange={e => setFormData({...formData, 'Booking': e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Ghi chú</label>
                  <input className="input-field" value={formData['Ghi chú']} onChange={e => setFormData({...formData, 'Ghi chú': e.target.value})} />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-submit">Lưu dữ liệu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Marketing;
