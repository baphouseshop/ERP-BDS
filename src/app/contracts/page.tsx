import { createClient } from "@/lib/supabase/server";
import { ContractsClient } from "./contracts-client";

export default async function ContractsPage() {
  const supabase = await createClient();

  // Fetch contracts with related data
  const { data: contracts } = await supabase
    .from("sale_contracts")
    .select(`
      *,
      units(code, unit_number, block, floor, projects(name)),
      customers(full_name, phone),
      employees(full_name)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Hợp đồng mua bán</h1>
        <p className="text-muted-foreground font-medium">Quản lý danh sách hợp đồng và tiến độ thanh toán.</p>
      </div>

      <ContractsClient initialContracts={contracts || []} />
    </div>
  );
}
