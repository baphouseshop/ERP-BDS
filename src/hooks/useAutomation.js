import { useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export const useAutomation = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Kích hoạt kịch bản cho một Lead cụ thể
   */
  const triggerScenario = async (leadId, score) => {
    setLoading(true);
    try {
      // Tìm kịch bản phù hợp nhất
      const { data: scenarios, error: sError } = await supabase
        .from('automation_scenarios')
        .select('*')
        .eq('lead_score', score)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (sError) throw sError;

      if (!scenarios || scenarios.length === 0) {
        console.log('Không tìm thấy kịch bản phù hợp cho score:', score);
        return;
      }

      const scenario = scenarios[0]; // Lấy kịch bản mới nhất

      // Gọi Edge Function để thực hiện gửi tin
      const { error: fError } = await supabase.functions.invoke('send-automation', {
        body: { 
          leadId, 
          scenarioId: scenario.id,
          channels: scenario.kenh,
          templates: scenario.noi_dung_template
        }
      });

      if (fError) throw fError;

      toast.success(`Đã kích hoạt kịch bản: ${scenario.ten_kich_ban}`);
    } catch (error) {
      console.error('Trigger Automation Error:', error);
      toast.error('Lỗi khi kích hoạt tự động hóa');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật điểm số Lead và kích hoạt automation nếu cần
   */
  const updateLeadScore = async (leadId, newScore, reason) => {
    try {
      const { data: currentLead } = await supabase
        .from('leads')
        .select('trang_thai')
        .eq('ma_lead', leadId)
        .single();

      // Lưu lịch sử score
      const { error: scoreError } = await supabase
        .from('lead_scores')
        .insert({
          lead_id: leadId,
          score: newScore,
          ly_do: reason
        });

      if (scoreError) throw scoreError;

      // Kích hoạt kịch bản tương ứng
      await triggerScenario(leadId, newScore);

    } catch (error) {
      console.error('Update Lead Score Error:', error);
    }
  };

  return {
    triggerScenario,
    updateLeadScore,
    loading
  };
};
