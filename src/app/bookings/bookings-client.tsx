"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Home, 
  DollarSign, 
  CheckCircle2,
  XCircle,
  FileSignature,
  Loader2,
  Plus
} from "lucide-react";

interface BookingsClientProps {
  initialBookings: any[];
}

const statusConfig: Record<string, { label: string, variant: any }> = {
  active: { label: "Hiệu lực", variant: "success" },
  expired: { label: "Hết hạn", variant: "secondary" },
  converted: { label: "Đã cọc", variant: "warning" },
  cancelled: { label: "Đã hủy", variant: "destructive" },
};

export function BookingsClient({ initialBookings }: BookingsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Contract form state
  const [contractForm, setContractForm] = useState({
    signed_date: new Date().toISOString().split('T')[0],
    total_value: "",
    agreed_commission_rate: ""
  });

  const filteredBookings = initialBookings.filter(b => {
    const matchesSearch = 
      b.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.customers?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.units?.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || b.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const openContractModal = (booking: any) => {
    setSelectedBooking(booking);
    // Convert decimal to percentage for display (e.g. 0.035 -> 3.5)
    const rate = booking.units?.projects?.default_commission_rate || 0.03;
    setContractForm({
      signed_date: new Date().toISOString().split('T')[0],
      total_value: booking.agreed_price?.toString() || "",
      agreed_commission_rate: parseFloat((rate * 100).toFixed(4)).toString()
    });
    setIsContractModalOpen(true);
  };

  const handleConvertToContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setIsLoading(true);

    // Prepare default payment schedule (e.g. 5 installments)
    const total = parseFloat(contractForm.total_value);
    const schedules = [
      { installmentNumber: 1, description: "Đặt cọc", dueDate: contractForm.signed_date, amount: selectedBooking.booking_amount, percentage: (selectedBooking.booking_amount / total * 100).toFixed(2) },
      { installmentNumber: 2, description: "Đợt 1 (10%)", dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: total * 0.1, percentage: 10 },
      { installmentNumber: 3, description: "Đợt 2 (20%)", dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: total * 0.2, percentage: 20 },
      { installmentNumber: 4, description: "Đợt 3 (20%)", dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: total * 0.2, percentage: 20 },
      { installmentNumber: 5, description: "Nhận bàn giao (50%)", dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: total * 0.5, percentage: 50 },
    ];

    const { data, error } = await supabase.rpc('create_sale_contract_full', {
      p_booking_id: selectedBooking.id,
      p_unit_id: selectedBooking.unit_id,
      p_customer_id: selectedBooking.customer_id,
      p_sales_id: selectedBooking.sales_id,
      p_distribution_contract_id: null, // Optional
      p_signed_date: contractForm.signed_date,
      p_total_value: total,
      p_agreed_commission_rate: parseFloat(contractForm.agreed_commission_rate) / 100,
      p_payment_schedules: schedules
    });

    if (!error) {
      setIsContractModalOpen(false);
      router.push('/contracts');
    } else {
      alert(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-64 font-medium"
              />
            </div>
            
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-9 pr-8 py-2 bg-secondary/50 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-semibold cursor-pointer min-w-[150px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hiệu lực</option>
                <option value="expired">Đã hết hạn</option>
                <option value="converted">Đã chuyển đổi</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="glass-card rounded-2xl border border-border/50 p-6 space-y-4 hover:border-primary/50 transition-all group relative overflow-hidden">
            <div className={cn("absolute top-0 right-0 px-4 py-1.5 text-[10px] font-semibold rounded-bl-xl tracking-wider uppercase", 
              booking.status === 'active' ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
            )}>
              {statusConfig[booking.status]?.label || booking.status}
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <CreditCard size={24} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{booking.booking_number}</span>
                <span className="text-xs text-muted-foreground font-medium">Căn: <span className="font-semibold text-primary">{booking.units?.code}</span></span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground flex items-center gap-2"><User size={14} className="opacity-50" /> Khách hàng</span>
                <span className="font-semibold text-foreground">{booking.customers?.full_name}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground flex items-center gap-2"><DollarSign size={14} className="opacity-50" /> Tiền cọc</span>
                <span className="font-bold text-primary">{(booking.booking_amount).toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar size={14} className="opacity-50" /> Hết hạn</span>
                <span className="font-medium text-foreground/70">{new Date(booking.expiry_date).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <button 
                disabled={booking.status !== 'active'}
                onClick={() => openContractModal(booking)}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileSignature size={14} />
                Lập Hợp đồng
              </button>
              <button className="p-2.5 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors">
                <XCircle size={14} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="p-20 text-center glass-card rounded-2xl border border-border/50">
          <CreditCard size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-bold">Chưa có phiếu đặt chỗ</h3>
          <p className="text-muted-foreground">Tạo phiếu đặt chỗ mới từ trang danh sách sản phẩm.</p>
        </div>
      )}

      {/* Contract Modal */}
      <Modal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        title={`Lập Hợp đồng mua bán - ${selectedBooking?.booking_number}`}
      >
        <form onSubmit={handleConvertToContract} className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-2xl border border-border space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Mã căn</span>
              <span className="font-bold">{selectedBooking?.units?.code}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Khách hàng</span>
              <span className="font-bold">{selectedBooking?.customers?.full_name}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Ngày ký hợp đồng</label>
            <input 
              required
              type="date"
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              value={contractForm.signed_date}
              onChange={e => setContractForm({...contractForm, signed_date: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Tổng giá trị (VND)</label>
              <input 
                required
                type="number"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={contractForm.total_value}
                onChange={e => setContractForm({...contractForm, total_value: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Tỷ lệ hoa hồng (%)</label>
              <input 
                required
                type="number"
                step="0.1"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={contractForm.agreed_commission_rate}
                onChange={e => setContractForm({...contractForm, agreed_commission_rate: e.target.value})}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
            <CheckCircle2 size={20} className="text-blue-500 shrink-0" />
            <p className="text-xs text-blue-500 leading-relaxed font-medium">
              Hệ thống sẽ tự động tạo 5 đợt thanh toán chuẩn và cập nhật trạng thái căn hộ sang "Đã cọc".
            </p>
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <FileSignature size={18} />}
            Xác nhận Lập Hợp đồng
          </button>
        </form>
      </Modal>
    </div>
  );
}
