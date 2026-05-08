import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';

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
    itemsPerPage,
    marketing,
    addLead,
    editLead,
    deleteLead,
    addMultipleLeads,
    updateLeads,
    sales,
    staff
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const fileInputRef = useRef(null);

  // --- FILTER STATE ---
  // --- FILTER STATE ---
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterAgency, setFilterAgency] = useState('');
  const [filterSales, setFilterSales] = useState('');
  const [currentPage, setCurrentPage] = useState(leadsPage);
  const [sortConfig, setSortConfig] = useState({ key: 'Ngày nhận', direction: 'desc' });

  // Debounced Search Logic
  const [localSearch, setLocalSearch] = useState(leadsSearch);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== leadsSearch) {
        setLeadsSearch(localSearch);
        setLeadsPage(1);
      }
    }, 500); // 500ms delay
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Sync local search when global search is cleared (e.g. via Xóa lọc)
  useEffect(() => {
    setLocalSearch(leadsSearch);
  }, [leadsSearch]);

  // Unique values - ideally these should come from server, but using local slice as fallback
  const uniqueStatuses = [...new Set(leads.map(l => l['Trạng thái']).filter(Boolean))];
  const uniqueSources = [...new Set(leads.map(l => l['Nguồn']).filter(Boolean))];
  const uniqueAgencies = [...new Set(leads.map(l => l['Tên sàn']).filter(Boolean))];
  const uniqueSalesNames = [...new Set(leads.map(l => l['Sales phụ trách']).filter(Boolean))];

  const handleSort = (key) => {
    // Map UI keys to DB columns
    const keyMap = {
      'Mã lead': 'ma_lead', 'Họ tên': 'ho_ten', 'SĐT (đầy đủ)': 'sdt',
      'Ngày nhận': 'ngay_nhan', 'Trạng thái': 'trang_thai'
    };
    const dbKey = keyMap[key] || 'ngay_nhan';
    setLeadsSort({ column: dbKey, ascending: leadsSort.column === dbKey ? !leadsSort.ascending : false });
  };

  // Pagination Logic
  const currentLeads = leads; // Already paginated from server
  const totalPages = Math.ceil(leadsTotal / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setLeadsPage(pageNumber);
  };

  const hasActiveFilters = leadsSearch || filterStatus || filterSource || filterAgency || filterSales;
  const clearFilters = () => { setLeadsSearch(''); setFilterStatus(''); setFilterSource(''); setFilterAgency(''); setFilterSales(''); };

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
        toast.error(`Số điện thoại này bị trùng với Lead: ${duplicateLead['Mã lead']} - ${duplicateLead['Họ tên']}`);
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
      if (fileInputRef.current) fileInputRef.current.value = ""; // reset input
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

          <select
            className="filter-select"
            style={{ width: '180px', margin: 0 }}
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={e => {
              const [key, dir] = e.target.value.split('-');
              setSortConfig({ key, direction: dir });
            }}
          >
            <option value="Ngày nhận-desc">Mới nhất lên đầu</option>
            <option value="Ngày nhận-asc">Cũ nhất lên đầu</option>
            <option value="Họ tên-asc">Họ tên (A-Z)</option>
            <option value="Họ tên-desc">Họ tên (Z-A)</option>
            <option value="Ngày nhận-desc">Ngày nhận (Mới nhất)</option>
          </select>
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
        <input className="filter-input" placeholder="🔍 Tìm tên, SĐT, mã lead, mã NV..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
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
        <span className="filter-count">Tổng cộng: <strong>{leadsTotal}</strong> lead</span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Thao tác</th>
              <th onClick={() => handleSort('Mã lead')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Mã Lead {leadsSort.column === 'ma_lead' ? (leadsSort.ascending ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Họ tên')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Họ Tên {sortConfig.key === 'Họ tên' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('SĐT (đầy đủ)')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                SĐT {sortConfig.key === 'SĐT (đầy đủ)' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Nguồn')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Nguồn {sortConfig.key === 'Nguồn' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Chiến dịch')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Chiến dịch {sortConfig.key === 'Chiến dịch' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Nhu cầu')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Nhu cầu {sortConfig.key === 'Nhu cầu' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Trạng thái')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Trạng thái {sortConfig.key === 'Trạng thái' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Sales phụ trách')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Sales phụ trách {sortConfig.key === 'Sales phụ trách' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Mã NV')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Mã NV {sortConfig.key === 'Mã NV' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Tên sàn')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Tên sàn {sortConfig.key === 'Tên sàn' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Ngày nhận')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Ngày nhận {sortConfig.key === 'Ngày nhận' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Ngày FU')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Ngày Follow up {sortConfig.key === 'Ngày FU' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Ngày hẹn')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Ngày hẹn {sortConfig.key === 'Ngày hẹn' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th>Ghi chú</th>
              <th onClick={() => handleSort('Lần cập nhật cuối')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Cập nhật cuối {sortConfig.key === 'Lần cập nhật cuối' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th>Người cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.map((lead, index) => (
              <tr key={index}>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleOpenEditModal(lead)} className="btn-edit">Sửa</button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa Lead ${lead['Họ tên']}?`)) {
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
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: 
                      lead['Trạng thái'] === 'ĐÃ CHỐT' ? 'rgba(0, 204, 102, 0.2)' :
                      lead['Trạng thái'] === 'ĐÃ LIÊN HỆ' ? 'rgba(0, 229, 255, 0.2)' :
                      lead['Trạng thái'] === 'MỚI TIẾP NHẬN' ? 'rgba(204, 255, 0, 0.2)' :
                      lead['Trạng thái'] === 'TIỀM NĂNG' ? 'rgba(179, 102, 255, 0.2)' :
                      lead['Trạng thái'] === 'ĐÃ CỌC' ? 'rgba(255, 204, 0, 0.2)' :
                      lead['Trạng thái'] === 'KHÔNG NHU CẦU' ? 'rgba(255, 77, 148, 0.2)' : 'rgba(139, 146, 165, 0.2)',
                    color: 
                      lead['Trạng thái'] === 'ĐÃ CHỐT' ? '#00cc66' :
                      lead['Trạng thái'] === 'ĐÃ LIÊN HỆ' ? '#00e5ff' :
                      lead['Trạng thái'] === 'MỚI TIẾP NHẬN' ? '#ccff00' :
                      lead['Trạng thái'] === 'TIỀM NĂNG' ? '#b366ff' :
                      lead['Trạng thái'] === 'ĐÃ CỌC' ? '#ffcc00' :
                      lead['Trạng thái'] === 'KHÔNG NHU CẦU' ? '#ff4d94' : '#8b92a5',
                    fontSize: '11px',
                    fontWeight: '800',
                    border: '1px solid currentColor',
                    display: 'inline-block',
                    whiteSpace: 'nowrap'
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', marginBottom: '40px' }}>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Trái
          </button>

          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            if (totalPages > 7) {
              if (pageNum !== 1 && pageNum !== totalPages && (pageNum < currentPage - 1 || pageNum > currentPage + 1)) {
                if (pageNum === 2 && currentPage > 3) return <span key="dots1" style={{ color: 'var(--text-muted)' }}>...</span>;
                if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key="dots2" style={{ color: 'var(--text-muted)' }}>...</span>;
                if (pageNum < 2 || pageNum > totalPages - 1) return null;
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
            disabled={currentPage === totalPages}
            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Phải
          </button>
        </div>
      )}

      {duplicateWarning && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '500px' }}>
            <h2 className="modal-title" style={{ color: 'var(--warning)' }}>⚠ Cảnh báo trùng lặp</h2>
            <p style={{ marginBottom: '20px' }}>
              Hệ thống phát hiện có một số Lead trong file tải lên bị trùng mã (Mã lead) với dữ liệu hiện tại.
              <br /><br />
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
                  <input required disabled className="input-field" value={formData['Mã lead']} onChange={e => setFormData({ ...formData, 'Mã lead': e.target.value })} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }} />
                </div>
                <div className="form-group">
                  <label>Họ tên</label>
                  <input required className="input-field" value={formData['Họ tên']} onChange={e => setFormData({ ...formData, 'Họ tên': e.target.value })} placeholder="Nguyễn Văn A" />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input required className="input-field" value={formData['SĐT (đầy đủ)']} onChange={e => setFormData({ ...formData, 'SĐT (đầy đủ)': e.target.value })} placeholder="0901234567" />
                </div>
                <div className="form-group">
                  <label>Nguồn</label>
                  <input className="input-field" value={formData['Nguồn']} onChange={e => setFormData({ ...formData, 'Nguồn': e.target.value })} placeholder="Facebook Ads" />
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
                  <input className="input-field" value={formData['Nhu cầu']} onChange={e => setFormData({ ...formData, 'Nhu cầu': e.target.value })} placeholder="2PN, view biển" />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select className="input-field" value={formData['Trạng thái']} onChange={e => setFormData({ ...formData, 'Trạng thái': e.target.value })}>
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
                  <input type="date" className="input-field" value={formData['Ngày nhận']} onChange={e => setFormData({ ...formData, 'Ngày nhận': e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Ngày Follow Up</label>
                  <input type="date" className="input-field" value={formData['Ngày FU']} onChange={e => setFormData({ ...formData, 'Ngày FU': e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Ngày hẹn</label>
                  <input type="date" className="input-field" value={formData['Ngày hẹn']} onChange={e => setFormData({ ...formData, 'Ngày hẹn': e.target.value })} />
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
                  <input className="input-field" value={formData['Ghi chú']} onChange={e => setFormData({ ...formData, 'Ghi chú': e.target.value })} placeholder="Ghi chú thêm..." />
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
