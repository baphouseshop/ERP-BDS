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
    
    // CHUYỂN SANG 1.5 FLASH ĐỂ ỔN ĐỊNH TUYỆT ĐỐI
    const modelName = 'gemini-1.5-flash';

    if (!apiKey) {
      return new Response(JSON.stringify({ reply: 'Lỗi: Thiếu API Key trong hệ thống.' }), { headers: corsHeaders })
    }

    const systemPrompt = `
      Bạn là Trợ lý Trí tuệ BOD cho Blanca CRM. 
      DỮ LIỆU SALES: ${JSON.stringify(context.topSales || [])}
      KPI: ${JSON.stringify(context.scorecard || {})}
      
      YÊU CẦU:
      - Nếu thấy dữ liệu sales, hãy chỉ ra ai dẫn đầu doanh số (cột "ds").
      - Trả lời bằng tiếng Việt, ngắn gọn dưới 50 từ.
    `;

    // SỬ DỤNG V1 THAY VÌ V1BETA ĐỂ TĂNG ĐỘ ỔN ĐỊNH
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + '\n\nCâu hỏi của Sếp: ' + prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return new Response(JSON.stringify({ reply: `Lỗi API (${data.error.code}): ${data.error.message}` }), { headers: corsHeaders })
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI đang bận, Sếp vui lòng hỏi lại sau giây lát.';

    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ reply: 'Lỗi kết nối: ' + error.message }), { headers: corsHeaders })
  }
})
