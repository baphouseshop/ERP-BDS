"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { 
  User, 
  Plus, 
  Search, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar,
  UserCheck,
  Tag,
  Loader2,
  Filter
} from "lucide-react";

interface CustomersClientProps {
  initialCustomers: any[];
  salesStaff: any[];
}

export function CustomersClient({ initialCustomers, salesStaff }: CustomersClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    id_number: "",
    address: "",
    assigned_sales_id: "",
    source: "marketing"
  });

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...form,
      code: `CUS-${Date.now().toString().slice(-6)}`,
      assigned_sales_id: form.assigned_sales_id || null,
      email: form.email || null,
      id_number: form.id_number || null,
      address: form.address || null
    };

    const { error } = await supabase.from("customers").insert([payload]);
    if (!error) {
      setIsModalOpen(false);
      setForm({
        full_name: "",
        phone: "",
        email: "",
        id_number: "",
        address: "",
        assigned_sales_id: "",
        source: "marketing"
      });
      router.refresh();
    } else {
      alert(error.message);
    }
    setIsLoading(false);
  };

  const filteredCustomers = initialCustomers.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm tên, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground">
            <Filter size={18} />
          </button>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Họ và tên</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Liên hệ</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nguồn / Sales</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ngày tạo</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      <User size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm group-hover:text-primary transition-colors">{customer.full_name}</span>
                      <span className="text-xs text-muted-foreground">ID: {customer.id_number || "---"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Phone size={12} className="text-primary" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail size={12} />
                      <span>{customer.email || "N/A"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] py-0">
                        {customer.source}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserCheck size={12} />
                      <span>{customer.employees?.full_name || "Chưa bàn giao"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={14} />
                    <span>{new Date(customer.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
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
        {filteredCustomers.length === 0 && (
          <div className="p-20 text-center space-y-3">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <User size={32} />
            </div>
            <div>
              <p className="font-bold">Chưa có khách hàng</p>
              <p className="text-sm text-muted-foreground">Bắt đầu bằng cách thêm khách hàng đầu tiên.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Thêm khách hàng mới"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Họ và tên</label>
            <input 
              required
              placeholder="Nguyễn Văn A"
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              value={form.full_name}
              onChange={e => setForm({...form, full_name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Số điện thoại</label>
              <input 
                required
                placeholder="09..."
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Số CMND/CCCD</label>
              <input 
                placeholder="001..."
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={form.id_number}
                onChange={e => setForm({...form, id_number: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
            <input 
              type="email"
              placeholder="khachhang@email.com"
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Phân bổ Sales</label>
            <select 
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              value={form.assigned_sales_id}
              onChange={e => setForm({...form, assigned_sales_id: e.target.value})}
            >
              <option value="">Chưa bàn giao</option>
              {salesStaff.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.full_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Địa chỉ</label>
            <textarea 
              placeholder="Số 123, Đường..."
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 min-h-[80px]"
              value={form.address}
              onChange={e => setForm({...form, address: e.target.value})}
            />
          </div>
          <button 
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Lưu khách hàng
          </button>
        </form>
      </Modal>
    </div>
  );
}
