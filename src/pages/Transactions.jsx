import React, { useState } from 'react';
import { useData } from '../context/DataContext';

function Transactions() {
  const { transactions, leads, staff, addTransaction, editTransaction, deleteTransaction } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- FILTER STATE ---
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [filterSales, setFilterSales] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [sortConfig, setSortConfig] = useState({ key: '_created_at', direction: 'desc' });

  const uniqueStatuses = [...new Set(transactions.map(t => t['Trạng thái']).filter(Boolean))];
  const uniqueZones = [...new Set(transactions.map(t => t['Phân khu']).filter(Boolean))];
  const uniqueSalesNames = [...new Set(transactions.map(t => t['Sales']).filter(Boolean))];

  const filteredTransactions = transactions.filter(t => {
    const text = searchText.toLowerCase().trim();
    if (text && !(
      String(t['Mã GD'] || '').toLowerCase().includes(text) ||
      String(t['Khách hàng'] || '').toLowerCase().includes(text) ||
      String(t['Sales'] || '').toLowerCase().includes(text) ||
      String(t['Mã nhân viên'] || '').toLowerCase().includes(text) ||
      String(t['Mã SP'] || '').toLowerCase().includes(text) ||
      String(t['Mã Lead'] || '').toLowerCase().includes(text)
    )) return false;
    if (filterStatus && t['Trạng thái'] !== filterStatus) return false;
    if (filterZone && t['Phân khu'] !== filterZone) return false;
    if (filterSales && t['Sales'] !== filterSales) return false;
    return true;
  }).sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle date sorting
    if (['_created_at', 'Ngày GD'].includes(sortConfig.key)) {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    } else if (['Giá (VNĐ)', 'Tiền cọc', 'Hoa hồng'].includes(sortConfig.key)) {
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const hasActiveFilters = searchText || filterStatus || filterZone || filterSales;
  const clearFilters = () => { setSearchText(''); setFilterStatus(''); setFilterZone(''); setFilterSales(''); };
  const [formData, setFormData] = useState({
    'Mã GD': '',
    'Ngày GD': '',
    'Mã Lead': '',
    'Mã SP': '',
    'Phân khu': '',
    'Giá (VNĐ)': '',
    'Tiền cọc': '',
    'Hoa hồng': '',
    'Mã nhân viên': '',
    'Sales': '',
    'Trạng thái': 'Đã đặt cọc',
    'Ghi chú': ''
  });

  const formatTy = (value) => {
    return (Number(value) / 1000000000).toFixed(2) + ' tỷ';
  };

  const formatTr = (value) => {
    return (Number(value) / 1000000).toFixed(1) + ' tr';
  };

  const handleNumberChange = (field, value) => {
    const rawValue = value.replace(/\D/g, '');
    setFormData(prev => ({...prev, [field]: rawValue}));
  };

  const displayNumber = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const handleStaffChange = (e) => {
    const maNV = e.target.value;
    const selectedStaff = staff.find(s => s['Mã NV'] === maNV);
    if (selectedStaff) {
      setFormData({
        ...formData,
        'Mã nhân viên': maNV,
        'Sales': selectedStaff['Tên NV']
      });
    } else {
      setFormData({
        ...formData,
        'Mã nhân viên': maNV,
        'Sales': ''
      });
    }
  };

  const handleOpenEditModal = (t) => {
    setIsEditMode(true);
    setFormData({
      'Mã GD': t['Mã GD'] || '',
      'Ngày GD': t['Ngày GD'] || '',
      'Mã Lead': t['Mã Lead'] || '',
      'Mã SP': t['Mã SP'] || '',
      'Phân khu': t['Phân khu'] || '',
      'Giá (VNĐ)': t['Giá (VNĐ)'] || '',
      'Tiền cọc': t['Tiền cọc'] || '',
      'Hoa hồng': t['Hoa hồng'] || '',
      'Mã nhân viên': t['Mã nhân viên'] || '',
      'Sales': t['Sales'] || '',
      'Trạng thái': t['Trạng thái'] || 'Đã đặt cọc',
      'Ghi chú': t['Ghi chú'] || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormData({
      'Mã GD': '',
      'Ngày GD': new Date().toISOString().slice(0, 10),
      'Mã Lead': '',
      'Mã SP': '',
      'Phân khu': '',
      'Giá (VNĐ)': '',
      'Tiền cọc': '',
      'Hoa hồng': '',
      'Mã nhân viên': '',
      'Sales': '',
      'Trạng thái': 'Đã đặt cọc',
      'Ghi chú': ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditMode && transactions.some(t => t['Mã GD'] === formData['Mã GD'])) {
       alert('Mã giao dịch này đã tồn tại trong hệ thống!');
       return;
    }
    // Also check for duplicate Mã SP to prevent selling the same product twice unless it was cancelled
    if (transactions.some(t => t['Mã SP'] === formData['Mã SP'] && t['Mã GD'] !== formData['Mã GD'] && t['Trạng thái'] !== 'Đã hủy')) {
       alert('Mã sản phẩm này đã được bán hoặc đặt cọc trong một giao dịch khác!');
       return;
    }
    
    if (isEditMode) {
      editTransaction(formData);
    } else {
      addTransaction(formData);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Giao dịch</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            className="filter-select" 
            style={{ width: '180px', margin: 0 }}
            value={`${sortConfig.key}-${sortConfig.direction}`} 
            onChange={e => {
              const [key, dir] = e.target.value.split('-');
              setSortConfig({ key, direction: dir });
            }}
          >
            <option value="_created_at-desc">Mới nhất lên đầu</option>
            <option value="_created_at-asc">Cũ nhất lên đầu</option>
            <option value="Khách hàng-asc">Khách hàng (A-Z)</option>
            <option value="Khách hàng-desc">Khách hàng (Z-A)</option>
            <option value="Ngày GD-desc">Ngày GD (Mới nhất)</option>
          </select>
          <button onClick={handleOpenAddModal} className="btn-submit">Thêm Giao dịch</button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <input className="filter-input" placeholder="🔍 Tìm khách hàng, mã GD, mã NV, mã Lead..." value={searchText} onChange={e => setSearchText(e.target.value)} />
        <select className="filter-select" value={filterSales} onChange={e => setFilterSales(e.target.value)}>
          <option value="">-- Sales --</option>
          {uniqueSalesNames.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">-- Trạng thái --</option>
          {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterZone} onChange={e => setFilterZone(e.target.value)}>
          <option value="">-- Phân khu --</option>
          {uniqueZones.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasActiveFilters && <button className="btn-clear-filter" onClick={clearFilters}>✕ Xóa lọc</button>}
        <span className="filter-count">Hiển thị <strong>{filteredTransactions.length}</strong>/{transactions.length}</span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Thao tác</th>
              <th onClick={() => handleSort('Mã GD')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Mã GD {sortConfig.key === 'Mã GD' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Khách hàng')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Khách hàng {sortConfig.key === 'Khách hàng' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Ngày GD')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Ngày {sortConfig.key === 'Ngày GD' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Mã SP')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Mã SP {sortConfig.key === 'Mã SP' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Phân khu')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Phân khu {sortConfig.key === 'Phân khu' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Giá (VNĐ)')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Giá HĐ {sortConfig.key === 'Giá (VNĐ)' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Tiền cọc')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Tiền cọc {sortConfig.key === 'Tiền cọc' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Hoa hồng')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Hoa hồng {sortConfig.key === 'Hoa hồng' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Trạng thái')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Trạng thái {sortConfig.key === 'Trạng thái' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Sales')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Sales {sortConfig.key === 'Sales' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th onClick={() => handleSort('Mã nhân viên')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Mã NV {sortConfig.key === 'Mã nhân viên' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
              </th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((t, index) => (
              <tr key={index}>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleOpenEditModal(t)} className="btn-edit">Sửa</button>
                    <button 
                      onClick={() => {
                        if(window.confirm(`Bạn có chắc chắn muốn xóa giao dịch ${t['Mã GD']}?`)) {
                          deleteTransaction(t['Mã GD']);
                        }
                      }} 
                      className="btn-cancel" 
                      style={{ padding: '2px 8px', fontSize: '12px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    >Xóa</button>
                  </div>
                </td>
                <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{t['Mã GD']}</td>
                <td style={{ fontWeight: 'bold', color: 'var(--cyan)' }}>{t['Khách hàng']}</td>
                <td>{t['Ngày GD']}</td>
                <td>{t['Mã SP']}</td>
                <td>
                  <span style={{
                    padding: '2px 8px', borderRadius: '12px', fontSize: '11px', border: '1px solid currentColor',
                    color: t['Phân khu'] === 'Sapphire' ? 'var(--cyan)' : t['Phân khu'] === 'Ruby' ? 'var(--pink)' : 'var(--success)'
                  }}>
                    {t['Phân khu']}
                  </span>
                </td>
                <td style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{formatTy(t['Giá (VNĐ)'])}</td>
                <td>{formatTr(t['Tiền cọc'])}</td>
                <td style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{formatTr(t['Hoa hồng'])}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    border: '1px solid currentColor',
                    color: (t['Trạng thái'] === 'Đã ký HĐMB' || t['Trạng thái'] === 'Completed') ? 'var(--accent)' : (t['Trạng thái'] === 'Đã đặt cọc' || t['Trạng thái'] === 'Đang giữ chỗ' || t['Trạng thái'] === 'Giữ chỗ') ? 'var(--cyan)' : 'var(--text-muted)',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {t['Trạng thái']}
                  </span>
                </td>
                <td style={{ fontWeight: 'bold' }}>{t['Sales']}</td>
                <td style={{ color: 'var(--text-muted)' }}>{t['Mã nhân viên']}</td>
                <td style={{ fontSize: '12px' }}>{t['Ghi chú']}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--text-muted)', paddingTop: '15px', borderBottom: 'none' }}>TỔNG {hasActiveFilters ? '(đã lọc)' : ''}</td>
              <td style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '15px', paddingTop: '15px', borderBottom: 'none' }}>
                {formatTy(filteredTransactions.reduce((sum, t) => sum + Number(t['Giá (VNĐ)'] || 0), 0))}
              </td>
              <td style={{ fontWeight: 'bold', paddingTop: '15px', borderBottom: 'none' }}>
                {formatTr(filteredTransactions.reduce((sum, t) => sum + Number(t['Tiền cọc'] || 0), 0))}
              </td>
              <td style={{ color: 'var(--warning)', fontWeight: 'bold', fontSize: '15px', paddingTop: '15px', borderBottom: 'none' }}>
                {formatTr(filteredTransactions.reduce((sum, t) => sum + Number(t['Hoa hồng'] || 0), 0))}
              </td>
              <td colSpan="3" style={{ borderBottom: 'none' }}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', marginBottom: '40px' }}>
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Trải
          </button>
          
          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            if (totalPages > 7) {
              if (pageNum !== 1 && pageNum !== totalPages && (pageNum < currentPage - 1 || pageNum > currentPage + 1)) {
                if (pageNum === 2 && currentPage > 3) return <span key="dots1" style={{ color: 'var(--text-muted)' }}>...</span>;
                if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key="dots2" style={{ color: 'var(--text-muted)' }}>...</span>;
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{isEditMode ? 'Chỉnh sửa Giao dịch' : 'Thêm Giao dịch mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mã Giao dịch</label>
                  <input required disabled={isEditMode} className="input-field" value={formData['Mã GD']} onChange={e => setFormData({...formData, 'Mã GD': e.target.value})} placeholder="GD007" />
                </div>
                <div className="form-group">
                  <label>Khách hàng (Mã Lead)</label>
                  <select required className="input-field" value={formData['Mã Lead']} onChange={e => setFormData({...formData, 'Mã Lead': e.target.value})}>
                    <option value="">-- Chọn Khách hàng --</option>
                    {leads.map((l, idx) => (
                      <option key={idx} value={l['Mã lead']}>{l['Mã lead']} - {l['Họ tên']}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày Giao dịch</label>
                  <input required type="date" className="input-field" value={formData['Ngày GD']} onChange={e => setFormData({...formData, 'Ngày GD': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Mã Sản phẩm</label>
                  <input required className="input-field" value={formData['Mã SP']} onChange={e => setFormData({...formData, 'Mã SP': e.target.value})} placeholder="VIN-X123" />
                </div>
                <div className="form-group">
                  <label>Phân khu</label>
                  <select className="input-field" value={formData['Phân khu']} onChange={e => setFormData({...formData, 'Phân khu': e.target.value})}>
                    <option value="">Chọn phân khu</option>
                    <option value="Sapphire">Sapphire</option>
                    <option value="Ruby">Ruby</option>
                    <option value="Diamond">Diamond</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá Hợp đồng (VNĐ)</label>
                  <input required type="text" className="input-field" value={displayNumber(formData['Giá (VNĐ)'])} onChange={e => handleNumberChange('Giá (VNĐ)', e.target.value)} placeholder="5.000.000.000" />
                </div>
                <div className="form-group">
                  <label>Tiền cọc (VNĐ)</label>
                  <input required type="text" className="input-field" value={displayNumber(formData['Tiền cọc'])} onChange={e => handleNumberChange('Tiền cọc', e.target.value)} placeholder="100.000.000" />
                </div>
                <div className="form-group">
                  <label>Hoa hồng (VNĐ)</label>
                  <input required type="text" className="input-field" value={displayNumber(formData['Hoa hồng'])} onChange={e => handleNumberChange('Hoa hồng', e.target.value)} placeholder="50.400.000" />
                </div>
                <div className="form-group">
                  <label>Nhân sự (Mã NV)</label>
                  <select required className="input-field" value={formData['Mã nhân viên']} onChange={handleStaffChange}>
                    <option value="">-- Chọn nhân sự --</option>
                    {staff.map((s, idx) => (
                      <option key={idx} value={s['Mã NV']}>{s['Mã NV']} - {s['Tên NV']}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tên Sales (Tự động)</label>
                  <input required disabled className="input-field" value={formData['Sales']} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }} />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select className="input-field" value={formData['Trạng thái']} onChange={e => setFormData({...formData, 'Trạng thái': e.target.value})}>
                    <option value="Đã đặt cọc">Đã đặt cọc</option>
                    <option value="Đã ký HĐMB">Đã ký HĐMB</option>
                    <option value="Giữ chỗ">Giữ chỗ</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Ghi chú</label>
                  <input className="input-field" value={formData['Ghi chú']} onChange={e => setFormData({...formData, 'Ghi chú': e.target.value})} placeholder="Ghi chú thêm..." />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-submit">Lưu Giao dịch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
