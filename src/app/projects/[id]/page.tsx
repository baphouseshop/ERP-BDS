import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { UnitsClient } from "./units-client";
import { 
  ChevronLeft, 
  Building2, 
  MapPin, 
  Tag, 
  Info, 
  Filter,
  Download,
  Upload
} from "lucide-react";
import Link from "next/link";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: project },
    { data: units },
    { data: customers },
    { data: employees }
  ] = await Promise.all([
    supabase.from("projects").select("*, developers(name)").eq("id", id).single(),
    supabase.from("units").select("*").eq("project_id", id).order("block").order("floor").order("unit_number"),
    supabase.from("customers").select("id, full_name").eq("is_active", true).order("full_name"),
    supabase.from("employees").select("id, full_name").eq("is_active", true).order("full_name")
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/projects" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ChevronLeft size={16} />
          <span>Quay lại danh sách</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <Building2 size={16} className="text-primary" />
                {project.developers?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={16} className="text-primary" />
                {project.address || "Hồ Chí Minh"}
              </span>
              <span className="flex items-center gap-1.5">
                <Tag size={16} className="text-primary" />
                Mã: {project.code}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm font-bold hover:bg-secondary transition-all">
              <Download size={18} />
              <span>Tải mẫu Import</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
              <Upload size={18} />
              <span>Import Giỏ hàng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Units Inventory */}
      <UnitsClient 
        initialUnits={units || []} 
        projectId={id} 
        customers={customers || []} 
        employees={employees || []} 
      />
    </div>
  );
}
