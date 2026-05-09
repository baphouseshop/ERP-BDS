import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useData } from '../context/DataContext';

const AIChatSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào Sếp! Tôi là BOD Assistant. Tôi đã sẵn sàng phân tích dữ liệu tài chính và báo cáo cho Sếp.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { executiveScorecard, projectPL, staff, allSales } = useData();
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 1. Lấy dữ liệu tổng hợp đa chiều từ View v_bod_ai_summary
      const { data: rawSummary } = await supabase
        .from('v_bod_ai_summary')
        .select('*');

      // 2. Chế biến dữ liệu để phù hợp với Prompt của AI hiện tại
      const floorStats = {};
      const salesPerformance = (rawSummary || []).map(row => {
        if (!floorStats[row.ten_san]) {
          floorStats[row.ten_san] = { 
            nhan_vien: row.tong_nhan_vien_cua_san,
            doanh_thu: 0,
            giao_dich: 0
          };
        }
        floorStats[row.ten_san].doanh_thu += parseFloat(row.tong_doanh_thu || 0);
        floorStats[row.ten_san].giao_dich += parseInt(row.tong_giao_dich || 0);

        return {
          ten: row.ten_nhan_vien,
          san: row.ten_san,
          ds: row.tong_doanh_thu,
          gd: row.tong_giao_dich,
          tile: row.ty_le_chuyen_doi_pt + '%'
        };
      });

      // 3. Gọi Edge Function
      const { data, error } = await supabase.functions.invoke('bod-assistant', {
        body: { 
          prompt: userMessage,
          context: {
            totalStaff: staff?.length || 0,
            topSales: salesPerformance, // Truyền toàn bộ danh sách đã chuẩn hóa
            scorecard: { 
              ...executiveScorecard,
              thong_ke_san: floorStats // Chèn thêm thống kê sàn vào scorecard
            },
            projects: projectPL
          }
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Lỗi kết nối: AI chưa thể phản hồi lúc này. Sếp vui lòng kiểm tra lại Key trong Supabase." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button className="ai-trigger-btn" onClick={() => setIsOpen(true)}>
        <div className="ai-btn-icon">✨</div>
        <span>BOD Assistant</span>
      </button>
    );
  }

  return (
    <div className="ai-sidebar-container">
      <div className="ai-sidebar-header">
        <div className="ai-header-title">
          <span className="ai-status-dot"></span>
          BOD Intelligence
        </div>
        <button className="ai-close-btn" onClick={() => setIsOpen(false)}>×</button>
      </div>

      <div className="ai-chat-body">
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.role}`}>
            <div className="ai-message-bubble">
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="ai-message assistant">
            <div className="ai-message-bubble loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="ai-chat-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          placeholder="Hỏi về doanh thu, nhân sự..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>▶</button>
      </form>
    </div>
  );
};

export default AIChatSidebar;
