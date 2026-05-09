import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  X, Save, MessageSquare, Smartphone, Mail, CheckCircle2, Circle, 
  Snowflake, Flame, Rocket, Bell, Send, Info, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const SCORE_OPTIONS = [
  { key: 'lanh', label: 'Lạnh', icon: <Snowflake size={16} />, colorClass: 'cold' },
  { key: 'am', label: 'Ấm', icon: <Flame size={16} />, colorClass: 'warm' },
  { key: 'nong', label: 'Nóng', icon: <Rocket size={16} />, colorClass: 'hot' },
];

const CHANNEL_OPTIONS = [
  { key: 'zalo', label: 'Zalo OA', icon: <MessageSquare size={20} />, class: 'zalo' },
  { key: 'sms', label: 'SMS Brand', icon: <Smartphone size={20} />, class: 'sms' },
  { key: 'email', label: 'Email Mkt', icon: <Mail size={20} />, class: 'email' },
  { key: 'inapp', label: 'In-app', icon: <Bell size={20} />, class: 'inapp' },
  { key: 'telegram', label: 'Telegram', icon: <Send size={20} />, class: 'telegram' },
];

const CHAR_LIMITS = { zalo: 300, sms: 160 };

const DU_AN_LIST = [
  'Tất cả dự án',
  'Vinhomes Grand Park',
  'Akari City',
  'The Global City',
  'Dự án lẻ',
];

const AutomationScenarioForm = ({ scenario, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    ten_kich_ban: scenario?.ten_kich_ban || '',
    du_an_id: scenario?.du_an_id || 'Tất cả dự án',
    lead_score: scenario?.lead_score || 'lanh',
    kenh: scenario?.kenh || ['zalo'],
    noi_dung_template: scenario?.noi_dung_template || { zalo: '', sms: '', email: { subject: '', body: '' } },
    delay_hours: scenario?.delay_hours || 0,
    active: scenario?.active ?? true
  });
  
  const [activeTab, setActiveTab] = useState('zalo');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.kenh.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 kênh");
      return;
    }
    setLoading(true);

    try {
      const dataToSave = { ...formData };
      if (scenario?.id) {
        const { error } = await supabase
          .from('automation_scenarios')
          .update(dataToSave)
          .eq('id', scenario.id);
        if (error) throw error;
        toast.success("Đã cập nhật kịch bản");
      } else {
        const { error } = await supabase
          .from('automation_scenarios')
          .insert(dataToSave);
        if (error) throw error;
        toast.success("Đã tạo kịch bản mới");
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = (channel) => {
    setFormData(prev => ({
      ...prev,
      kenh: prev.kenh.includes(channel) 
        ? prev.kenh.filter(c => c !== channel)
        : [...prev.kenh, channel]
    }));
  };

  const updateTemplate = (channel, value) => {
    setFormData(prev => ({
      ...prev,
      noi_dung_template: {
        ...prev.noi_dung_template,
        [channel]: channel === 'email' 
          ? { ...prev.noi_dung_template.email, ...value }
          : value
      }
    }));
  };

  const charCount = (tab) => {
    if (tab === 'email') return null;
    const len = formData.noi_dung_template[tab]?.length ?? 0;
    const max = CHAR_LIMITS[tab];
    return { len, max, over: max && len > max };
  };

  return (
    <div className="modal-overlay glass-modal">
      <div className="modal-content automation-modal-v2 premium-card">
        {/* Header */}
        <div className="modal-header-v2">
          <div className="header-left">
            <div className="icon-badge">
              <Zap size={20} color="#ccff00" />
            </div>
            <div className="header-text">
              <h2>{scenario ? 'Cấu hình kịch bản' : 'Thiết lập Automation'}</h2>
              <p>Quy trình chăm sóc Lead tự động đa nền tảng</p>
            </div>
          </div>
          <button className="close-btn-round" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-v2">
          {/* Tên & Dự án */}
          <div className="form-section">
            <div className="form-group">
              <label className="premium-label">Tên kịch bản vận hành</label>
              <input 
                type="text" 
                className="premium-input"
                value={formData.ten_kich_ban}
                onChange={e => setFormData({...formData, ten_kich_ban: e.target.value})}
                placeholder="Ví dụ: Chào mừng Lead Lạnh sau 2h..."
                required
              />
            </div>
            
            <div className="form-row-v2">
              <div className="form-group flex-2">
                <label className="premium-label">Dự án áp dụng</label>
                <div className="select-wrapper">
                  <select 
                    className="premium-select"
                    value={formData.du_an_id}
                    onChange={e => setFormData({...formData, du_an_id: e.target.value})}
                  >
                    {DU_AN_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="select-icon" size={16} />
                </div>
              </div>
              <div className="form-group flex-1">
                <label className="premium-label">Delay (giờ)</label>
                <input 
                  type="number" 
                  className="premium-input text-center"
                  min="0"
                  value={formData.delay_hours}
                  onChange={e => setFormData({...formData, delay_hours: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* Phân loại Lead - Horizontal Buttons */}
          <div className="form-group">
            <label className="premium-label">Phân loại Lead mục tiêu</label>
            <div className="score-selector-grid">
              {SCORE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  className={`score-opt-btn ${formData.lead_score === opt.key ? `active-${opt.colorClass}` : ''}`}
                  onClick={() => setFormData({...formData, lead_score: opt.key})}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Kênh truyền thông - Icon Buttons */}
          <div className="form-group">
            <label className="premium-label">Kênh gửi tin nhắn</label>
            <div className="channel-selector-v2">
              {CHANNEL_OPTIONS.map(ch => {
                const isSelected = formData.kenh.includes(ch.key);
                return (
                  <button
                    key={ch.key}
                    type="button"
                    className={`channel-opt-v2 ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleChannel(ch.key)}
                  >
                    <div className="channel-icon-v2">{ch.icon}</div>
                    <span className="channel-label-v2">{ch.label}</span>
                    <div className="check-dot">
                      {isSelected ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Tabs */}
          <div className="content-section">
            <div className="tab-bar-v2">
              {['zalo', 'sms', 'email'].map(t => (
                <button
                  key={t}
                  type="button"
                  className={`tab-item-v2 ${activeTab === t ? 'active' : ''} ${!formData.kenh.includes(t) ? 'disabled' : ''}`}
                  onClick={() => formData.kenh.includes(t) && setActiveTab(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="tab-content-v2">
              {activeTab === 'zalo' && (
                <div className="animate-fade-in">
                  <textarea 
                    className="premium-textarea"
                    rows="4"
                    value={formData.noi_dung_template.zalo}
                    onChange={e => updateTemplate('zalo', e.target.value)}
                    placeholder="Chào {{name}}, cảm ơn bạn đã quan tâm..."
                  />
                  <div className={`char-counter ${charCount('zalo').over ? 'text-red-400' : ''}`}>
                    {charCount('zalo').len} / {charCount('zalo').max} ký tự
                  </div>
                </div>
              )}

              {activeTab === 'sms' && (
                <div className="animate-fade-in">
                  <textarea 
                    className="premium-textarea"
                    rows="3"
                    value={formData.noi_dung_template.sms}
                    onChange={e => updateTemplate('sms', e.target.value)}
                    placeholder="Blanca BĐS: Cam on {{name}} da..."
                  />
                  <div className={`char-counter ${charCount('sms').over ? 'text-red-400' : ''}`}>
                    {charCount('sms').len} / {charCount('sms').max} ký tự · Tin SMS chuẩn
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="animate-fade-in email-fields">
                  <input 
                    className="premium-input mb-3"
                    placeholder="Tiêu đề Email..."
                    value={formData.noi_dung_template.email.subject}
                    onChange={e => updateTemplate('email', { subject: e.target.value })}
                  />
                  <textarea 
                    className="premium-textarea"
                    rows="4"
                    value={formData.noi_dung_template.email.body}
                    onChange={e => updateTemplate('email', { body: e.target.value })}
                    placeholder="Nội dung Email (Hỗ trợ HTML)..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tip Section */}
          <div className="automation-tip">
            <Info size={16} className="text-blue-400 shrink-0" />
            <p>
              Sử dụng <code>{'{{name}}'}</code>, <code>{'{{du_an}}'}</code>, <code>{'{{sales_name}}'}</code> để cá nhân hóa tin nhắn tự động.
            </p>
          </div>

          {/* Footer */}
          <div className="modal-footer-v2">
            <button type="button" className="btn-cancel-v2" onClick={onClose}>Hủy bỏ</button>
            <button type="submit" className="btn-save-v2" disabled={loading}>
              {loading ? (
                <><div className="spinner-mini"></div> Đang xử lý...</>
              ) : (
                <><Save size={18} /> {scenario ? 'Cập nhật kịch bản' : 'Kích hoạt Automation'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Zap = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default AutomationScenarioForm;
