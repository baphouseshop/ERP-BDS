"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  MapPin, 
  Mail, 
  Phone,
  LayoutGrid,
  List as ListIcon,
  Loader2
} from "lucide-react";

interface ProjectsClientProps {
  initialDevelopers: any[];
  initialProjects: any[];
}

export function ProjectsClient({ initialDevelopers, initialProjects }: ProjectsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"projects" | "developers">("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [devForm, setDevForm] = useState({ name: "", code: "", contact_email: "", contact_phone: "" });
  const [projForm, setProjForm] = useState({ 
    name: "", 
    code: "", 
    developer_id: "", 
    default_commission_rate: "3", 
    address: "", 
    image_url: "",
    total_units: "0",
    min_price: "0"
  });

  const handleAddDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Xác nhận thêm mới Chủ đầu tư: ${devForm.name}?`)) return;
    setIsLoading(true);
    const { error } = await supabase.from("developers").insert([devForm]);
    if (!error) {
      setIsModalOpen(false);
      setDevForm({ name: "", code: "", contact_email: "", contact_phone: "" });
      router.refresh();
    } else {
      alert(error.message);
    }
    setIsLoading(false);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Xác nhận thêm mới Dự án: ${projForm.name}?`)) return;
    setIsLoading(true);
    const { error } = await supabase.from("projects").insert([{
      ...projForm,
      default_commission_rate: parseFloat(projForm.default_commission_rate) / 100
    }]);
    if (!error) {
      setIsModalOpen(false);
      setProjForm({ 
        name: "", 
        code: "", 
        developer_id: "", 
        default_commission_rate: "3", 
        address: "", 
        image_url: "",
        total_units: "0",
        min_price: "0"
      });
      router.refresh();
    } else {
      alert(error.message);
    }
    setIsLoading(false);
  };

  const filteredDevelopers = initialDevelopers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = initialProjects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex p-1 bg-secondary/50 rounded-xl border border-border w-fit">
          <button
            onClick={() => setActiveTab("projects")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
              activeTab === "projects" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Dự án
          </button>
          <button
            onClick={() => setActiveTab("developers")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
              activeTab === "developers" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Chủ đầu tư
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={activeTab === "projects" ? "Thêm dự án mới" : "Thêm chủ đầu tư mới"}
      >
        {activeTab === "projects" ? (
          <form onSubmit={handleAddProject} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Mã dự án</label>
                <input 
                  required
                  placeholder="VGP"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                  value={projForm.code}
                  onChange={e => setProjForm({...projForm, code: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Hoa hồng (%)</label>
                <input 
                  required
                  type="number"
                  step="0.1"
                  placeholder="3"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                  value={projForm.default_commission_rate}
                  onChange={e => setProjForm({...projForm, default_commission_rate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Tên dự án</label>
              <input 
                required
                placeholder="Vinhomes Grand Park"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={projForm.name}
                onChange={e => setProjForm({...projForm, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Giỏ hàng (Căn)</label>
                <input 
                  required
                  type="number"
                  placeholder="100"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                  value={projForm.total_units}
                  onChange={e => setProjForm({...projForm, total_units: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Giá bán từ (Tỷ)</label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  placeholder="2.5"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                  value={projForm.min_price}
                  onChange={e => setProjForm({...projForm, min_price: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Ảnh bìa (URL)</label>
              <input 
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={projForm.image_url}
                onChange={e => setProjForm({...projForm, image_url: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Chủ đầu tư</label>
              <select 
                required
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={projForm.developer_id}
                onChange={e => setProjForm({...projForm, developer_id: e.target.value})}
              >
                <option value="">Chọn chủ đầu tư</option>
                {initialDevelopers.map(dev => (
                  <option key={dev.id} value={dev.id}>{dev.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Địa chỉ</label>
              <textarea 
                placeholder="Quận 9, TP.HCM"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                value={projForm.address}
                onChange={e => setProjForm({...projForm, address: e.target.value})}
              />
            </div>
            <button 
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Lưu dự án
            </button>
          </form>
        ) : (
          <form onSubmit={handleAddDeveloper} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Mã CĐT</label>
                <input 
                  required
                  placeholder="VIC"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                  value={devForm.code}
                  onChange={e => setDevForm({...devForm, code: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Số điện thoại</label>
                <input 
                  placeholder="090..."
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                  value={devForm.contact_phone}
                  onChange={e => setDevForm({...devForm, contact_phone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Tên chủ đầu tư</label>
              <input 
                required
                placeholder="Tập đoàn Vingroup"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={devForm.name}
                onChange={setDevForm ? e => setDevForm({...devForm, name: e.target.value}) : undefined}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Email liên hệ</label>
              <input 
                type="email"
                placeholder="contact@cdt.com"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={devForm.contact_email}
                onChange={e => setDevForm({...devForm, contact_email: e.target.value})}
              />
            </div>
            <button 
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Lưu chủ đầu tư
            </button>
          </form>
        )}
      </Modal>

      {/* Content */}
      {activeTab === "projects" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="glass-card rounded-2xl overflow-hidden group hover:border-primary/30 transition-all duration-300">
              <div className="h-48 bg-secondary/50 relative overflow-hidden">
                {project.image_url ? (
                  <img 
                    src={project.image_url} 
                    alt={project.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                    <Building2 size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute top-4 right-4">
                  <Badge variant={project.is_active ? "success" : "secondary"}>
                    {project.is_active ? "Đang bán" : "Tạm ngưng"}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-bold text-xl text-white truncate group-hover:text-primary transition-colors">{project.name}</h3>
                  <p className="text-sm text-white/70 flex items-center gap-1 mt-1">
                    <Building2 size={14} />
                    {project.developers?.name}
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{project.address || "Chưa cập nhật địa chỉ"}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Giỏ hàng</p>
                    <p className="text-sm font-semibold mt-0.5">{project.total_units || 0} căn</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Giá từ</p>
                    <p className="text-sm font-semibold mt-0.5 text-primary">~{project.min_price || 0} tỷ</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Mã dự án</p>
                    <p className="text-sm font-semibold mt-0.5">{project.code}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Hoa hồng</p>
                    <p className="text-sm font-semibold mt-0.5 text-primary">{(project.default_commission_rate || 0).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                        {i}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                      +12
                    </div>
                  </div>
                  <Link 
                    href={`/projects/${project.id}`}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-border/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Chủ đầu tư</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Liên hệ</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredDevelopers.map((dev) => (
                <tr key={dev.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-bold">
                        {dev.code.substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm group-hover:text-primary transition-colors">{dev.name}</span>
                        <span className="text-xs text-muted-foreground uppercase">{dev.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail size={12} />
                        <span>{dev.contact_email || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone size={12} />
                        <span>{dev.contact_phone || "N/A"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={dev.is_active ? "success" : "secondary"}>
                      {dev.is_active ? "Hoạt động" : "Tạm khóa"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDevelopers.length === 0 && (
            <div className="p-20 text-center space-y-3">
              <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Building2 size={32} />
              </div>
              <div>
                <p className="font-bold">Không tìm thấy chủ đầu tư</p>
                <p className="text-sm text-muted-foreground">Thử tìm kiếm với từ khóa khác.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
