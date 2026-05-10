"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Shield, 
  UserCircle, 
  MoreVertical,
  Loader2,
  Briefcase,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface EmployeesClientProps {
  initialEmployees: any[];
  managers: any[];
}

export function EmployeesClient({ initialEmployees, managers }: EmployeesClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "sales",
    manager_id: "",
    base_commission_rate: "0.01",
    is_active: true
  });

  const filteredEmployees = initialEmployees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || emp.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" ? emp.is_active : !emp.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from("employees")
      .insert([{
        ...formData,
        code: `EMP-${Date.now().toString().slice(-6)}`,
        base_commission_rate: parseFloat(formData.base_commission_rate)
      }]);

    if (error) {
      alert(error.message);
    } else {
      setIsModalOpen(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        role: "sales",
        manager_id: "",
        base_commission_rate: "0.01",
        is_active: true
      });
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm nhân viên..." 
            className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border transition-all font-bold text-sm",
              showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary"
            )}
          >
            <Filter size={18} />
            <span>Bộ lọc</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            <Plus size={18} />
            <span>Thêm nhân viên</span>
          </button>
        </div>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-6 glass-card rounded-2xl border border-primary/20 animate-in slide-in-from-top duration-300">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Chức vụ</label>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'TẤT CẢ' },
                { id: 'admin', label: 'QUẢN TRỊ' },
                { id: 'sales_manager', label: 'QUẢN LÝ' },
                { id: 'accountant', label: 'KẾ TOÁN' },
                { id: 'sales', label: 'KINH DOANH' }
              ].map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    selectedRole === role.id 
                      ? "bg-primary/20 border-primary text-primary" 
                      : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-px bg-border/50 h-10 self-end hidden md:block" />
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Trạng thái</label>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'TẤT CẢ' },
                { id: 'active', label: 'ĐANG LÀM VIỆC' },
                { id: 'inactive', label: 'ĐÃ NGHỈ VIỆC' }
              ].map(status => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    selectedStatus === status.id 
                      ? "bg-primary/20 border-primary text-primary" 
                      : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className="glass-card rounded-3xl p-6 border border-border/50 space-y-6 group hover:border-primary/50 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <MoreVertical size={16} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <UserCircle size={32} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{emp.code}</span>
                <h3 className="font-black text-xl tracking-tight">{emp.full_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={
                    emp.role === 'admin' ? 'destructive' : 
                    emp.role === 'sales_manager' ? 'secondary' : 
                    emp.role === 'accountant' ? 'default' :
                    'outline'
                  }>
                    {emp.role === 'admin' ? 'Quản trị' : 
                     emp.role === 'sales_manager' ? 'Quản lý' : 
                     emp.role === 'accountant' ? 'Kế toán' : 
                     emp.role === 'sales' ? 'Kinh doanh' : 
                     emp.role}
                  </Badge>
                  {!emp.is_active && <Badge variant="destructive">Nghỉ việc</Badge>}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <Mail size={16} className="text-primary/60" />
                <span className="truncate">{emp.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <Phone size={16} className="text-primary/60" />
                <span>{emp.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <Shield size={16} className="text-primary/60" />
                <span>Quản lý: {emp.manager?.full_name || 'Hệ thống'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <Briefcase size={16} className="text-primary/60" />
                <span>Hoa hồng: {emp.base_commission_rate * 100}%</span>
              </div>
            </div>

            <button className="w-full py-2.5 bg-secondary text-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
              Xem hồ sơ
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm nhân viên mới"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Họ và tên</label>
              <input 
                required
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
              <input 
                required
                type="email"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Số điện thoại</label>
              <input 
                required
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Chức vụ</label>
              <select 
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="sales">Kinh doanh (Sale)</option>
                <option value="sales_manager">Quản lý (Manager)</option>
                <option value="accountant">Kế toán (Accountant)</option>
                <option value="admin">Quản trị (Admin)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Người quản lý</label>
              <select 
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.manager_id}
                onChange={e => setFormData({...formData, manager_id: e.target.value})}
              >
                <option value="">Chọn quản lý</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Hoa hồng cơ bản (%)</label>
              <input 
                type="number"
                step="0.01"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.base_commission_rate}
                onChange={e => setFormData({...formData, base_commission_rate: e.target.value})}
              />
            </div>
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20 hover:opacity-90 transition-all mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
            Hoàn tất thêm nhân sự
          </button>
        </form>
      </Modal>
    </div>
  );
}
