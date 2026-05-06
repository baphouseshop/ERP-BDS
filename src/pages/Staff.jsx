import React, { useState } from 'react';
import { useData } from '../context/DataContext';

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

  const uniqueDepts = [...new Set(staff.map(s => s['Sàn']).filter(Boolean))];
  const uniqueStatuses = [...new Set(staff.map(s => s['Trạng thái']).filter(Boolean))];

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
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const hasActiveFilters = searchText || filterDept || filterStatusF;
  const clearFilters = () => { setSearchText(''); setFilterDept(''); setFilterStatusF(''); };
  
  const initialFormState = {
    'Mã NV': '',
    'Tên NV': '',
    'Sàn': '',
    'Chức vụ': '',
    'SĐT': '',
    'Email': '',
    'Ngày vào làm': '',
    'Trạng thái': 'Active',
    'Lương (VNĐ)': 0,
    'Quản lý (Mã NV)': ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setIsEditMode(true);
    setFormData({
      'Mã NV': member['Mã NV'] || '',
      'Tên NV': member['Tên NV'] || '',
      'Sàn': member['Sàn'] || '',
      'Chức vụ': member['Chức vụ'] || '',
      'SĐT': member['SĐT'] || '',
      'Email': member['Email'] || '',
      'Ngày vào làm': member['Ngày vào làm'] || '',
      'Trạng thái': member['Trạng thái'] || 'Active',
      'Lương (VNĐ)': member['Lương (VNĐ)'] || 0,
      'Quản lý (Mã NV)': member['Quản lý (Mã NV)'] || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditMode) {
      if (formData['SĐT'] && staff.some(s => s['Mã NV'] !== formData['Mã NV'] && s['SĐT'] === formData['SĐT'])) {
        alert('Số điện thoại này đã được sử dụng cho một nhân viên khác!');
        return;
      }
      if (formData['Email'] && staff.some(s => s['Mã NV'] !== formData['Mã NV'] && s['Email'] === formData['Email'])) {
        alert('Email này đã được sử dụng cho một nhân viên khác!');
        return;
      }
      editStaff(formData);
    } else {
      if (staff.some(s => s['Mã NV'] === formData['Mã NV'])) {
        alert('Mã nhân viên đã tồn tại!');
        return;
      }
      if (formData['SĐT'] && staff.some(s => s['SĐT'] === formData['SĐT'])) {
        alert('Số điện thoại này đã tồn tại trong hệ thống!');
        return;
      }
      if (formData['Email'] && staff.some(s => s['Email'] === formData['Email'])) {
        alert('Email này đã tồn tại trong hệ thống!');
        return;
      }
      addStaff(formData);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quản lý Nhân sự</h1>
          <p style={{ color: 'var(--text-muted)' }}>Quản lý danh sách nhân viên, thông tin liên hệ và đại lý.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-submit">
          + Thêm Nhân viên
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <input className="filter-input" placeholder="🔍 Tìm theo tên, mã NV, SĐT, email..." value={searchText} onChange={e => setSearchText(e.target.value)} />
        <select className="filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">-- Sàn / Phòng ban --</option>
          {uniqueDepts.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterStatusF} onChange={e => setFilterStatusF(e.target.value)}>
          <option value="">-- Trạng thái --</option>
          {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasActiveFilters && <button className="btn-clear-filter" onClick={clearFilters}>✕ Xóa lọc</button>}
        <span className="filter-count">Hiển thị <strong>{filteredStaff.length}</strong>/{staff.length}</span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Thao tác</th>
              <th>Mã NV</th>
              <th>Họ Tên</th>
              <th>Sàn / Đại lý</th>
              <th>Chức vụ</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>Ngày vào làm</th>
              <th>Trạng thái</th>
              <th>Lương (VNĐ)</th>
              <th>Quản lý</th>
            </tr>
          </thead>
          <tbody>
            {currentStaff.map((member, index) => (
              <tr key={index}>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleOpenEditModal(member)} className="btn-edit">Sửa</button>
                    <button 
                      onClick={() => {
                        if(window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${member['Tên NV']}?`)) {
                          deleteStaff(member['Mã NV']);
                        }
                      }} 
                      className="btn-cancel" 
                      style={{ padding: '2px 8px', fontSize: '12px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    >Xóa</button>
                  </div>
                </td>
                <td style={{ fontWeight: 'bold' }}>{member['Mã NV']}</td>
                <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{member['Tên NV']}</td>
                <td>{member['Sàn']}</td>
                <td>{member['Chức vụ']}</td>
                <td>{member['SĐT']}</td>
                <td>{member['Email']}</td>
                <td>{member['Ngày vào làm'] ? member['Ngày vào làm'].split('-').reverse().join('/') : ''}</td>
                <td>
                  <span style={{ 
                    color: member['Trạng thái'] === 'Active' ? 'var(--success)' : 'var(--danger)', 
                    fontWeight: 'bold', 
                    fontSize: '12px' 
                  }}>{member['Trạng thái']}</span>
                </td>
                <td>{Number(member['Lương (VNĐ)'] || 0).toLocaleString()} đ</td>
                <td>{member['Quản lý (Mã NV)']}</td>
              </tr>
            ))}
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Chưa có dữ liệu nhân sự.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', marginBottom: '40px' }}>
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Trang trước
          </button>
          
          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            if (totalPages > 7) {
              if (pageNum !== 1 && pageNum !== totalPages && (pageNum < currentPage - 1 || pageNum > currentPage + 1)) {
                if (pageNum === 2 && currentPage > 3) return <span key="dots1" style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>...</span>;
                if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key="dots2" style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>...</span>;
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
                  color: currentPage === pageNum ? '#fff' : 'var(--text-main)',
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
            Trang sau
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="modal-title">{isEditMode ? 'Chỉnh sửa Nhân viên' : 'Thêm Nhân viên mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mã nhân viên *</label>
                  <input required disabled={isEditMode} className="input-field" value={formData['Mã NV']} onChange={e => setFormData({...formData, 'Mã NV': e.target.value})} placeholder="VD: GH001" style={isEditMode ? {backgroundColor: 'var(--bg-tertiary)'} : {}} />
                </div>
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input required className="input-field" value={formData['Tên NV']} onChange={e => setFormData({...formData, 'Tên NV': e.target.value})} placeholder="Nguyễn Văn A" />
                </div>
                <div className="form-group">
                  <label>Sàn / Đại lý *</label>
                  <input required className="input-field" value={formData['Sàn']} onChange={e => setFormData({...formData, 'Sàn': e.target.value})} placeholder="Đại lý F1" />
                </div>
                <div className="form-group">
                  <label>Chức vụ</label>
                  <input className="input-field" value={formData['Chức vụ']} onChange={e => setFormData({...formData, 'Chức vụ': e.target.value})} placeholder="VD: Sales Agent, Manager" />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input required type="tel" className="input-field" value={formData['SĐT']} onChange={e => setFormData({...formData, 'SĐT': e.target.value})} placeholder="0901234567" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="input-field" value={formData['Email']} onChange={e => setFormData({...formData, 'Email': e.target.value})} placeholder="email@blanca.vn" />
                </div>
                <div className="form-group">
                  <label>Ngày vào làm</label>
                  <input type="date" className="input-field" value={formData['Ngày vào làm']} onChange={e => setFormData({...formData, 'Ngày vào làm': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select className="input-field" value={formData['Trạng thái']} onChange={e => setFormData({...formData, 'Trạng thái': e.target.value})}>
                    <option value="Active">Hoạt động (Active)</option>
                    <option value="Inactive">Đã nghỉ (Inactive)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Lương cứng (VNĐ)</label>
                  <input type="number" className="input-field" value={formData['Lương (VNĐ)']} onChange={e => setFormData({...formData, 'Lương (VNĐ)': e.target.value})} placeholder="10000000" />
                </div>
                <div className="form-group">
                  <label>Người quản lý (Mã NV)</label>
                  <select className="input-field" value={formData['Quản lý (Mã NV)']} onChange={e => setFormData({...formData, 'Quản lý (Mã NV)': e.target.value})}>
                    <option value="">-- Không có --</option>
                    {staff.filter(s => s['Mã NV'] !== formData['Mã NV']).map((s, idx) => (
                      <option key={idx} value={s['Mã NV']}>{s['Mã NV']} - {s['Tên NV']}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-submit">{isEditMode ? 'Lưu thay đổi' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;
