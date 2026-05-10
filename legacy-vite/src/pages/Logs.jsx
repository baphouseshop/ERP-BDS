import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useData } from '../context/DataContext';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTable, setFilterTable] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [jumpPage, setJumpPage] = useState('1');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, filterTable, filterAction, filterDate]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let result = [...logs];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(log => 
        (log.record_id && log.record_id.toLowerCase().includes(lowerSearch)) ||
        (log.changed_by_name && log.changed_by_name.toLowerCase().includes(lowerSearch))
      );
    }

    if (filterTable !== 'all') {
      result = result.filter(log => log.table_name === filterTable);
    }

    if (filterAction !== 'all') {
      result = result.filter(log => log.action === filterAction);
    }

    if (filterDate) {
      result = result.filter(log => log.created_at.startsWith(filterDate));
    }

    setFilteredLogs(result);
    setCurrentPage(1);
    setJumpPage('1');
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredLogs.slice(startIndex, startIndex + pageSize);

  const handleJumpPage = (e) => {
    e.preventDefault();
    const page = parseInt(jumpPage);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else {
      setJumpPage(currentPage.toString());
    }
  };

  const columnMapping = {
    'ma_lead': 'Mã Lead', 'ho_ten': 'Họ tên', 'sdt': 'SĐT', 'nguon': 'Nguồn',
    'chien_dich_id': 'Chiến dịch', 'nhu_cau': 'Nhu cầu', 'trang_thai': 'Trạng thái',
    'nhan_vien_id': 'Mã nhân viên', 'ten_san': 'Tên sàn', 'ngay_hen': 'Ngày hẹn',
    'ngay_fu': 'Ngày Follow-up', 'ghi_chu': 'Ghi chú', 'ngay_nhan': 'Ngày nhận',
    'ma_gd': 'Mã GD', 'khach_hang': 'Khách hàng', 'ngay_gd': 'Ngày GD',
    'ma_sp': 'Mã SP', 'phan_khu': 'Phân khu', 'gia_vnd': 'Giá HĐ',
    'tien_coc': 'Tiền cọc', 'hoa_hong': 'Hoa hồng', 'sales_name': 'Tên Sales',
    'ma_nv': 'Mã NV', 'ten_nv': 'Tên NV', 'san': 'Sàn', 'chuc_vu': 'Chức vụ',
    'luong_vnd': 'Lương', 'ngay_vao_lam': 'Ngày vào làm', 'email': 'Email'
  };

  const renderDiff = (log) => {
    if (log.action === 'INSERT') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '5px' }}>
          {Object.entries(log.new_data || {}).map(([key, val]) => (
            val && <div key={key} style={{ fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{columnMapping[key] || key}:</span> {String(val)}
            </div>
          ))}
        </div>
      );
    }
    if (log.action === 'DELETE') {
      return <div style={{ color: '#f44336', fontWeight: 'bold' }}>Bản ghi đã bị xóa hoàn toàn</div>;
    }
    
    const oldD = log.old_data || {};
    const newD = log.new_data || {};
    const changes = Object.keys(newD).filter(key => 
      String(oldD[key] || '') !== String(newD[key] || '')
    );

    if (changes.length === 0) return <div style={{ color: 'var(--text-muted)' }}>Cập nhật hệ thống (không thay đổi dữ liệu chính)</div>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {changes.map(key => (
          <div key={key} style={{ fontSize: '13px' }}>
            <strong style={{ color: 'var(--text-muted)' }}>{columnMapping[key] || key}:</strong> 
            <span style={{ color: '#f44336', textDecoration: 'line-through', margin: '0 8px', fontSize: '12px' }}>{String(oldD[key] || 'Trống')}</span>
            <span style={{ color: '#4caf50', fontWeight: '500' }}>➔ {String(newD[key] || 'Trống')}</span>
          </div>
        ))}
      </div>
    );
  };

  const getTableNameVietnamese = (table) => {
    const mapping = {
      'leads': 'Khách hàng (Leads)',
      'transactions': 'Giao dịch',
      'employees': 'Nhân viên',
      'marketing_campaigns': 'Marketing',
      'financial_records': 'Tài chính'
    };
    return mapping[table] || table;
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return '#4caf50';
      case 'UPDATE': return '#ff9800';
      case 'DELETE': return '#f44336';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <div className="page-container" style={{ padding: '20px' }}>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Lịch sử chỉnh sửa dữ liệu</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Hệ thống ghi lại mọi thao tác Thêm, Sửa, Xóa để đảm bảo tính minh bạch.</p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Tìm kiếm (Mã/Người sửa)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Nhập mã hoặc tên..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', height: '36px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Chọn bảng</label>
            <select className="input-field" value={filterTable} onChange={(e) => setFilterTable(e.target.value)} style={{ width: '100%', height: '36px' }}>
              <option value="all">Tất cả các bảng</option>
              <option value="leads">Khách hàng (Leads)</option>
              <option value="transactions">Giao dịch</option>
              <option value="employees">Nhân viên</option>
              <option value="marketing_campaigns">Marketing</option>
              <option value="financial_records">Tài chính</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Hành động</label>
            <select className="input-field" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} style={{ width: '100%', height: '36px' }}>
              <option value="all">Tất cả hành động</option>
              <option value="INSERT">THÊM MỚI</option>
              <option value="UPDATE">CẬP NHẬT</option>
              <option value="DELETE">XÓA</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Ngày thực hiện</label>
            <input 
              type="date" 
              className="input-field" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ width: '100%', height: '36px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-submit" onClick={fetchLogs} style={{ width: '100%', height: '36px', fontSize: '13px' }}>
              Làm mới dữ liệu
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '15px' }}>Thời gian</th>
                <th style={{ padding: '15px' }}>Người thực hiện</th>
                <th style={{ padding: '15px' }}>Bảng</th>
                <th style={{ padding: '15px' }}>Mã bản ghi</th>
                <th style={{ padding: '15px' }}>Hành động</th>
                <th style={{ padding: '15px' }}>Chi tiết thay đổi</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text-primary)' }}>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Đang tải lịch sử...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không tìm thấy lịch sử nào phù hợp.</td></tr>
              ) : (
                currentData.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '15px', whiteSpace: 'nowrap', verticalAlign: 'top', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '15px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 'bold' }}>
                          {(log.changed_by_name || 'H')[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '500' }}>{log.changed_by_name || 'Hệ thống'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '15px', fontWeight: '500', verticalAlign: 'top' }}>
                      {getTableNameVietnamese(log.table_name)}
                    </td>
                    <td style={{ padding: '15px', verticalAlign: 'top', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                      {log.record_id}
                    </td>
                    <td style={{ padding: '15px', verticalAlign: 'top' }}>
                      <span style={{ 
                        backgroundColor: getActionColor(log.action) + '22', 
                        color: getActionColor(log.action),
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        border: `1px solid ${getActionColor(log.action)}44`
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '15px', minWidth: '300px' }}>
                      {renderDiff(log)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, filteredLogs.length)} trên tổng số {filteredLogs.length} bản ghi
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <button 
                  className="btn-page" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  &lt;
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '4px', 
                        border: 'none', 
                        backgroundColor: currentPage === pageNum ? 'var(--accent-color)' : 'transparent',
                        color: currentPage === pageNum ? 'white' : 'var(--text-primary)',
                        fontWeight: currentPage === pageNum ? 'bold' : 'normal',
                        cursor: 'pointer'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button 
                  className="btn-page" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  &gt;
                </button>
              </div>

              <form onSubmit={handleJumpPage} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Đến trang:</span>
                <input 
                  type="number" 
                  value={jumpPage} 
                  onChange={(e) => setJumpPage(e.target.value)}
                  style={{ width: '50px', height: '32px', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
                <button type="submit" className="btn-submit" style={{ padding: '4px 10px', fontSize: '12px' }}>Go</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
