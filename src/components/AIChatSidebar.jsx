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
      // 1. Chuẩn bị dữ liệu Top Sales để phân tích sâu
      const salesContext = (allSales || [])
        .map(s => {
          const revenue = s["DS THỰC"] || s["Doanh số"] || s.total_revenue || 0;
          return {
            nv: s["Tên NV"] || s.ho_ten || s.name || "N/A",
            ds: typeof revenue === 'string' ? parseFloat(revenue.replace(/[^\d.]/g, '')) : revenue
          };
        })
        .sort((a, b) => b.ds - a.ds)
        .slice(0, 10);

      // 2. Gọi Edge Function an toàn (không dùng API Key ở Frontend)
      const { data, error } = await supabase.functions.invoke('bod-assistant', {
        body: { 
          prompt: userMessage,
          context: {
            totalStaff: staff?.length || 0,
            topSales: salesContext,
            scorecard: executiveScorecard,
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
