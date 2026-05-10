import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Plus, Play, Pause, Trash2, Edit2, MessageSquare, Mail, 
  Smartphone, Clock, BarChart3, Snowflake, Flame, Rocket,
  Search, Filter, Bell, Send, Loader2, ZapOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import AutomationScenarioForm from '../components/AutomationScenarioForm';

const SCORE_CONFIG = {
  lanh: { label: 'Lạnh', icon: <Snowflake size={14} />, colorClass: 'cold', emoji: '❄️' },
  am: { label: 'Ấm', icon: <Flame size={14} />, colorClass: 'warm', emoji: '🔥' },
  nong: { label: 'Nóng', icon: <Rocket size={14} />, colorClass: 'hot', emoji: '🚀' },
};

const CHANNEL_ICONS = {
  zalo: <MessageSquare size={14} />,
  sms: <Smartphone size={14} />,
  email: <Mail size={14} />,
  inapp: <Bell size={14} />,
  telegram: <Send size={14} />,
};

const StatCard = ({ icon, label, value, colorClass }) => (
  <div className={`premium-stat-card ${colorClass}`}>
    <div className="stat-icon-wrapper">
      {icon}
    </div>
    <div className="stat-content">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  </div>
);

const Automation = () => {
  const [scenarios, setScenarios] = useState([]);
  const [stats, setStats] = useState({ totalSent: 0, lanh: 0, am: 0, nong: 0 });
  const [loading, setLoading] = useState(true);
  const [filterScore, setFilterScore] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch scenarios
      const { data: scenariosData, error: sError } = await supabase
        .from('automation_scenarios')
        .select('*')
        .order('created_at', { ascending: false });
      if (sError) throw sError;
      setScenarios(scenariosData || []);

      // Fetch message stats
      const { count: msgCount } = await supabase
        .from('automation_messages')
        .select('*', { count: 'exact', head: true });

      // Fetch lead scores distribution
      const { data: leadScores } = await supabase
        .from('lead_scores')
        .select('score');

      const counts = (leadScores || []).reduce((acc, l) => {
        acc[l.score] = (acc[l.score] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalSent: msgCount || 0,
        lanh: counts.lanh || 0,
        am: counts.am || 0,
        nong: counts.nong || 0,
      });
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu automation");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const handleToggle = async (scenario) => {
    const { error } = await supabase
      .from('automation_scenarios')
      .update({ active: !scenario.active })
      .eq('id', scenario.id);
    
    if (error) {
      toast.error("Lỗi cập nhật trạng thái");
    } else {
      setScenarios(prev => prev.map(s => s.id === scenario.id ? { ...s, active: !s.active } : s));
      toast.success(scenario.active ? "Đã tạm dừng kịch bản" : "Đã kích hoạt kịch bản");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sếp chắc chắn muốn xóa kịch bản này? Thao tác không thể hoàn tác.")) return;
    const { error } = await supabase
      .from('automation_scenarios')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error("Lỗi khi xóa kịch bản");
    } else {
      setScenarios(prev => prev.filter(s => s.id !== id));
      toast.success("Đã xóa kịch bản");
    }
  };

  const filteredScenarios = filterScore === 'all' 
    ? scenarios 
    : scenarios.filter(s => s.lead_score === filterScore);

  return (
    <div className="automation-page-v2">
      {/* Header Section */}
      <div className="automation-header">
        <div className="header-info">
          <h1>Chăm sóc tự động</h1>
          <p>Quản lý kịch bản vận hành đa kênh thông minh</p>
        </div>
        <button className="btn-create-v2" onClick={() => { setEditingScenario(null); setIsFormOpen(true); }}>
          <Plus size={18} />
          <span>Tạo kịch bản mới</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="automation-stats-grid">
        <StatCard 
          icon={<Send size={20} />} 
          label="Tổng tin đã gửi" 
          value={stats.totalSent.toLocaleString()} 
          colorClass="primary" 
        />
        <StatCard 
          icon={<Snowflake size={20} />} 
          label="Lead Lạnh" 
          value={stats.lanh.toLocaleString()} 
          colorClass="cold" 
        />
        <StatCard 
          icon={<Flame size={20} />} 
          label="Lead Ấm" 
          value={stats.am.toLocaleString()} 
          colorClass="warm" 
        />
        <StatCard 
          icon={<Rocket size={20} />} 
          label="Lead Nóng" 
          value={stats.nong.toLocaleString()} 
          colorClass="hot" 
        />
      </div>

      {/* Filter Bar */}
      <div className="automation-filter-bar">
        <div className="filter-group">
          <span className="filter-label">Bộ lọc:</span>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'lanh', label: '❄️ Lạnh' },
            { key: 'am', label: '🔥 Ấm' },
            { key: 'nong', label: '🚀 Nóng' },
          ].map(f => (
            <button
              key={f.key}
              className={`filter-tab ${filterScore === f.key ? 'active' : ''}`}
              onClick={() => setFilterScore(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="filter-stats">
          {filteredScenarios.length} kịch bản đang hiển thị
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Đang đồng bộ kịch bản...</p>
        </div>
      ) : filteredScenarios.length === 0 ? (
        <div className="empty-container">
          <ZapOff size={48} className="text-muted" />
          <h3>Không tìm thấy kịch bản</h3>
          <p>Bắt đầu quy trình chăm sóc tự động bằng cách tạo kịch bản mới</p>
          <button className="btn-create-v2 mt-4" onClick={() => setIsFormOpen(true)}>Tạo ngay</button>
        </div>
      ) : (
        <div className="scenarios-grid-v2">
          {filteredScenarios.map(s => {
            const config = SCORE_CONFIG[s.lead_score] || SCORE_CONFIG.lanh;
            return (
              <div key={s.id} className={`scenario-card-v2 ${!s.active ? 'is-paused' : ''}`}>
                <div className="card-top">
                  <div className="badges-group">
                    <div className={`score-badge-v2 ${config.colorClass}`}>
                      {config.icon}
                      <span>{config.label}</span>
                    </div>
                    {s.du_an_id && (
                      <div className="project-badge-v2">
                        {s.du_an_id}
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button 
                      className={`action-btn ${s.active ? 'active' : ''}`}
                      onClick={() => handleToggle(s)}
                      title={s.active ? "Tạm dừng" : "Kích hoạt"}
                    >
                      {s.active ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button className="action-btn" onClick={() => { setEditingScenario(s); setIsFormOpen(true); }}>
                      <Edit2 size={14} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(s.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="scenario-title">{s.ten_kich_ban}</h3>

                <div className="scenario-chips">
                  {s.delay_hours > 0 && (
                    <div className="meta-chip-v2">
                      <Clock size={12} />
                      Sau {s.delay_hours}h
                    </div>
                  )}
                  {s.kenh.map(ch => (
                    <div key={ch} className="meta-chip-v2 channel">
                      {CHANNEL_ICONS[ch]}
                      <span>{ch.toUpperCase()}</span>
                    </div>
                  ))}
                </div>

                <div className="card-footer-v2">
                  <div className="footer-stats">
                    <BarChart3 size={14} />
                    <span>{s.sent_count || 0} tin đã gửi</span>
                  </div>
                  <div className={`status-indicator ${s.active ? 'online' : 'offline'}`}>
                    <span className="dot"></span>
                    {s.active ? 'Đang chạy' : 'Đã tắt'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
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
