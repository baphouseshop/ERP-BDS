import { createClient } from "@/lib/supabase/server";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const [
    { data: developers },
    { data: projects }
  ] = await Promise.all([
    supabase.from("developers").select("*").order("name"),
    supabase.from("projects").select("*, developers(name)").order("created_at", { ascending: false })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dự án & Đối tác</h1>
        <p className="text-muted-foreground font-medium">Quản lý danh mục dự án và thông tin chủ đầu tư.</p>
      </div>

      <ProjectsClient 
        initialDevelopers={developers || []} 
        initialProjects={projects?.map(p => ({
          ...p,
          default_commission_rate: (p.default_commission_rate || 0) * 100
        })) || []} 
      />
    </div>
  );
}
