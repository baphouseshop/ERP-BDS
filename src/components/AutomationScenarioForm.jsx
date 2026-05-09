import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Save, MessageSquare, Smartphone, Mail, CheckCircle2, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

const AutomationScenarioForm = ({ scenario, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(scenario || {
    ten_kich_ban: '',
    lead_score: 'lanh',
    kenh: ['zalo'],
    noi_dung_template: { zalo: '', sms: '', email: '' },
    delay_hours: 0,
    active: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (scenario?.id) {
        const { error } = await supabase
          .from('automation_scenarios')
          .update(formData)
          .eq('id', scenario.id);
        if (error) throw error;
        toast.success("Đã cập nhật kịch bản");
      } else {
        const { error } = await supabase
          .from('automation_scenarios')
          .insert(formData);
        if (error) throw error;
        toast.success("Đã tạo kịch bản mới");
      }
      onSuccess();
    } catch (error) {
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
        [channel]: value
      }
    }));
  };

  return (
    <div className="modal-overlay glass-modal">
      <div className="modal-content automation-modal premium-card">
        <div className="modal-header">
          <div className="header-icon-main">🤖</div>
          <div className="header-text">
            <h2>{scenario ? 'Cập nhật kịch bản' : 'Tạo kịch bản chăm sóc'}</h2>
            <p>Thiết lập quy trình gửi tin tự động thông minh</p>
          </div>
          <button className="close-btn-round" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-group">
            <label className="premium-label">Tên kịch bản</label>
            <input 
              type="text" 
              className="premium-input"
              value={formData.ten_kich_ban}
              onChange={e => setFormData({...formData, ten_kich_ban: e.target.value})}
              placeholder="Ví dụ: Chào mừng Lead Lạnh mới..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="premium-label">Phân loại Lead</label>
              <select 
                className="premium-select"
                value={formData.lead_score}
                onChange={e => setFormData({...formData, lead_score: e.target.value})}
              >
                <option value="lanh">Lead Lạnh (Cold)</option>
                <option value="am">Lead Ấm (Warm)</option>
                <option value="nong">Lead Nóng (Hot)</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label className="premium-label">Gửi sau (giờ)</label>
              <input 
                type="number" 
                className="premium-input"
                value={formData.delay_hours}
                onChange={e => setFormData({...formData, delay_hours: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="premium-label">Kênh truyền thông (Chọn nhiều)</label>
            <div className="premium-channel-grid">
              <button 
                type="button" 
                className={`channel-card ${formData.kenh.includes('zalo') ? 'selected' : ''}`}
                onClick={() => toggleChannel('zalo')}
              >
                <div className="check-indicator">
                  {formData.kenh.includes('zalo') ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </div>
                <div className="channel-icon zalo"><MessageSquare size={20} /></div>
                <div className="channel-name">Zalo OA</div>
              </button>

              <button 
                type="button" 
                className={`channel-card ${formData.kenh.includes('sms') ? 'selected' : ''}`}
                onClick={() => toggleChannel('sms')}
              >
                <div className="check-indicator">
                  {formData.kenh.includes('sms') ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </div>
                <div className="channel-icon sms"><Smartphone size={20} /></div>
                <div className="channel-name">SMS Brand</div>
              </button>

              <button 
                type="button" 
                className={`channel-card ${formData.kenh.includes('email') ? 'selected' : ''}`}
                onClick={() => toggleChannel('email')}
              >
                <div className="check-indicator">
                  {formData.kenh.includes('email') ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </div>
                <div className="channel-icon email"><Mail size={20} /></div>
                <div className="channel-name">Email Mkt</div>
              </button>
            </div>
          </div>

          {formData.kenh.includes('zalo') && (
            <div className="form-group animate-slide-in">
              <label className="premium-label">Nội dung tin nhắn Zalo</label>
              <textarea 
                className="premium-textarea"
                rows="3"
                value={formData.noi_dung_template.zalo}
                onChange={e => updateTemplate('zalo', e.target.value)}
                placeholder="Chào {{name}}, cảm ơn bạn đã quan tâm dự án..."
              />
            </div>
          )}

          {formData.kenh.includes('sms') && (
            <div className="form-group animate-slide-in">
              <label className="premium-label">Nội dung tin nhắn SMS</label>
              <textarea 
                className="premium-textarea"
                rows="2"
                value={formData.noi_dung_template.sms}
                onChange={e => updateTemplate('sms', e.target.value)}
                placeholder="Blanca BĐS: Cam on {{name}} da..."
              />
            </div>
          )}

          <div className="modal-footer premium-footer">
            <button type="button" className="btn-secondary-premium" onClick={onClose}>Bỏ qua</button>
            <button type="submit" className="btn-primary-premium" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2"><div className="spinner-mini"></div> Đang xử lý...</span>
              ) : (
                <><Save size={18} /> {scenario ? 'Cập nhật ngay' : 'Kích hoạt kịch bản'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutomationScenarioForm;
