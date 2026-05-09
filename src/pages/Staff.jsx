import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';
import { 
  KpiCard, SectionHead, fmt 
} from '../components/VisualLanguage';

function Staff() {
  const { staff, addStaff, editStaff, deleteStaff } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- FILTER STATE ---
  const [searchText, setSearchText] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatusF, setFilterStatusF] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [sortConfig, setSortConfig] = useState({ key: 'Mã NV', direction: 'asc' });

  const uniqueDepts = [...new Set(staff.map(s => s['Sàn']).filter(Boolean))];
  const uniqueStatuses = [...new Set(staff.map(s => s['Trạng thái']).filter(Boolean))];

  // --- KPI CALCULATIONS ---
  const activeStaff = staff.filter(s => s['Trạng thái'] === 'Đang làm việc').length;
  const totalPayroll = staff.reduce((sum, s) => sum + Number(s['Lương (VNĐ)'] || 0), 0);

  const filteredStaff = staff.filter(s => {
    const text = searchText.toLowerCase().trim();
    if (text && !(
      String(s['Mã NV'] || '').toLowerCase().includes(text) ||
      String(s['Tên NV'] || '').toLowerCase().includes(text) ||
      String(s['SĐT'] || '').includes(text) ||
      String(s['Email'] || '').toLowerCase().includes(text) ||
      String(s['Chức vụ'] || '').toLowerCase().includes(text)
    )) return false;
    if (filterDept && s['Sàn'] !== filterDept) return false;
    if (filterStatusF && s['Trạng thái'] !== filterStatusF) return false;
    return true;
  }).sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    if (['Lương (VNĐ)'].includes(sortConfig.key)) {
      aValue = Number(aValue || 0);
      bValue = Number(bValue || 0);
    } else {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    }
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const clearFilters = () => { setSearchText(''); setFilterDept(''); setFilterStatusF(''); };
  
  const initialFormState = {
    'Mã NV': '', 'Tên NV': '', 'Sàn': '', 'Chức vụ': 'Sale',
    'SĐT': '', 'Email': '', 'Ngày vào làm': new Date().toISOString().slice(0, 10),
    'Trạng thái': 'Đang làm việc', 'Lương (VNĐ)': 0, 'Quản lý (Mã NV)': '', 'Quyền': 'Sales'
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormData({ ...initialFormState, 'Mã NV': `NV${staff.length + 101}` });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setIsEditMode(true);
    setFormData({ ...member });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) editStaff(formData);
    else addStaff(formData);
    setIsModalOpen(false);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Quản lý Nhân sự</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Danh sách nhân viên và sơ đồ tổ chức Blanca CRM</p>
          </div>
          <button onClick={handleOpenAddModal} className="btn-submit" style={{ padding: '8px 24px' }}>
            + Thêm Nhân viên
          </button>
        </div>
      </div>

      <div className="dash-kpi-grid" style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Tổng Nhân Sự" value={staff.length.toString()} sub="Toàn hệ thống" colorClass="lime" />
        <KpiCard label="Đang làm việc" value={activeStaff.toString()} sub={`${staff.length - activeStaff} đã nghỉ`} colorClass="cyan" />
        <KpiCard label="Tổng Quỹ Lương" value={fmt(totalPayroll)} sub="Lương cứng / Tháng" colorClass="purple" />
        <KpiCard label="Sàn / Đại lý" value={uniqueDepts.length.toString()} sub="Đơn vị liên kết" colorClass="amber" />
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
        <div style={{ position: 'relative', flex: 1 }}>
          <i className="ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
          <input className="filter-input" placeholder="Tìm tên, mã NV, chức vụ..." style={{ paddingLeft: 36, width: '100%', margin: 0 }} value={searchText} onChange={e => setSearchText(e.target.value)} />
        </div>
        <select className="filter-select" style={{ width: 180, margin: 0 }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">-- Tất cả Sàn --</option>
          {uniqueDepts.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" style={{ width: 150, margin: 0 }} value={filterStatusF} onChange={e => setFilterStatusF(e.target.value)}>
          <option value="">-- Trạng thái --</option>
          {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(searchText || filterDept || filterStatusF) && (
          <button onClick={clearFilters} style={{ background: 'transparent', border: 'none', color: 'var(--red)', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>XÓA LỌC</button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 100 }}>Thao tác</th>
              <th>Mã NV</th>
              <th>Họ Tên</th>
              <th>Sàn / Đại lý</th>
              <th>Chức vụ</th>
              <th>SĐT</th>
              <th>Trạng thái</th>
              <th>Quyền</th>
              <th>Lương (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {currentStaff.map((member, index) => (
              <tr key={index}>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleOpenEditModal(member)} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer' }}><i className="ti-pencil"></i></button>
                    <button onClick={() => { if(window.confirm('Xóa nhân viên?')) deleteStaff(member['Mã NV']) }} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}><i className="ti-trash"></i></button>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{member['Mã NV']}</td>
                <td style={{ fontWeight: 700 }}>{member['Tên NV']}</td>
                <td>{member['Sàn']}</td>
                <td><span style={{ fontSize: 12 }}>{member['Chức vụ']}</span></td>
                <td style={{ color: 'var(--cyan)' }}>{member['SĐT']}</td>
                <td>
                  <span style={{ 
                    padding: '2px 10px', borderRadius: 4, fontSize: 10, fontWeight: 800,
                    border: '1px solid currentColor',
                    background: member['Trạng thái'] === 'Đang làm việc' ? 'rgba(0, 204, 102, 0.1)' : 'rgba(255, 77, 148, 0.1)',
                    color: member['Trạng thái'] === 'Đang làm việc' ? '#00cc66' : '#ff4d94'
                  }}>
                    {member['Trạng thái']}
                  </span>
                </td>
                <td><span style={{ color: 'var(--accent)', fontSize: 11 }}>{member['Quyền']}</span></td>
                <td style={{ fontWeight: 700 }}>{fmt(member['Lương (VNĐ)'] || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="btn-page">Trước</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i+1)} className={`btn-page ${currentPage === i+1 ? 'active' : ''}`}>{i+1}</button>
          ))}
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="btn-page">Sau</button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: 600 }}>
            <SectionHead label={isEditMode ? 'Chỉnh sửa Nhân viên' : 'Thêm Nhân viên'} icon="ti-id-badge" />
            <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Mã NV</label>
                  <input required disabled={isEditMode} className="input-field" value={formData['Mã NV']} onChange={e => setFormData({...formData, 'Mã NV': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Họ tên</label>
                  <input required className="input-field" value={formData['Tên NV']} onChange={e => setFormData({...formData, 'Tên NV': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Sàn</label>
                  <input required className="input-field" value={formData['Sàn']} onChange={e => setFormData({...formData, 'Sàn': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Chức vụ</label>
                  <input className="input-field" value={formData['Chức vụ']} onChange={e => setFormData({...formData, 'Chức vụ': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>SĐT</label>
                  <input required className="input-field" value={formData['SĐT']} onChange={e => setFormData({...formData, 'SĐT': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="input-field" value={formData['Email']} onChange={e => setFormData({...formData, 'Email': e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-submit">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;
