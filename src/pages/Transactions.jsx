import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';
import { 
  KpiCard, SectionHead, fmt 
} from '../components/VisualLanguage';
import { downloadTemplate } from '../utils/templateGenerator';
import * as XLSX from 'xlsx';

function Transactions() {
  const { 
    transactions, transactionsTotal, transactionsPage, setTransactionsPage, 
    transSearch, setTransSearch, transSort, setTransSort,
    itemsPerPage, leads, staff, 
    addTransaction, editTransaction, deleteTransaction, addMultipleTransactions 
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
        addMultipleTransactions(data);
      } catch (err) {
        toast.error("Lỗi đọc file: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  // --- KPI CALCULATIONS ---
  const totalRevenue = transactions.reduce((sum, t) => sum + Number(t['Giá (VNĐ)'] || 0), 0);
  const totalCommission = transactions.reduce((sum, t) => sum + Number(t['Hoa hồng'] || 0), 0);
  const closedCount = transactions.filter(t => t['Trạng thái'] === 'Đã hoàn thành' || t['Trạng thái'] === 'Đã ký HĐMB').length;

  // --- FILTER STATE ---
  const [filterStatus, setFilterStatus] = useState('');
  const [localSearch, setLocalSearch] = useState(transSearch);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== transSearch) {
        setTransSearch(localSearch);
        setTransactionsPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, transSearch, setTransSearch, setTransactionsPage]);

  const handleSort = (key) => {
    const keyMap = { 'Mã GD': 'ma_gd', 'Ngày GD': 'ngay_gd', 'Giá (VNĐ)': 'gia', 'Trạng thái': 'trang_thai' };
    const dbKey = keyMap[key] || 'ngay_gd';
    setTransSort({ column: dbKey, ascending: transSort.column === dbKey ? !transSort.ascending : false });
  };

  const totalPages = Math.ceil(transactionsTotal / itemsPerPage);

  const [formData, setFormData] = useState({
    'Mã GD': '', 'Ngày GD': new Date().toISOString().slice(0, 10),
    'Mã Lead': '', 'Mã SP': '', 'Phân khu': 'Sapphire',
    'Giá (VNĐ)': '', 'Tiền cọc': '', 'Hoa hồng': '',
    'Mã nhân viên': '', 'Sales': '', 'Trạng thái': 'Đã đặt cọc', 'Ghi chú': ''
  });

  const handleOpenEditModal = (t) => {
    setIsEditMode(true);
    setFormData({ ...t });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormData({
      'Mã GD': `GD${Date.now().toString().slice(-4)}`,
      'Ngày GD': new Date().toISOString().slice(0, 10),
      'Mã Lead': '', 'Mã SP': '', 'Phân khu': 'Sapphire',
      'Giá (VNĐ)': '', 'Tiền cọc': '', 'Hoa hồng': '',
      'Mã nhân viên': '', 'Sales': '', 'Trạng thái': 'Đã đặt cọc', 'Ghi chú': ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) editTransaction(formData);
    else addTransaction(formData);
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
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: 'clamp(20px, 5vw, 28px)' }}>Lịch sử Giao dịch</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Quản lý hợp đồng, cọc và doanh thu thực tế</p>
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
              downloadTemplate('transactions');
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
            <button onClick={handleOpenAddModal} className="btn-submit" style={{ 
              padding: '8px 20px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center'
            }}>
              <i className="ti ti-plus" style={{ marginRight: 6 }}></i> Thêm Giao dịch
            </button>
          </div>
        </div>
      </div>

      <div className="dash-kpi-grid" style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Tổng Doanh Số" value={fmt(totalRevenue)} sub="Giá trị hợp đồng" colorClass="lime" />
        <KpiCard label="Tổng Hoa Hồng" value={fmt(totalCommission)} sub="Phải chi trả" colorClass="amber" />
        <KpiCard label="Giao dịch Chốt" value={closedCount.toString()} sub="Đã ký HĐMB / Hoàn thành" colorClass="cyan" />
        <KpiCard label="Đang Xử Lý" value={(transactionsTotal - closedCount).toString()} sub="Giữ chỗ / Đã cọc" colorClass="purple" />
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
          <input className="filter-input" placeholder="Tìm khách hàng, mã GD, SP..." style={{ paddingLeft: 36, width: '100%', margin: 0 }} value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
        </div>
        <select className="filter-select" style={{ width: 180, margin: 0 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">-- Trạng thái --</option>
          {['Đang giữ chỗ', 'Giữ chỗ', 'Đã đặt cọc', 'Đã ký HĐMB', 'Đã hoàn thành', 'Đã hủy'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(localSearch || filterStatus) && (
          <button onClick={() => { setLocalSearch(''); setFilterStatus(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--red)', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>XÓA LỌC</button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 100 }}>Thao tác</th>
              <th onClick={() => handleSort('Mã GD')} style={{ cursor: 'pointer' }}>Mã GD</th>
              <th>Ngày GD</th>
              <th>Khách hàng</th>
              <th>Mã SP</th>
              <th>Giá HĐ</th>
              <th>Hoa hồng</th>
              <th>Trạng thái</th>
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, index) => (
              <tr key={index}>
                <td>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => handleOpenEditModal(t)} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', padding: 4 }}><i className="ti ti-pencil" style={{ fontSize: 16 }}></i></button>
                    <button onClick={() => { if(window.confirm('Xóa giao dịch?')) deleteTransaction(t['Mã GD']) }} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 4 }}><i className="ti ti-trash" style={{ fontSize: 16 }}></i></button>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t['Mã GD']}</td>
                <td>{t['Ngày GD']}</td>
                <td style={{ fontWeight: 700 }}>{t['Khách hàng']}</td>
                <td style={{ color: 'var(--cyan)' }}>{t['Mã SP']}</td>
                <td style={{ fontWeight: 700 }}>{fmt(t['Giá (VNĐ)'] || 0)}</td>
                <td style={{ color: 'var(--amber)', fontWeight: 700 }}>{fmt(t['Hoa hồng'] || 0)}</td>
                <td>
                  <span style={{
                    padding: '2px 10px', borderRadius: 4, fontSize: 10, fontWeight: 800,
                    border: '1px solid currentColor',
                    background: t['Trạng thái'].includes('Đã') ? 'rgba(0, 204, 102, 0.1)' : 'rgba(204, 255, 0, 0.1)',
                    color: t['Trạng thái'].includes('Đã ký') ? '#00cc66' : t['Trạng thái'].includes('đặt cọc') ? '#00e5ff' : '#ccff00'
                  }}>
                    {t['Trạng thái']}
                  </span>
                </td>
                <td><span style={{ fontSize: 12 }}>{t['Sales']}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32, flexWrap: 'wrap' }}>
          <button 
            onClick={() => setTransactionsPage(Math.max(1, transactionsPage - 1))} 
            disabled={transactionsPage === 1} 
            className="btn-page"
            style={{ padding: '8px 12px' }}
          >
            <i className="ti ti-angle-left"></i>
          </button>
          
          {(() => {
            const pages = [];
            const showRange = 1;
            
            pages.push(
              <button key={1} onClick={() => setTransactionsPage(1)} className={`btn-page ${transactionsPage === 1 ? 'active' : ''}`}>1</button>
            );
            
            if (transactionsPage > showRange + 2) {
              pages.push(<span key="dots-1" style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>);
            }
            
            for (let i = Math.max(2, transactionsPage - showRange); i <= Math.min(totalPages - 1, transactionsPage + showRange); i++) {
              pages.push(
                <button key={i} onClick={() => setTransactionsPage(i)} className={`btn-page ${transactionsPage === i ? 'active' : ''}`}>{i}</button>
              );
            }
            
            if (transactionsPage < totalPages - showRange - 1) {
              pages.push(<span key="dots-2" style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>);
            }
            
            if (totalPages > 1) {
              pages.push(
                <button key={totalPages} onClick={() => setTransactionsPage(totalPages)} className={`btn-page ${transactionsPage === totalPages ? 'active' : ''}`}>{totalPages}</button>
              );
            }
            
            return pages;
          })()}
          
          <button 
            onClick={() => setTransactionsPage(Math.min(totalPages, transactionsPage + 1))} 
            disabled={transactionsPage === totalPages} 
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
            <SectionHead label={isEditMode ? 'Chỉnh sửa Giao dịch' : 'Thêm Giao dịch'} icon="ti-receipt" />
            <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Mã GD</label>
                  <input required disabled={isEditMode} className="input-field" value={formData['Mã GD']} onChange={e => setFormData({...formData, 'Mã GD': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Ngày GD</label>
                  <input required type="date" className="input-field" value={formData['Ngày GD']} onChange={e => setFormData({...formData, 'Ngày GD': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Mã SP</label>
                  <input required className="input-field" value={formData['Mã SP']} onChange={e => setFormData({...formData, 'Mã SP': e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select className="input-field" value={formData['Trạng thái']} onChange={e => setFormData({...formData, 'Trạng thái': e.target.value})}>
                    <option value="Đã đặt cọc">Đã đặt cọc</option>
                    <option value="Đã ký HĐMB">Đã ký HĐMB</option>
                    <option value="Giữ chỗ">Giữ chỗ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá Hợp đồng (VNĐ)</label>
                  <input required className="input-field" value={formData['Giá (VNĐ)']} onChange={e => setFormData({...formData, 'Giá (VNĐ)': e.target.value.replace(/\D/g, '')})} />
                </div>
                <div className="form-group">
                  <label>Hoa hồng (VNĐ)</label>
                  <input required className="input-field" value={formData['Hoa hồng']} onChange={e => setFormData({...formData, 'Hoa hồng': e.target.value.replace(/\D/g, '')})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-submit">Lưu giao dịch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
