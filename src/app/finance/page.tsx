import { createClient } from "@/lib/supabase/server";
import { FinanceClient } from "./finance-client";

export default async function FinancePage() {
  const supabase = await createClient();

  const [
    { data: expenses },
    { data: revenue },
    { data: projects }
  ] = await Promise.all([
    supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
    supabase.from("commission_records").select("*, projects(name)").eq("status", "received"),
    supabase.from("projects").select("id, name")
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Phân tích Tài chính</h1>
        <p className="text-muted-foreground font-medium">Theo dõi hiệu quả hoạt động, chi phí và lợi nhuận tổng thể.</p>
      </div>

      <FinanceClient 
        initialExpenses={expenses || []} 
        initialRevenue={revenue || []}
        projects={projects || []}
      />
    </div>
  );
}
