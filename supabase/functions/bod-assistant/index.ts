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
    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('Gemini API Key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ reply: 'LỖI: Không tìm thấy API Key trong Secrets.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // BƯỚC NỘI SOI: Liệt kê các model khả dụng trực tiếp từ Edge Function
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();
    
    if (listData.error) {
      return new Response(
        JSON.stringify({ reply: `LỖI API KEY: ${listData.error.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const availableModels = listData.models?.map(m => m.name.replace('models/', '')) || [];
    
    return new Response(
      JSON.stringify({ 
        reply: `CHẨN ĐOÁN HỆ THỐNG:\n- API Key nhận được: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}\n- Danh sách mô hình khả dụng: ${availableModels.slice(0, 10).join(', ')}... \n\nVui lòng chụp ảnh màn hình này gửi tôi.` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ reply: 'Lỗi chẩn đoán: ' + error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
