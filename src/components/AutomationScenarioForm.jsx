import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Save, MessageSquare, Smartphone, Mail } from 'lucide-react';
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
    <div className="modal-overlay">
      <div className="modal-content automation-modal">
        <div className="modal-header">
          <h2>{scenario ? 'Sửa kịch bản' : 'Tạo kịch bản chăm sóc'}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên kịch bản</label>
            <input 
              type="text" 
              className="input-field"
              value={formData.ten_kich_ban}
              onChange={e => setFormData({...formData, ten_kich_ban: e.target.value})}
              placeholder="Ví dụ: Chăm sóc Lead Lạnh mới nhận"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Áp dụng cho Lead</label>
              <select 
                className="input-field"
                value={formData.lead_score}
                onChange={e => setFormData({...formData, lead_score: e.target.value})}
              >
                <option value="lanh">Lead Lạnh (Cold)</option>
                <option value="am">Lead Ấm (Warm)</option>
                <option value="nong">Lead Nóng (Hot)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Gửi sau (giờ)</label>
              <input 
                type="number" 
                className="input-field"
                value={formData.delay_hours}
                onChange={e => setFormData({...formData, delay_hours: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Chọn kênh gửi</label>
            <div className="channel-selector">
              <button 
                type="button" 
                className={`channel-btn ${formData.kenh.includes('zalo') ? 'active' : ''}`}
                onClick={() => toggleChannel('zalo')}
              >
                <MessageSquare size={16} /> Zalo
              </button>
              <button 
                type="button" 
                className={`channel-btn ${formData.kenh.includes('sms') ? 'active' : ''}`}
                onClick={() => toggleChannel('sms')}
              >
                <Smartphone size={16} /> SMS
              </button>
              <button 
                type="button" 
                className={`channel-btn ${formData.kenh.includes('email') ? 'active' : ''}`}
                onClick={() => toggleChannel('email')}
              >
                <Mail size={16} /> Email
              </button>
            </div>
          </div>

          {formData.kenh.includes('zalo') && (
            <div className="form-group">
              <label>Nội dung Zalo</label>
              <textarea 
                className="input-field"
                rows="3"
                value={formData.noi_dung_template.zalo}
                onChange={e => updateTemplate('zalo', e.target.value)}
                placeholder="Chào {{name}}, cảm ơn bạn đã quan tâm dự án..."
              />
            </div>
          )}

          {formData.kenh.includes('sms') && (
            <div className="form-group">
              <label>Nội dung SMS</label>
              <textarea 
                className="input-field"
                rows="2"
                value={formData.noi_dung_template.sms}
                onChange={e => updateTemplate('sms', e.target.value)}
                placeholder="Blanca BĐS: Cam on {{name}} da..."
              />
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu kịch bản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutomationScenarioForm;
