import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, context } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('Gemini API Key');
    const modelName = 'gemini-2.5-flash';

    if (!apiKey) {
      return new Response(JSON.stringify({ reply: 'Lỗi: Thiếu API Key.' }), { headers: corsHeaders })
    }

    const systemPrompt = `
      Bạn là Trợ lý Trí tuệ BOD (BOD Intelligence Assistant) cho Blanca CRM. 
      Bạn đang hỗ trợ trực tiếp cho Ban Giám đốc (BOD).
      
      DỮ LIỆU HIỆN TẠI TỪ HỆ THỐNG:
      - KPI & Tài chính: ${JSON.stringify(context.scorecard)}
      - Cảnh báo dòng tiền: ${JSON.stringify(context.alerts)}
      - Hiệu suất Sales (Top 5): ${JSON.stringify(context.topSales)}
      - Chỉ số Marketing: ${JSON.stringify(context.marketing)}
      - Lợi nhuận dự án: ${JSON.stringify(context.projects)}
      
      QUY TẮC PHẢN HỒI:
      1. TRUNG THỰC: Chỉ trả lời dựa trên các chỉ số được cung cấp ở trên.
      2. PHÂN TÍCH: So sánh dữ liệu sales và marketing nếu được hỏi.
      3. NGẮN GỌN: Trả lời dưới 120 từ, tập trung vào con số.
      4. CẢNH BÁO: Nhắc nhở nếu có đèn ĐỎ hoặc VÀNG.
      5. NGÔN NGỮ: Tiếng Việt.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + '\n\nUser: ' + prompt }] }]
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI không trả về kết quả.';

    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ reply: 'Lỗi: ' + error.message }), { headers: corsHeaders })
  }
})
