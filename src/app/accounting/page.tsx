import { createClient } from "@/lib/supabase/server";
import { AccountingClient } from "./accounting-client";

export default async function AccountingPage() {
  const supabase = await createClient();

  const [
    { data: entries },
    { data: coa },
    { data: schedules },
    { data: commissionRecords }
  ] = await Promise.all([
    supabase.from("accounting_entries").select("*").order("entry_date", { ascending: false }).limit(50),
    supabase.from("chart_of_accounts").select("*").order("account_code"),
    supabase.from("payment_schedules").select(`
      *,
      sale_contracts(
        contract_number,
        customers(full_name),
        units(code)
      )
    `).eq("status", "pending").order("due_date"),
    supabase.from("commission_records").select(`
      *,
      sale_contracts(contract_number),
      projects(name)
    `).order("created_at", { ascending: false })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Kế toán & Hoa hồng</h1>
        <p className="text-muted-foreground font-medium">Quản lý dòng tiền, bút toán và theo dõi hoa hồng.</p>
      </div>

      <AccountingClient 
        initialEntries={entries || []} 
        coa={coa || []}
        pendingSchedules={schedules || []}
        commissionRecords={commissionRecords || []}
      />
    </div>
  );
}
