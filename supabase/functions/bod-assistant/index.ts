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
      Bạn là Trợ lý Trí tuệ BOD cho Blanca CRM. 
      DỮ LIỆU SALES THỰC TẾ: ${JSON.stringify(context.topSales)}
      KPI & TÀI CHÍNH: ${JSON.stringify(context.scorecard)}
      
      YÊU CẦU:
      1. Đọc cột "nv" là Tên nhân viên, "ds" là Doanh số.
      2. Nếu Sếp hỏi ai dẫn đầu, hãy nêu đích danh tên từ danh sách "topSales" có "ds" cao nhất.
      3. Trả lời cực ngắn, đi thẳng vào vấn đề.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + '\n\nUser: ' + prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
        }
      })
    });

    const data = await response.json();
    
    // Debug lỗi nếu API không trả về content
    if (!data.candidates || data.candidates.length === 0) {
       return new Response(JSON.stringify({ reply: 'Gemini API không phản hồi (Cấu trúc rỗng).' }), { headers: corsHeaders })
    }

    const reply = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ reply: 'Lỗi hệ thống: ' + error.message }), { headers: corsHeaders })
  }
})
