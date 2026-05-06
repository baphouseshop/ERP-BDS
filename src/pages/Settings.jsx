import React, { useState, useEffect } from 'react';

function Settings() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load existing settings from localStorage
    const savedSupabaseUrl = localStorage.getItem('supabaseUrl') || '';
    const savedSupabaseKey = localStorage.getItem('supabaseKey') || '';
    const savedN8nWebhookUrl = localStorage.getItem('n8nWebhookUrl') || '';
    
    setSupabaseUrl(savedSupabaseUrl);
    setSupabaseKey(savedSupabaseKey);
    setN8nWebhookUrl(savedN8nWebhookUrl);
  }, []);

  const handleSave = () => {
    localStorage.setItem('supabaseUrl', supabaseUrl);
    localStorage.setItem('supabaseKey', supabaseKey);
    localStorage.setItem('n8nWebhookUrl', n8nWebhookUrl);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cài Đặt Hệ Thống</h1>
        <div className="page-subtitle">Cấu hình kết nối API đến các dịch vụ bên ngoài (Supabase, n8n)</div>
      </div>

      <div className="settings-card">
        <h2 style={{ fontSize: '18px', marginBottom: '25px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent)' }}>⚙️</span> Cấu hình API Connectors
        </h2>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>Supabase Project URL</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="https://xyzcompany.supabase.co" 
            value={supabaseUrl} 
            onChange={(e) => setSupabaseUrl(e.target.value)} 
          />
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Dùng để kết nối Database (Lưu trữ tập trung thực tế)</div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>Supabase Anon/Public Key</label>
          <input 
            type="password" 
            className="input-field" 
            placeholder="eyJhbGciOiJIUzI1NiIsInR..." 
            value={supabaseKey} 
            onChange={(e) => setSupabaseKey(e.target.value)} 
          />
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '30px 0' }}></div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>n8n Webhook URL (Automation)</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="https://n8n.yourdomain.com/webhook/..." 
            value={n8nWebhookUrl} 
            onChange={(e) => setN8nWebhookUrl(e.target.value)} 
          />
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Endpoint để đẩy dữ liệu kích hoạt luồng tự động hóa</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px', alignItems: 'center', gap: '15px' }}>
          {isSaved && <span style={{ color: 'var(--success)', fontSize: '14px', fontWeight: 'bold' }}>✓ Đã lưu cấu hình</span>}
          <button className="btn-submit" onClick={handleSave} style={{ minWidth: '120px' }}>Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
