"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  X, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Minus,
  Loader2,
  Trash2,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý AI CRM của bạn. Tôi có thể giúp bạn kiểm tra trạng thái dự án, thống kê hoa hồng hoặc phân tích khách hàng. Bạn cần giúp gì hôm nay?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Mock AI Response Logic
    setTimeout(() => {
      let aiResponse = "Xin lỗi, tôi đang được đồng bộ hóa với cơ sở dữ liệu CRM. Bạn có thể hỏi về các dự án như Vinhomes Grand Park hoặc yêu cầu báo cáo doanh thu.";
      
      const prompt = input.toLowerCase();
      if (prompt.includes("dự án")) {
        aiResponse = "Hiện tại hệ thống có 2 dự án đang mở bán: Vinhomes Grand Park (Hồ Chí Minh) và Global City. Tổng giỏ hàng còn khoảng 450 căn trống.";
      } else if (prompt.includes("hoa hồng") || prompt.includes("lương")) {
        aiResponse = "Tổng hoa hồng chờ duyệt tháng này là 1.2 tỷ VND. Top 3 Sales có doanh số cao nhất là Nguyễn Văn A, Trần Thị B, và Lê Văn C.";
      } else if (prompt.includes("khách hàng")) {
        aiResponse = "Có 12 khách hàng mới được thêm vào hôm nay. Trong đó có 3 khách hàng quan tâm dự án Vinhomes và đã được chuyển cho đội ngũ Sales tư vấn.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-50 transition-all duration-300",
          isOpen ? "bg-rose-500 rotate-90" : "bg-primary"
        )}
      >
        {isOpen ? <X className="text-white" size={24} /> : <Bot className="text-white" size={28} />}
        
        {/* Notification Badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-background animate-pulse" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-140px)] glass-card rounded-[2.5rem] border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-primary/10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">AI CRM Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Trực tuyến</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setMessages([messages[0]])}
                  className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground transition-colors"
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === "user" ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-2xl text-sm font-medium leading-relaxed",
                    msg.role === "user" 
                      ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10" 
                      : "bg-secondary/50 text-foreground rounded-tl-none border border-white/5"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1.5 px-1 uppercase font-bold tracking-tighter opacity-50">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex flex-col items-start max-w-[85%]">
                  <div className="bg-secondary/50 p-4 rounded-2xl rounded-tl-none border border-white/5">
                    <div className="flex gap-1">
                      <motion.span 
                        animate={{ opacity: [0, 1, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}
                        className="w-1.5 h-1.5 bg-primary rounded-full" 
                      />
                      <motion.span 
                        animate={{ opacity: [0, 1, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1], delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-primary rounded-full" 
                      />
                      <motion.span 
                        animate={{ opacity: [0, 1, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1], delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-primary rounded-full" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-secondary/20 border-t border-white/5">
              <form 
                onSubmit={handleSend}
                className="relative flex items-center gap-2"
              >
                <div className="relative flex-1 group">
                  <input 
                    type="text"
                    placeholder="Hỏi AI về CRM của bạn..."
                    className="w-full bg-secondary/50 border border-white/5 rounded-2xl px-5 py-3.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity">
                    <Sparkles size={16} />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-3.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </form>
              <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">
                <MessageSquare size={10} />
                <span>AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin quan trọng.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
