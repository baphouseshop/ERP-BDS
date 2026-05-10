import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const supabase = await createClient();
  
  // Fetch P&L by Project
  const { data: pnlData } = await supabase
    .from("v_pnl_by_project")
    .select("*");

  // Fetch Pipeline Funnel
  const { data: funnelData } = await supabase
    .from("v_pipeline_funnel")
    .select("*");

  // Fetch Aging Receivables
  const { data: agingData } = await supabase
    .from("v_aging_receivable")
    .select("*");

  // Fetch Company Stats (Handling potential array or single object)
  const { data: companyStatsData } = await supabase
    .rpc("fn_company_pnl");

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
