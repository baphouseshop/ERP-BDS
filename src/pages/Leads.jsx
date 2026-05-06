import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';

function Leads() {
  const { leads, marketing, addLead, editLead, deleteLead, addMultipleLeads, updateLeads, sales, staff } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const fileInputRef = useRef(null);

  // --- FILTER STATE ---
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterAgency, setFilterAgency] = useState('');
  const [filterSales, setFilterSales] = useState('');

  // Unique values for dropdowns
  const uniqueStatuses = [...new Set(leads.map(l => l['Trạng thái']).filter(Boolean))];
  const uniqueSources = [...new Set(leads.map(l => l['Nguồn']).filter(Boolean))];
  const uniqueAgencies = [...new Set(leads.map(l => l['Tên sàn']).filter(Boolean))];
  const uniqueSalesNames = [...new Set(leads.map(l => l['Sales phụ trách']).filter(Boolean))];

  // Apply filters
  const filteredLeads = leads.filter(l => {
    const text = searchText.toLowerCase().trim();
    if (text && !(
      String(l['Mã lead'] || '').toLowerCase().includes(text) ||
      String(l['Họ tên'] || '').toLowerCase().includes(text) ||
      String(l['SĐT (đầy đủ)'] || '').includes(text) ||
      String(l['SĐT (ẩn)'] || '').includes(text) ||
      String(l['Sales phụ trách'] || '').toLowerCase().includes(text) ||
      String(l['_employee_id'] || '').toLowerCase().includes(text)
    )) return false;
    if (filterStatus && l['Trạng thái'] !== filterStatus) return false;
    if (filterSource && l['Nguồn'] !== filterSource) return false;
    if (filterAgency && l['Tên sàn'] !== filterAgency) return false;
    if (filterSales && l['Sales phụ trách'] !== filterSales) return false;
    return true;
  });

  const hasActiveFilters = searchText || filterStatus || filterSource || filterAgency || filterSales;
  const clearFilters = () => { setSearchText(''); setFilterStatus(''); setFilterSource(''); setFilterAgency(''); setFilterSales(''); };
  
  const formatPhone = (phone) => {
    if (!phone) return '';
    let p = phone.toString().trim();
    if (p.endsWith('.0')) p = p.slice(0, -2);
    if (!p.startsWith('0') && p.length > 0) p = '0' + p;
    return p;
  };

  const initialFormState = {
    'Mã lead': '',
    'Họ tên': '',
    'SĐT (đầy đủ)': '',
    'Nguồn': '',
    'Chiến dịch': '',
    'Nhu cầu': '',
    'Trạng thái': 'MỚI TIẾP NHẬN',
    'Ngày nhận': '',
    'Ngày FU': '',
    'Ngày hẹn': '',
    'Mã NV': '',
    'Tên sàn': '',
    'Sales phụ trách': '',
    'Ghi chú': ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const distributeLeads = () => {
    // Simple simulation of lead distribution
    const salesAgents = sales.map(s => s['Tên NV']);
    const updated = leads.map(lead => {
      if (lead['Ghi chú'] && lead['Ghi chú'].includes('Chưa phân công')) {
        const randomAgent = salesAgents[Math.floor(Math.random() * salesAgents.length)];
        return {
          ...lead,
          'Sales phụ trách': randomAgent,
          'Trạng thái': 'ĐÃ PHÂN CÔNG',
          'Ghi chú': 'Auto-distributed',
          'Lần cập nhật cuối': new Date().toLocaleString('vi-VN'),
          'Người cập nhật': 'Admin (Auto)'
        };
      }
      return lead;
    });
    updateLeads(updated);
  };

  const generateNextLeadId = (currentLeads) => {
    let maxNum = 0;
    currentLeads.forEach(lead => {
      if (lead['Mã lead']) {
        const match = lead['Mã lead'].match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
    });
    return `L${String(maxNum + 1).padStart(4, '0')}`;
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormData({
      ...initialFormState,
      'Mã lead': generateNextLeadId(leads),
      'Ngày nhận': new Date().toISOString().slice(0, 10), // Default to today
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

  const handleStaffChange = (e) => {
    const maNV = e.target.value;
    if (!maNV) {
       setFormData({ ...formData, 'Mã NV': '', 'Tên sàn': '', 'Sales phụ trách': '' });
       return;
    }
    const selectedStaff = staff.find(s => s['Mã NV'] === maNV);
    if (selectedStaff) {
      setFormData({
        ...formData,
        'Mã NV': maNV,
        'Tên sàn': selectedStaff['Sàn'],
        'Sales phụ trách': selectedStaff['Tên NV']
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for duplicate phone number
    const phone = formData['SĐT (đầy đủ)'];
    if (phone) {
      const isDuplicate = leads.some(l => 
        l['Mã lead'] !== formData['Mã lead'] && 
        (l['SĐT (đầy đủ)'] === phone || l['SĐT (ẩn)'].includes(phone.substring(0, 3))) // simplified check
      );
      // More robust check:
      const duplicateLead = leads.find(l => {
        if (l['Mã lead'] === formData['Mã lead']) return false;
        if (l['SĐT (đầy đủ)'] && formatPhone(l['SĐT (đầy đủ)']) === phone) return true;
        // if we only have hidden phone, checking exact match is hard, but we can check if it's identical hidden string. We will rely on full phone if possible.
        return false;
      });

      if (duplicateLead) {
        alert(`Số điện thoại này bị trùng với Lead: ${duplicateLead['Mã lead']} - ${duplicateLead['Họ tên']}`);
        return;
      }
    }
    
    const timestamp = new Date().toLocaleString('vi-VN');
    const updatedData = {
      ...formData,
      'Lần cập nhật cuối': timestamp,
      'Người cập nhật': 'Admin'
    };

    if (isEditMode) {
      const originalLead = leads.find(l => l['Mã lead'] === formData['Mã lead']);
      editLead({ ...originalLead, ...updatedData });
    } else {
      updatedData['Sales phụ trách'] = null;
      addLead(updatedData);
    }
    
    setIsModalOpen(false);
  };

  // --- Excel Import/Export Logic ---
  const handleDownloadTemplate = () => {
    const headers = ['Mã lead', 'Họ tên', 'SĐT (đầy đủ)', 'Nguồn', 'Chiến dịch', 'Nhu cầu', 'Trạng thái', 'Ngày nhận', 'Ngày FU', 'Ngày hẹn', 'Mã NV', 'Tên sàn', 'Ghi chú'];
    const sampleData = ['LD_SAMPLE_01', 'Nguyen Van A', '0901234567', 'Facebook Ads', 'Vinhomes Ocean Park', '2PN', 'MỚI TIẾP NHẬN', '2026-05-01', '', '', 'GH001', 'Sàn 1', 'Khách VIP'];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads_Template");
    XLSX.writeFile(wb, "BlancaCRM_Leads_Template.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      processImportedData(data);
      if(fileInputRef.current) fileInputRef.current.value = ""; // reset input
    };
    reader.readAsBinaryString(file);
  };

  const processImportedData = (data) => {
    const timestamp = new Date().toLocaleString('vi-VN');
    let maxNum = 0;
    leads.forEach(lead => {
      if (lead['Mã lead'] && lead['Mã lead'].startsWith('LD')) {
        const numPart = lead['Mã lead'].replace('LD', '');
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });

    const processedLeads = data.map(row => {
      let leadId = row['Mã lead'];
      if (!leadId) {
        maxNum++;
        leadId = `LD${String(maxNum).padStart(3, '0')}`;
      }
      return {
        'Mã lead': leadId,
        'Họ tên': row['Họ tên'] || 'Unknown',
        'SĐT (đầy đủ)': formatPhone(row['SĐT (đầy đủ)'] || row['SĐT (ẩn)'] || ''),
        'Nguồn': row['Nguồn'] || '',
        'Chiến dịch': row['Chiến dịch'] || '',
        'Nhu cầu': row['Nhu cầu'] || '',
        'Trạng thái': row['Trạng thái'] || 'MỚI TIẾP NHẬN',
        'Ngày nhận': row['Ngày nhận'] || new Date().toISOString().slice(0, 10),
        'Ngày FU': row['Ngày FU'] || '',
        'Ngày hẹn': row['Ngày hẹn'] || '',
        'Mã NV': row['Mã NV'] || '',
        'Tên sàn': row['Tên sàn'] || '',
        'Ghi chú': row['Ghi chú'] || '',
        'Lần cập nhật cuối': timestamp,
        'Người cập nhật': 'Admin (Import)'
      };
    });

    // Check for duplicates against existing leads
    const existingIds = new Set(leads.map(l => l['Mã lead']));
    const hasDuplicates = processedLeads.some(l => existingIds.has(l['Mã lead']));

    if (hasDuplicates) {
      setDuplicateWarning(processedLeads); // Trigger confirmation modal
    } else {
      addMultipleLeads(processedLeads);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Quản lý Lead</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleDownloadTemplate} className="btn-cancel" style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>
            ⬇ Tải File Mẫu
          </button>
          
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button onClick={() => fileInputRef.current.click()} className="btn-cancel" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
            ⬆ Nhập Dữ liệu
          </button>

          <button onClick={handleOpenAddModal} className="btn-submit">
            Thêm Lead
          </button>
          <button onClick={distributeLeads} className="btn-cancel" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            Chia Lead Tự Động
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <input className="filter-input" placeholder="🔍 Tìm tên, SĐT, mã lead, mã NV..." value={searchText} onChange={e => setSearchText(e.target.value)} />
        <select className="filter-select" value={filterSales} onChange={e => setFilterSales(e.target.value)}>
          <option value="">-- Sales --</option>
          {uniqueSalesNames.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">-- Trạng thái --</option>
          {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="">-- Nguồn --</option>
          {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterAgency} onChange={e => setFilterAgency(e.target.value)}>
          <option value="">-- Tên sàn --</option>
          {uniqueAgencies.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasActiveFilters && <button className="btn-clear-filter" onClick={clearFilters}>✕ Xóa lọc</button>}
        <span className="filter-count">Hiển thị <strong>{filteredLeads.length}</strong>/{leads.length}</span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Thao tác</th>
              <th>Mã Lead</th>
              <th>Họ Tên</th>
              <th>SĐT</th>
              <th>Nguồn</th>
              <th>Chiến dịch</th>
              <th>Nhu cầu</th>
              <th>Trạng thái</th>
              <th>Sales phụ trách</th>
              <th>Mã NV</th>
              <th>Tên sàn</th>
              <th>Ngày nhận</th>
              <th>Ngày Follow up</th>
              <th>Ngày hẹn</th>
              <th>Ghi chú</th>
              <th>Cập nhật cuối</th>
              <th>Người cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead, index) => (
              <tr key={index}>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleOpenEditModal(lead)} className="btn-edit">Sửa</button>
                    <button 
                      onClick={() => {
                        if(window.confirm(`Bạn có chắc chắn muốn xóa Lead ${lead['Họ tên']}?`)) {
                          deleteLead(lead['Mã lead']);
                        }
                      }} 
                      className="btn-cancel" 
                      style={{ padding: '2px 8px', fontSize: '12px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    >Xóa</button>
                  </div>
                </td>
                <td>{lead['Mã lead']}</td>
                <td style={{ fontWeight: 'bold' }}>{lead['Họ tên']}</td>
                <td style={{ fontWeight: 'bold' }}>{formatPhone(lead['SĐT (đầy đủ)'] || lead['SĐT (ẩn)'])}</td>
                <td>{lead['Nguồn']}</td>
                <td>{lead['Chiến dịch']}</td>
                <td>{lead['Nhu cầu']}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: lead['Trạng thái'] === 'ĐÃ LIÊN HỆ' ? 'var(--success)' :
                                   lead['Trạng thái'] === 'MỚI TIẾP NHẬN' ? 'var(--warning)' : 
                                   lead['Trạng thái'] === 'TỪ CHỐI' ? 'var(--danger)' : 'var(--accent)',
                    color: lead['Trạng thái'] === 'TỪ CHỐI' ? '#fff' : '#000',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {lead['Trạng thái']}
                  </span>
                </td>
                <td>{lead['Sales phụ trách'] || 'Chưa phân công'}</td>
                <td>{lead['Mã NV']}</td>
                <td>{lead['Tên sàn']}</td>
                <td>{lead['Ngày nhận'] ? lead['Ngày nhận'].substring(0, 10) : ''}</td>
                <td>{lead['Ngày FU'] ? lead['Ngày FU'].substring(0, 10) : ''}</td>
                <td>{lead['Ngày hẹn'] ? lead['Ngày hẹn'].substring(0, 10) : ''}</td>
                <td>{lead['Ghi chú']}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{lead['Lần cập nhật cuối'] || '-'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{lead['Người cập nhật'] || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {duplicateWarning && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '500px' }}>
            <h2 className="modal-title" style={{ color: 'var(--warning)' }}>⚠ Cảnh báo trùng lặp</h2>
            <p style={{ marginBottom: '20px' }}>
              Hệ thống phát hiện có một số Lead trong file tải lên bị trùng mã (Mã lead) với dữ liệu hiện tại.
              <br/><br/>
              Bạn có muốn <strong>Ghi đè</strong> để cập nhật dữ liệu cũ, hay <strong>Hủy</strong> để kiểm tra lại file?
            </p>
            <div className="modal-actions">
              <button onClick={() => setDuplicateWarning(null)} className="btn-cancel">Hủy (Cancel)</button>
              <button onClick={() => {
                addMultipleLeads(duplicateWarning);
                setDuplicateWarning(null);
              }} className="btn-submit" style={{ backgroundColor: 'var(--warning)', color: '#000' }}>
                Ghi đè & Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="modal-title">{isEditMode ? 'Chỉnh sửa Lead' : 'Thêm Lead mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mã Lead (Tự động)</label>
                  <input required disabled className="input-field" value={formData['Mã lead']} onChange={e => setFormData({...formData, 'Mã lead': e.target.value})} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }} />
                </div>
                <div className="form-group">
                  <label>Họ tên</label>
                  <input required className="input-field" value={formData['Họ tên']} onChange={e => setFormData({...formData, 'Họ tên': e.target.value})} placeholder="Nguyễn Văn A" />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input required className="input-field" value={formData['SĐT (đầy đủ)']} onChange={e => setFormData({...formData, 'SĐT (đầy đủ)': e.target.value})} placeholder="0901234567" />
                </div>
                <div className="form-group">
                  <label>Nguồn</label>
                  <input className="input-field" value={formData['Nguồn']} onChange={e => setFormData({...formData, 'Nguồn': e.target.value})} placeholder="Facebook Ads" />
                </div>
                <div className="form-group">
                  <label>Chiến dịch (Mã Campaign)</label>
                  <select 
                    className="input-field" 
                    value={formData['Chiến dịch']} 
                    onChange={e => {
                      const selectedCamp = marketing.find(m => m['Tên chiến dịch'] === e.target.value);
                      setFormData({
                        ...formData, 
                        'Chiến dịch': e.target.value,
                        '_campaign_id': selectedCamp ? selectedCamp['Tên chiến dịch'] : null // In this schema, campaign name is often used as ID
                      });
                    }}
                  >
                    <option value="">-- Tự do / Không có --</option>
                    {marketing.map((m, idx) => (
                      <option key={idx} value={m['Tên chiến dịch']}>{m['Tên chiến dịch']} ({m['Kênh']})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Nhu cầu</label>
                  <input className="input-field" value={formData['Nhu cầu']} onChange={e => setFormData({...formData, 'Nhu cầu': e.target.value})} placeholder="2PN, view biển" />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select className="input-field" value={formData['Trạng thái']} onChange={e => setFormData({...formData, 'Trạng thái': e.target.value})}>
                    <option value="MỚI TIẾP NHẬN">MỚI TIẾP NHẬN</option>
                    <option value="ĐÃ PHÂN CÔNG">ĐÃ PHÂN CÔNG</option>
                    <option value="ĐÃ LIÊN HỆ">ĐÃ LIÊN HỆ</option>
                    <option value="ĐÃ HẸN GẶP">ĐÃ HẸN GẶP</option>
                    <option value="ĐÃ CỌC">ĐÃ CỌC</option>
                    <option value="TỪ CHỐI">TỪ CHỐI</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày nhận</label>
                  <input type="date" className="input-field" value={formData['Ngày nhận']} onChange={e => setFormData({...formData, 'Ngày nhận': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Ngày Follow Up</label>
                  <input type="date" className="input-field" value={formData['Ngày FU']} onChange={e => setFormData({...formData, 'Ngày FU': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Ngày hẹn</label>
                  <input type="date" className="input-field" value={formData['Ngày hẹn']} onChange={e => setFormData({...formData, 'Ngày hẹn': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phân công Nhân sự (Mã NV)</label>
                  <select className="input-field" value={formData['Mã NV']} onChange={handleStaffChange}>
                    <option value="">-- Chưa phân công --</option>
                    {staff.map((s, idx) => (
                      <option key={idx} value={s['Mã NV']}>{s['Mã NV']} - {s['Tên NV']}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tên Sales (Tự động)</label>
                  <input disabled className="input-field" value={formData['Sales phụ trách'] || ''} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }} />
                </div>
                <div className="form-group">
                  <label>Sàn (Tự động)</label>
                  <input disabled className="input-field" value={formData['Tên sàn'] || ''} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Ghi chú</label>
                  <input className="input-field" value={formData['Ghi chú']} onChange={e => setFormData({...formData, 'Ghi chú': e.target.value})} placeholder="Ghi chú thêm..." />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-submit">{isEditMode ? 'Lưu thay đổi' : 'Tạo Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;
