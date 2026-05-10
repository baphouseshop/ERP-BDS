import { createClient } from "@/lib/supabase/server";
import { EmployeesClient } from "./employees-client";

export default async function EmployeesPage() {
  const supabase = await createClient();

  const [
    { data: employees },
    { data: managers }
  ] = await Promise.all([
    supabase.from("employees").select(`
      *,
      manager:manager_id(full_name),
      team_leader:team_leader_id(full_name)
    `).order("full_name"),
    supabase.from("employees").select("id, full_name").eq("is_active", true)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Nhân sự</h1>
        <p className="text-muted-foreground font-medium text-lg">Quản lý đội ngũ, phân quyền và cấu hình hoa hồng cá nhân.</p>
      </div>

      <EmployeesClient initialEmployees={employees || []} managers={managers || []} />
    </div>
  );
}
