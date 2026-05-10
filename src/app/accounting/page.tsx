import { createClient } from "@/lib/supabase/server";
import { AccountingClient } from "./accounting-client";

export default async function AccountingPage() {
  const supabase = await createClient();

  const [
    { data: commissionRecords },
    { data: internalCommissions },
    { data: cancellations },
    { data: projects }
  ] = await Promise.all([
    supabase.from("commission_records").select(`
      *,
      sale_contracts(contract_number),
      projects(name)
    `).order("created_at", { ascending: false }),
    supabase.from("internal_commissions").select(`
      *,
      sale_contracts(contract_number),
      employees(full_name)
    `).order("created_at", { ascending: false }),
    supabase.from("cancellations").select(`
      *,
      sale_contracts(contract_number)
    `).order("created_at", { ascending: false }),
    supabase.from("projects").select("*").order("name")
  ]);

  return (
    <div className="container mx-auto py-8">
      <AccountingClient 
        commissionRecords={commissionRecords || []}
        internalCommissions={internalCommissions || []}
        cancellations={cancellations || []}
        projects={projects || []}
      />
    </div>
  );
}
