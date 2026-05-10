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
    
    // SỬ DỤNG LẠI 2.5 FLASH (BẢN DUY NHẤT HỖ TRỢ TÀI KHOẢN CỦA SẾP)
    const modelName = 'gemini-2.5-flash';

    if (!apiKey) {
       return new Response(JSON.stringify({ reply: 'Hệ thống đang chờ Sếp cập nhật API Key mới.' }), { headers: corsHeaders })
    }

    const systemPrompt = `
      Bạn là Trợ lý Trí tuệ BOD cho Blanca CRM. 
      DỮ LIỆU SALES: ${JSON.stringify(context.topSales || [])}
      KPI: ${JSON.stringify(context.scorecard || {})}
      
      YÊU CẦU:
      - Nêu đích danh người bán tốt nhất (cột "nv") từ dữ liệu.
      - Trả lời tiếng Việt, ngắn gọn.
    `;

    // SỬ DỤNG V1BETA CHO MODEL 2.5
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + '\n\nSếp hỏi: ' + prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return new Response(JSON.stringify({ reply: `Lỗi Gemini (${data.error.code}): ${data.error.message}. Sếp vui lòng cập nhật lại API Key mới.` }), { headers: corsHeaders })
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI không trả về kết quả.';

    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ reply: 'Lỗi hệ thống: ' + error.message }), { headers: corsHeaders })
  }
})
