import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Play, Pause, Trash2, Edit2, MessageSquare, Mail, Smartphone, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AutomationScenarioForm from '../components/AutomationScenarioForm';
import AutomationDashboard from '../components/AutomationDashboard';

const Automation = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);

  const fetchScenarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('automation_scenarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Không thể tải danh sách kịch bản");
    } else {
      setScenarios(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const { error } = await supabase
      .from('automation_scenarios')
      .update({ active: !currentStatus })
      .eq('id', id);

    if (error) toast.error("Lỗi khi cập nhật trạng thái");
    else fetchScenarios();
  };

  const deleteScenario = async (id) => {
    if (!window.confirm("Sếp có chắc muốn xóa kịch bản này?")) return;
    const { error } = await supabase
      .from('automation_scenarios')
      .delete()
      .eq('id', id);

    if (error) toast.error("Lỗi khi xóa");
    else fetchScenarios();
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'zalo': return <MessageSquare size={14} className="text-blue-400" />;
      case 'sms': return <Smartphone size={14} className="text-green-400" />;
      case 'email': return <Mail size={14} className="text-purple-400" />;
      default: return null;
    }
  };

  const getScoreBadge = (score) => {
    switch (score) {
      case 'lanh': return <span className="badge badge-cold">Lạnh</span>;
      case 'am': return <span className="badge badge-warm">Ấm</span>;
      case 'nong': return <span className="badge badge-hot">Nóng</span>;
      default: return null;
    }
  };

  return (
    <div className="automation-page">
      <div className="page-header">
        <div className="header-title">
          <h1>Chăm sóc tự động</h1>
          <p>Quản lý kịch bản gửi tin nhắn qua Zalo, SMS, Email theo phân loại Lead.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingScenario(null); setIsFormOpen(true); }}>
          <Plus size={18} /> Tạo kịch bản mới
        </button>
      </div>

      <AutomationDashboard />

      <div className="section-title" style={{ marginTop: '32px', marginBottom: '16px' }}>
        ▶ Danh sách kịch bản vận hành
      </div>

      <div className="automation-grid">
        {loading ? (
          <div className="loading-state">Đang tải kịch bản...</div>
        ) : scenarios.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <h3>Chưa có kịch bản nào</h3>
            <p>Bắt đầu bằng cách tạo kịch bản chăm sóc khách hàng đầu tiên của Sếp.</p>
          </div>
        ) : (
          scenarios.map((s) => (
            <div key={s.id} className={`scenario-card ${!s.active ? 'inactive' : ''}`}>
              <div className="scenario-header">
                <div className="scenario-info">
                  <h3>{s.ten_kich_ban}</h3>
                  <div className="scenario-meta">
                    {getScoreBadge(s.lead_score)}
                    <span className="delay-info">⏱ {s.delay_hours}h delay</span>
                  </div>
                </div>
                <div className="scenario-status">
                  <button 
                    className={`status-toggle ${s.active ? 'active' : ''}`}
                    onClick={() => toggleStatus(s.id, s.active)}
                  >
                    {s.active ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
              </div>

              <div className="scenario-body">
                <div className="channel-list">
                  {s.kenh.map(c => (
                    <div key={c} className="channel-tag">
                      {getChannelIcon(c)} <span>{c.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
                <div className="template-preview">
                  {s.noi_dung_template.zalo && <p><strong>Zalo:</strong> {s.noi_dung_template.zalo.substring(0, 60)}...</p>}
                </div>
              </div>

              <div className="scenario-footer">
                <div className="stats-mini">
                  <span>🚀 0 gửi</span>
                  <span>💬 0 phản hồi</span>
                </div>
                <div className="actions">
                  <button className="btn-icon" onClick={() => { setEditingScenario(s); setIsFormOpen(true); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-icon text-red-400" onClick={() => deleteScenario(s.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isFormOpen && (
        <AutomationScenarioForm 
          scenario={editingScenario} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchScenarios(); }}
        />
      )}
    </div>
  );
};

export default Automation;
