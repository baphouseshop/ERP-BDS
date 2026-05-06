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

  return (
    <div className="page-container" style={{ padding: '20px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Lịch sử chỉnh sửa dữ liệu</h2>
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
                <th style={{ padding: '12px 15px' }}>Chi tiết</th>
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
                    <td style={{ padding: '12px 15px', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px 15px', fontWeight: '500' }}>
                      {getTableNameVietnamese(log.table_name)}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      {log.record_id}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
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
                      <details>
                        <summary style={{ cursor: 'pointer', color: 'var(--accent-color)', fontSize: '13px' }}>Xem thay đổi</summary>
                        <div style={{ 
                          marginTop: '10px', 
                          padding: '10px', 
                          backgroundColor: 'var(--bg-primary)', 
                          borderRadius: '6px',
                          fontSize: '11px',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {log.action === 'UPDATE' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div>
                                <div style={{ color: '#f44336', marginBottom: '5px' }}>Cũ:</div>
                                <pre style={{ margin: 0 }}>{formatData(log.old_data)}</pre>
                              </div>
                              <div>
                                <div style={{ color: '#4caf50', marginBottom: '5px' }}>Mới:</div>
                                <pre style={{ margin: 0 }}>{formatData(log.new_data)}</pre>
                              </div>
                            </div>
                          ) : (
                            <pre style={{ margin: 0 }}>{formatData(log.action === 'DELETE' ? log.old_data : log.new_data)}</pre>
                          )}
                        </div>
                      </details>
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
