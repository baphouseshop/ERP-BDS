import { createClient } from "@/lib/supabase/server";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
  const supabase = await createClient();

  const [
    { data: customers },
    { data: salesStaff }
  ] = await Promise.all([
    supabase.from("customers").select("*, employees(full_name)").order("created_at", { ascending: false }),
    supabase.from("employees").select("id, full_name").eq("is_active", true)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Khách hàng</h1>
        <p className="text-muted-foreground font-medium">Danh sách khách hàng và lịch sử tương tác.</p>
      </div>

      <CustomersClient 
        initialCustomers={customers || []} 
        salesStaff={salesStaff || []}
      />
    </div>
  );
}
