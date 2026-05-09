import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

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
    
    // Ép buộc sử dụng gemini-1.5-flash để dứt điểm lỗi 404 Not Found của các model preview
    const modelName = 'gemini-1.5-flash';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ reply: 'Hệ thống AI chưa tìm thấy API Key. Vui lòng kiểm tra lại Supabase Secrets.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = `
      Bạn là Trợ lý Trí tuệ BOD (BOD Intelligence Assistant) cho Blanca CRM. 
      Bạn đang hỗ trợ trực tiếp cho Ban Giám đốc (BOD).
      
      DỮ LIỆU HIỆN TẠI TỪ HỆ THỐNG:
      - KPI & Scorecard: ${JSON.stringify(context.scorecard)}
      - Cảnh báo sức khỏe dòng tiền (Traffic Lights): ${JSON.stringify(context.alerts)}
      - Lợi nhuận dự án (P&L): ${JSON.stringify(context.projects)}
      
      QUY TẮC PHẢN HỒI:
      1. TRUNG THỰC: Chỉ trả lời dựa trên các chỉ số được cung cấp ở trên.
      2. NGẮN GỌN: Trả lời dưới 100 từ.
      3. CẢNH BÁO: Nhắc nhở nếu có đèn ĐỎ hoặc VÀNG.
      4. NGÔN NGỮ: Tiếng Việt.
    `;

    const result = await model.generateContent(systemPrompt + '\n\nUser: ' + prompt);
    const response = await result.response;
    const reply = response.text();

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function Error:', error);
    return new Response(
      JSON.stringify({ reply: `Lỗi hệ thống (gemini-1.5-flash): ` + error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
