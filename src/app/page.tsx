import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: revenueOverview },
    { data: recentContracts },
    { data: recentExpenses },
    { data: projects },
    { data: revenueGrowth }
  ] = await Promise.all([
    supabase.from("view_revenue_overview").select("*"),
    supabase.from("sale_contracts")
      .select("*, customers(full_name), units(code)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("expenses")
      .select("*")
      .order("expense_date", { ascending: false })
      .limit(5),
    supabase.from("projects").select("*, units(status)"),
    supabase.from("v_revenue_growth_yoy").select("*").order("month", { ascending: true })
  ]);

  // Aggregate stats from view_revenue_overview
  const stats = {
    totalSalesValue: revenueOverview?.reduce((sum, item) => sum + (item.total_sales_value || 0), 0) || 0,
    totalExpectedRevenue: revenueOverview?.reduce((sum, item) => sum + (item.total_expected_revenue || 0), 0) || 0,
    totalReceivedRevenue: revenueOverview?.reduce((sum, item) => sum + (item.total_received_revenue || 0), 0) || 0,
    totalContracts: revenueOverview?.reduce((sum, item) => sum + (item.total_contracts || 0), 0) || 0,
    availableUnits: 0,
    soldUnits: 0,
  };

  if (projects) {
    projects.forEach((p: any) => {
      p.units?.forEach((u: any) => {
        if (u.status === 'available') stats.availableUnits++;
        if (['booked', 'sold', 'locked'].includes(u.status)) stats.soldUnits++;
      });
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Hệ thống Quản trị ERP BĐS</h1>
        <p className="text-muted-foreground font-medium text-lg">Chào mừng quay trở lại. Dưới đây là tổng quan tình hình kinh doanh hôm nay.</p>
      </div>

      <DashboardClient 
        stats={stats} 
        recentContracts={recentContracts || []}
        recentExpenses={recentExpenses || []}
        projects={projects || []}
        revenueOverview={revenueOverview || []}
        revenueGrowth={revenueGrowth || []}
      />
    </div>
  );
}
