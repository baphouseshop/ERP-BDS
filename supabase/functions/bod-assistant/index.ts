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

    // NẾU HỎI VỀ DỮ LIỆU CÔNG VIỆC, HÃY HIỆN DIAGNOSTIC NẾU DỮ LIỆU TRỐNG
    const hasSalesData = context.topSales && Array.isArray(context.topSales) && context.topSales.length > 0;
    
    if (prompt.toLowerCase().includes('nhân viên') && !hasSalesData) {
      return new Response(
        JSON.stringify({ 
          reply: `CHẨN ĐOÁN DỮ LIỆU:\n- Dashboard Stats có nhận được: ${context.topSales ? 'Có biến nhưng rỗng' : 'Biến NULL'}\n- Context Scorecard: ${context.scorecard ? 'Đã nhận' : 'Trống'}\n\nSếp vui lòng đợi Dashboard tải xong hoàn toàn dữ liệu rồi hãy hỏi AI nhé!` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `
      Bạn là Trợ lý Trí tuệ BOD (BOD Intelligence Assistant).
      DỮ LIỆU:
      - KPI: ${JSON.stringify(context.scorecard)}
      - Sales: ${JSON.stringify(context.topSales)}
      - Marketing: ${JSON.stringify(context.marketing)}
      - Dự án: ${JSON.stringify(context.projects)}
      
      Nếu không thấy dữ liệu Sales, hãy báo là "Hệ thống chưa đồng bộ xong dữ liệu Sales".
      Trả lời ngắn gọn, tiếng Việt.
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
