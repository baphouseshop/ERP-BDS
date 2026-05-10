import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  X, Zap, Snowflake, Flame, Rocket, MessageSquare, Smartphone, 
  Mail, Bell, Send, Info, ChevronDown, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const SCORE_OPTIONS = [
  { key: 'lanh', label: 'Lạnh', icon: <Snowflake size={16} />, class: 'cold' },
  { key: 'am', label: 'Ấm', icon: <Flame size={16} />, class: 'warm' },
  { key: 'nong', label: 'Nóng', icon: <Rocket size={16} />, class: 'hot' },
];

const CHANNEL_OPTIONS = [
  { key: 'zalo', label: 'Zalo OA', icon: <MessageSquare size={20} /> },
  { key: 'sms', label: 'SMS', icon: <Smartphone size={20} /> },
  { key: 'email', label: 'Email', icon: <Mail size={20} /> },
  { key: 'inapp', label: 'In-app', icon: <Bell size={20} /> },
  { key: 'telegram', label: 'Telegram', icon: <Send size={20} /> },
];

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
      const dataToSave = { 
        ...formData,
        du_an_id: formData.du_an_id === 'Tất cả dự án' ? null : formData.du_an_id
      };
      
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
        toast.success("Kịch bản đã được kích hoạt");
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

  return (
    <div className="redesign-overlay">
      <div className="redesign-modal">
        {/* Header */}
        <div className="redesign-modal-header">
          <div className="header-left">
            <div className="icon-wrap">
              <Zap size={20} fill="#ccff00" />
            </div>
            <div>
              <div className="modal-title">Tạo kịch bản chăm sóc</div>
              <div className="modal-sub">Thiết lập quy trình gửi tin tự động</div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="redesign-modal-body">
          <div className="field">
            <label>Tên kịch bản</label>
            <input 
              className="input" 
              type="text" 
              placeholder="Ví dụ: Chào mừng lead lạnh mới..."
              value={formData.ten_kich_ban}
              onChange={e => setFormData({...formData, ten_kich_ban: e.target.value})}
              required
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Dự án áp dụng</label>
              <select 
                className="input"
                value={formData.du_an_id || 'Tất cả dự án'}
                onChange={e => setFormData({...formData, du_an_id: e.target.value})}
              >
                {DU_AN_LIST.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Gửi sau (giờ)</label>
              <div className="delay-wrap">
                <input 
                  className="input" 
                  type="number" 
                  value={formData.delay_hours} 
                  min="0"
                  onChange={e => setFormData({...formData, delay_hours: parseInt(e.target.value) || 0})}
                  style={{ maxWidth: '80px' }}
                />
                <span className="delay-unit">giờ kể từ khi trigger</span>
              </div>
            </div>
          </div>

          <div className="field">
            <label>Phân loại lead</label>
            <div className="score-selector">
              {SCORE_OPTIONS.map(opt => (
                <div 
                  key={opt.key}
                  className={`score-opt ${opt.class} ${formData.lead_score === opt.key ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, lead_score: opt.key})}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Kênh gửi</label>
            <div className="channel-grid">
              {CHANNEL_OPTIONS.map(ch => (
                <div 
                  key={ch.key}
                  className={`channel-opt ${formData.kenh.includes(ch.key) ? 'active' : ''}`}
                  onClick={() => toggleChannel(ch.key)}
                >
                  {ch.icon}
                  <span>{ch.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Nội dung tin nhắn</label>
            <div className="tabs">
              {['zalo', 'sms', 'email'].map(t => (
                <button 
                  key={t}
                  type="button"
                  className={`tab ${activeTab === t ? 'active' : ''}`} 
                  onClick={() => setActiveTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="content-panel">
              {activeTab === 'zalo' && (
                <>
                  <textarea 
                    className="input" 
                    rows="4" 
                    placeholder="Chào {{name}}, cảm ơn bạn đã quan tâm dự án...&#10;&#10;Biến hỗ trợ: {{name}} {{phone}} {{du_an}} {{sales_name}}"
                    value={formData.noi_dung_template.zalo}
                    onChange={e => updateTemplate('zalo', e.target.value)}
                  ></textarea>
                  <div className="char-hint">{formData.noi_dung_template.zalo.length} / 300 ký tự</div>
                </>
              )}
              {activeTab === 'sms' && (
                <>
                  <textarea 
                    className="input" 
                    rows="3" 
                    placeholder="Blanca BĐS: Chào {{name}}, cảm ơn bạn..."
                    value={formData.noi_dung_template.sms}
                    onChange={e => updateTemplate('sms', e.target.value)}
                  ></textarea>
                  <div className="char-hint">{formData.noi_dung_template.sms.length} / 160 ký tự · Tin SMS tiêu chuẩn</div>
                </>
              )}
              {activeTab === 'email' && (
                <>
                  <input 
                    className="input" 
                    type="text" 
                    placeholder="Tiêu đề email..." 
                    style={{ marginBottom: '6px' }}
                    value={formData.noi_dung_template.email.subject}
                    onChange={e => updateTemplate('email', { subject: e.target.value })}
                  />
                  <textarea 
                    className="input" 
                    rows="4" 
                    placeholder="Nội dung email (hỗ trợ HTML)..."
                    value={formData.noi_dung_template.email.body}
                    onChange={e => updateTemplate('email', { body: e.target.value })}
                  ></textarea>
                </>
              )}
            </div>
          </div>

          <div className="tip">
            <Info size={15} color="#60a5fa" />
            <span>Dùng <strong>{"{{name}}"}</strong>, <strong>{"{{du_an}}"}</strong>, <strong>{"{{sales_name}}"}</strong> để cá nhân hóa tin nhắn. Hệ thống tự thay thế khi gửi.</span>
          </div>
        </form>

        <div className="redesign-modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
          <button type="submit" className="btn-primary" onClick={handleSubmit} disabled={loading}>
            <Zap size={16} fill="#0a0d00" />
            {loading ? "Đang xử lý..." : scenario ? "Cập nhật kịch bản" : "Kích hoạt kịch bản"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomationScenarioForm;
