import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';
import { 
  KpiCard, SectionHead, fmt 
} from '../components/VisualLanguage';

function Leads() {
  const {
    leads,
    leadsTotal,
    leadsPage,
    setLeadsPage,
    leadsSearch,
    setLeadsSearch,
    leadsSort,
    setLeadsSort,
    leadsFilterStatus,
    setLeadsFilterStatus,
    leadsFilterSource,
    setLeadsFilterSource,
    leadsFilterAgency,
    setLeadsFilterAgency,
    itemsPerPage,
    marketing,
    addLead,
    editLead,
    deleteLead,
    addMultipleLeads,
    updateLeads,
    sales,
    staff,
    isFetching
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef(null);

  const STATUS_OPTIONS = ['MỚI TIẾP NHẬN', 'ĐANG CHĂM SÓC', 'TIỀM NĂNG', 'ĐÃ LIÊN HỆ', 'ĐÃ CHỐT', 'KHÔNG NHU CẦU', 'TỪ CHỐI'];
  const SOURCE_OPTIONS = ['Facebook Ads', 'Google Search', 'TikTok Ads', 'LinkedIn', 'Website', 'Giới thiệu', 'Khác'];
  const AGENCY_OPTIONS = ['Internal', 'Sàn 1', 'Sàn 2', 'Đối tác'];

  // --- SEARCH LOGIC ---
  const [localSearch, setLocalSearch] = useState(leadsSearch);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== leadsSearch) {
        setLeadsSearch(localSearch);
        setLeadsPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, leadsSearch, setLeadsSearch, setLeadsPage]);

  useEffect(() => {
    setLocalSearch(leadsSearch);
  }, [leadsSearch]);

  const handleSort = (key) => {
    const keyMap = {
      'Mã lead': 'ma_lead', 'Họ tên': 'ho_ten', 'SĐT (đầy đủ)': 'sdt',
      'Ngày nhận': 'ngay_nhan', 'Trạng thái': 'trang_thai'
    };
    const dbKey = keyMap[key] || 'ngay_nhan';
    setLeadsSort({ column: dbKey, ascending: leadsSort.column === dbKey ? !leadsSort.ascending : false });
  };

  const totalPages = Math.ceil(leadsTotal / itemsPerPage);

  const hasActiveFilters = leadsSearch || leadsFilterStatus || leadsFilterSource || leadsFilterAgency;
  const clearFilters = () => { 
    setLocalSearch('');
    setLeadsSearch(''); 
    setLeadsFilterStatus(''); 
    setLeadsFilterSource(''); 
    setLeadsFilterAgency(''); 
    setLeadsPage(1);
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    let p = phone.toString().trim();
    if (p.endsWith('.0')) p = p.slice(0, -2);
    if (!p.startsWith('0') && p.length > 0) p = '0' + p;
    return p;
  };

  const initialFormState = {
    'Mã lead': '', 'Họ tên': '', 'SĐT (đầy đủ)': '', 'Nguồn': '', 'Chiến dịch': '', 'Nhu cầu': '',
    'Trạng thái': 'MỚI TIẾP NHẬN', 'Ngày nhận': '', 'Ngày FU': '', 'Ngày hẹn': '',
    'Mã NV': '', 'Tên sàn': '', 'Sales phụ trách': '', 'Ghi chú': ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormData({
      ...initialFormState,
      'Mã lead': `LD${Date.now().toString().slice(-4)}`,
      'Ngày nhận': new Date().toISOString().slice(0, 10),
      'Ghi chú': '⚠ Chưa phân công'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead) => {
    setIsEditMode(true);
    setFormData({
      'Mã lead': lead['Mã lead'] || '',
      'Họ tên': lead['Họ tên'] || '',
      'SĐT (đầy đủ)': formatPhone(lead['SĐT (đầy đủ)']) || formatPhone(lead['SĐT (ẩn)']) || '',
      'Nguồn': lead['Nguồn'] || '',
      'Chiến dịch': lead['Chiến dịch'] || '',
      'Nhu cầu': lead['Nhu cầu'] || '',
      'Trạng thái': lead['Trạng thái'] || 'MỚI TIẾP NHẬN',
      'Ngày nhận': lead['Ngày nhận'] ? lead['Ngày nhận'].substring(0, 10) : '',
      'Ngày FU': lead['Ngày FU'] ? lead['Ngày FU'].substring(0, 10) : '',
      'Ngày hẹn': lead['Ngày hẹn'] ? lead['Ngày hẹn'].substring(0, 10) : '',
      'Mã NV': lead['Mã NV'] || '',
      'Tên sàn': lead['Tên sàn'] || '',
      'Sales phụ trách': lead['Sales phụ trách'] || '',
      'Ghi chú': lead['Ghi chú'] || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toLocaleString('vi-VN');
    const updatedData = { ...formData, 'Lần cập nhật cuối': timestamp, 'Người cập nhật': 'Admin' };
    if (isEditMode) editLead(updatedData);
    else addLead(updatedData);
    setIsModalOpen(false);
  };

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
          <div style={{ minWidth: 200 }}>
            <h1 className="page-title" style={{ margin: 0, fontSize: 'clamp(20px, 5vw, 28px)' }}>Quản lý Lead</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Theo dõi và quản lý dữ liệu khách hàng tiềm năng</p>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: 12,
            flexWrap: 'wrap'
          }}>
            <button className="btn-cancel" style={{ 
              borderColor: 'var(--accent)', 
              color: 'var(--accent)', 
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 13
            }} onClick={() => {
              // Dummy download function
              toast.success("Đang chuẩn bị mẫu nhập liệu...");
              setTimeout(() => toast.success("Đã tải xuống mẫu nhập liệu"), 1000);
            }}>
              <i className="ti ti-download" style={{ marginRight: 6 }}></i> Tải mẫu nhập liệu
            </button>
            <button onClick={() => fileInputRef.current.click()} className="btn-cancel" style={{ 
              borderColor: 'var(--cyan)', 
              color: 'var(--cyan)', 
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 13
            }}>
              <i className="ti ti-upload" style={{ marginRight: 6 }}></i> Up file hàng loạt
            </button>
            <input type="file" accept=".xlsx, .xls, .csv" style={{ display: 'none' }} ref={fileInputRef} onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                addMultipleLeads(data);
              };
              reader.readAsBinaryString(file);
            }} />
            <button onClick={handleOpenAddModal} className="btn-submit" style={{ 
              padding: '8px 20px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center'
            }}>
              <i className="ti ti-plus" style={{ marginRight: 6 }}></i> Thêm Lead
            </button>
          </div>
        </div>
      </div>

      <div className="dash-kpi-grid" style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Tổng cộng" value={leadsTotal.toLocaleString()} sub="Tất cả nguồn lead" colorClass="lime" />
        <KpiCard label="Tỉ lệ Chốt" value="12%" sub="Trung bình hệ thống" colorClass="amber" />
        <KpiCard label="Chi phí / Lead" value="45.000đ" sub="Theo Marketing" colorClass="cyan" />
        <KpiCard label="Đang Chăm Sóc" value="142" sub="Sales đang xử lý" colorClass="purple" />
      </div>

      <div className="filter-bar" style={{ 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 12, 
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
          <input 
            className="filter-input" 
            placeholder="Tìm theo tên, SĐT, mã lead..." 
            style={{ paddingLeft: 36, width: '100%', margin: 0 }}
            value={localSearch} 
            onChange={e => setLocalSearch(e.target.value)} 
          />
        </div>
        
        <select className="filter-select" style={{ width: 160, margin: 0 }} value={leadsFilterStatus} onChange={e => setLeadsFilterStatus(e.target.value)}>
          <option value="">-- Trạng thái --</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="filter-select" style={{ width: 160, margin: 0 }} value={leadsFilterSource} onChange={e => setLeadsFilterSource(e.target.value)}>
          <option value="">-- Nguồn --</option>
          {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {hasActiveFilters && (
          <button onClick={clearFilters} style={{ background: 'transparent', border: 'none', color: 'var(--red)', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
             XÓA LỌC
          </button>
        )}

        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 'auto' }}>
          {isFetching ? '⏳ Đang tải...' : `Hiển thị ${leads.length} / ${leadsTotal}`}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 80 }}>Thao tác</th>
              <th onClick={() => handleSort('Mã lead')} style={{ cursor: 'pointer' }}>Mã Lead <i className="ti ti-exchange-vertical" style={{ fontSize: 10, marginLeft: 4 }}></i></th>
              <th onClick={() => handleSort('Họ tên')} style={{ cursor: 'pointer' }}>Họ Tên</th>
              <th>SĐT</th>
              <th>Nguồn</th>
              <th>Chiến dịch</th>
              <th>Trạng thái</th>
              <th>Sales phụ trách</th>
              <th>Ngày nhận</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr key={index}>
                <td>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => handleOpenEditModal(lead)} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', padding: 4 }} title="Sửa"><i className="ti ti-pencil" style={{ fontSize: 16 }}></i></button>
                    <button onClick={() => { if(window.confirm('Xóa lead?')) deleteLead(lead['Mã lead']) }} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 4 }} title="Xóa"><i className="ti ti-trash" style={{ fontSize: 16 }}></i></button>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{lead['Mã lead']}</td>
                <td style={{ fontWeight: 700 }}>{lead['Họ tên']}</td>
                <td style={{ color: 'var(--cyan)', fontWeight: 600 }}>{formatPhone(lead['SĐT (đầy đủ)'] || lead['SĐT (ẩn)'])}</td>
                <td><span style={{ fontSize: 11, opacity: 0.8 }}>{lead['Nguồn']}</span></td>
                <td>{lead['Chiến dịch']}</td>
                <td>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                    border: '1px solid currentColor',
                    background: lead['Trạng thái'] === 'ĐÃ CHỐT' ? 'rgba(0, 255, 127, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: lead['Trạng thái'] === 'ĐÃ CHỐT' ? '#00ff7f' : lead['Trạng thái'] === 'MỚI TIẾP NHẬN' ? '#ccff00' : '#8b92a5'
                  }}>
                    {lead['Trạng thái']}
                  </span>
                </td>
                <td>{lead['Sales phụ trách'] || <span style={{ color: 'var(--red)', fontSize: 10 }}>Chưa phân công</span>}</td>
                <td>{lead['Ngày nhận']?.substring(0, 10)}</td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead['Ghi chú']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32, flexWrap: 'wrap' }}>
          <button 
            onClick={() => setLeadsPage(Math.max(1, leadsPage - 1))} 
            disabled={leadsPage === 1} 
            className="btn-page"
            style={{ padding: '8px 12px' }}
          >
            <i className="ti ti-angle-left"></i>
          </button>
          
          {(() => {
            const pages = [];
            const showRange = 1; // Number of pages to show around current page
            
            // Always show first page
            pages.push(
              <button 
                key={1} 
                onClick={() => setLeadsPage(1)} 
                className={`btn-page ${leadsPage === 1 ? 'active' : ''}`}
              >
                1
              </button>
            );
            
            if (leadsPage > showRange + 2) {
              pages.push(<span key="dots-1" style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>);
            }
            
            // Show pages around current
            for (let i = Math.max(2, leadsPage - showRange); i <= Math.min(totalPages - 1, leadsPage + showRange); i++) {
              pages.push(
                <button 
                  key={i} 
                  onClick={() => setLeadsPage(i)} 
                  className={`btn-page ${leadsPage === i ? 'active' : ''}`}
                >
                  {i}
                </button>
              );
            }
            
            if (leadsPage < totalPages - showRange - 1) {
              pages.push(<span key="dots-2" style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>);
            }
            
            // Always show last page
            if (totalPages > 1) {
              pages.push(
                <button 
                  key={totalPages} 
                  onClick={() => setLeadsPage(totalPages)} 
                  className={`btn-page ${leadsPage === totalPages ? 'active' : ''}`}
                >
                  {totalPages}
                </button>
              );
            }
            
            return pages;
          })()}
          
          <button 
            onClick={() => setLeadsPage(Math.min(totalPages, leadsPage + 1))} 
            disabled={leadsPage === totalPages} 
            className="btn-page"
            style={{ padding: '8px 12px' }}
          >
            <i className="ti ti-angle-right"></i>
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: 700 }}>
            <SectionHead label={isEditMode ? 'Chỉnh sửa Lead' : 'Thêm Lead mới'} icon="ti-user" />
            <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Họ tên</label>
                  <input required className="input-field" value={formData['Họ tên']} onChange={e => setFormData({ ...formData, 'Họ tên': e.target.value })} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Số điện thoại</label>
                  <input required className="input-field" value={formData['SĐT (đầy đủ)']} onChange={e => setFormData({ ...formData, 'SĐT (đầy đủ)': e.target.value })} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Nguồn</label>
                  <select className="input-field" value={formData['Nguồn']} onChange={e => setFormData({ ...formData, 'Nguồn': e.target.value })}>
                    <option value="">Chọn nguồn</option>
                    {SOURCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Trạng thái</label>
                  <select className="input-field" value={formData['Trạng thái']} onChange={e => setFormData({ ...formData, 'Trạng thái': e.target.value })}>
                    {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ghi chú</label>
                  <textarea className="input-field" style={{ height: 80, padding: 12 }} value={formData['Ghi chú']} onChange={e => setFormData({ ...formData, 'Ghi chú': e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-submit">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;
