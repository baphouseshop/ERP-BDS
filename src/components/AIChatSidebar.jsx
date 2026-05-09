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
  const { dashboardStats, executiveScorecard, trafficLights, projectPL, currentUser, staff, allSales } = useData();
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
      // Chỉ lấy TOP 5 người xuất sắc nhất để tránh làm AI bị quá tải dữ liệu
      const rawSales = (dashboardStats?.topSalesPerformers && dashboardStats.topSalesPerformers.length > 0) 
        ? dashboardStats.topSalesPerformers 
        : (allSales || staff || []);

      const salesContext = rawSales
        .map(s => ({
          nv: s["Tên NV"] || s.ho_ten || s.name || "N/A",
          ds: s["DS THỰC"] || s.total_revenue || s.revenue || 0,
        }))
        .sort((a, b) => b.ds - a.ds)
        .slice(0, 5);

      const systemPrompt = `
        Bạn là Trợ lý Trí tuệ BOD cho Blanca CRM. 
        DỮ LIỆU HIỆN TẠI:
        - Sales (Top 5): ${JSON.stringify(salesContext)}
        - Tài chính: ${JSON.stringify(executiveScorecard)}
        - Dự án: ${JSON.stringify(projectPL)}
        
        NHIỆM VỤ:
        - Nêu đích danh người bán tốt nhất từ danh sách nếu được hỏi.
        - Trả lời tiếng Việt, cực ngắn gọn (dưới 80 từ).
      `;

      // GỌI TRỰC TIẾP GEMINI TỪ FRONTEND ĐỂ TRÁNH LỖI TRUNG GIAN
      const apiKey = "AIzaSyB3N1n_uE9Fna7DrWelugvYpOHtIVxyE-0";
      const modelName = 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + "\n\nUser: " + userMessage }] }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Lỗi Gemini: ${data.error.message}`);
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI không phản hồi.";

      const botMessage = {
        role: 'assistant',
        content: reply
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Lỗi kết nối AI: ${error.message}. Sếp vui lòng kiểm tra lại mạng hoặc API Key.`
      };
      setMessages(prev => [...prev, errorMessage]);
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
          placeholder="Hỏi về doanh thu, lãi lỗ..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>▶</button>
      </form>
    </div>
  );
};

export default AIChatSidebar;
