import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const supabase = await createClient();
  
  const [
    { data: pnlData },
    { data: funnelData },
    { data: agingData },
    { data: companyStatsData }
  ] = await Promise.all([
    supabase.from("v_pnl_by_project").select("*"),
    supabase.from("v_pipeline_funnel").select("*"),
    supabase.from("v_aging_receivable").select("*"),
    supabase.rpc("fn_company_pnl", { 
      p_period_start: "2026-01-01", 
      p_period_end: "2026-12-31" 
    })
  ]);

  return (
    <div className="container mx-auto py-8">
      <ReportsClient 
        pnlData={pnlData || []} 
        funnelData={funnelData || []} 
        agingData={agingData || []}
        companyStats={companyStatsData ? (Array.isArray(companyStatsData) ? companyStatsData[0] : companyStatsData) : null}
      />
    </div>
  );
}
