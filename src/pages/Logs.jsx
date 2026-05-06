import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useData } from '../context/DataContext';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useData();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    // Fetch logs with joined user info if possible, but audit_logs changed_by is auth.users.id
    // We can't directly join with employees unless we map it manually
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data);
    }
    setLoading(false);
  };

  const formatData = (data) => {
    if (!data) return "N/A";
    return JSON.stringify(data, null, 2);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return '#4caf50';
      case 'UPDATE': return '#ff9800';
      case 'DELETE': return '#f44336';
      default: return 'var(--text-primary)';
    }
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
      return Object.entries(log.new_data || {}).map(([key, val]) => (
        val && <div key={key}><strong>{columnMapping[key] || key}:</strong> {String(val)}</div>
      ));
    }
    if (log.action === 'DELETE') {
      return <div style={{ color: 'var(--danger)' }}>Bản ghi đã bị xóa</div>;
    }
    
    // For UPDATE: Compare old and new
    const oldD = log.old_data || {};
    const newD = log.new_data || {};
    const changes = Object.keys(newD).filter(key => 
      String(oldD[key] || '') !== String(newD[key] || '')
    );

    if (changes.length === 0) return <div>Không có thay đổi dữ liệu chính</div>;

    return changes.map(key => (
      <div key={key} style={{ marginBottom: '4px' }}>
        <strong>{columnMapping[key] || key}:</strong> 
        <span style={{ color: '#f44336', textDecoration: 'line-through', margin: '0 8px' }}>{String(oldD[key] || 'Trống')}</span>
        <span style={{ color: '#4caf50' }}>➔ {String(newD[key] || 'Trống')}</span>
      </div>
    ));
  };

  return (
    <div className="page-container" style={{ padding: '20px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Lịch sử chỉnh sửa dữ liệu</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Theo dõi các thao tác Thêm, Sửa, Xóa trên hệ thống.</p>
        </div>
        <button className="btn-submit" onClick={fetchLogs} style={{ padding: '8px 16px', fontSize: '14px' }}>
          Làm mới
        </button>
      </div>

      <div className="card" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '12px 15px' }}>Thời gian</th>
                <th style={{ padding: '12px 15px' }}>Bảng</th>
                <th style={{ padding: '12px 15px' }}>Mã bản ghi</th>
                <th style={{ padding: '12px 15px' }}>Hành động</th>
                <th style={{ padding: '12px 15px' }}>Chi tiết thay đổi</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text-primary)' }}>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Chưa có lịch sử nào.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 15px', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px 15px', fontWeight: '500', verticalAlign: 'top' }}>
                      {getTableNameVietnamese(log.table_name)}
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'top', fontWeight: 'bold', color: 'var(--accent)' }}>
                      {log.record_id}
                    </td>
                    <td style={{ padding: '12px 15px', verticalAlign: 'top' }}>
                      <span style={{ 
                        backgroundColor: getActionColor(log.action) + '22', 
                        color: getActionColor(log.action),
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                        {renderDiff(log)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;
