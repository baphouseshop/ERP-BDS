"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon,
  Home,
  Maximize2,
  DollarSign,
  Plus,
  Loader2,
  Calendar,
  User,
  CreditCard
} from "lucide-react";

interface UnitsClientProps {
  initialUnits: any[];
  projectId: string;
  customers: any[];
  employees: any[];
}

const statusConfig: Record<string, { label: string, variant: any, color: string }> = {
  available: { label: "Trống", variant: "success", color: "bg-emerald-500" },
  reserved: { label: "Đặt chỗ", variant: "warning", color: "bg-amber-500" },
  contracted: { label: "Đã cọc", variant: "destructive", color: "bg-rose-500" },
  locked: { label: "Khóa", variant: "secondary", color: "bg-slate-500" },
};

export function UnitsClient({ initialUnits, projectId, customers, employees }: UnitsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<string>("all");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    customer_id: "",
    sales_id: "",
    booking_amount: "50000000",
    agreed_price: "",
    booking_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ""
  });

  const blocks = useMemo(() => {
    const b = new Set(initialUnits.map(u => u.block).filter(Boolean));
    return ["all", ...Array.from(b)];
  }, [initialUnits]);

  const filteredUnits = initialUnits.filter(u => {
    const matchesSearch = u.code?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.unit_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlock = selectedBlock === "all" || u.block === selectedBlock;
    return matchesSearch && matchesBlock;
  });

  const handleOpenBooking = (unit: any) => {
    if (unit.status !== 'available') return;
    setSelectedUnit(unit);
    setBookingForm({
      ...bookingForm,
      agreed_price: unit.list_price.toString()
    });
    setIsBookingModalOpen(true);
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    setIsLoading(true);
    
    const { error } = await supabase.from("bookings").insert([{
      booking_number: `BK-${Date.now().toString().slice(-6)}`,
      unit_id: selectedUnit.id,
      customer_id: bookingForm.customer_id,
      sales_id: bookingForm.sales_id,
      booking_amount: parseFloat(bookingForm.booking_amount),
      agreed_price: parseFloat(bookingForm.agreed_price),
      booking_date: bookingForm.booking_date,
      expiry_date: bookingForm.expiry_date,
      notes: bookingForm.notes,
      status: 'active'
    }]);

    if (!error) {
      setIsBookingModalOpen(false);
      router.refresh();
    } else {
      alert(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Inventory Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 glass-card rounded-2xl border border-border/50">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm mã căn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-48"
            />
          </div>
          <select 
            className="bg-secondary/30 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 outline-none"
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
          >
            {blocks.map(b => (
              <option key={b} value={b}>{b === "all" ? "Tất cả Block" : `Block ${b}`}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              alert("Vui lòng sử dụng tính năng 'Import Giỏ hàng' từ trang dự án để thêm sản phẩm hàng loạt. \nTính năng thêm lẻ từng căn đang được phát triển.");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            <span>Thêm sản phẩm</span>
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "grid" ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-secondary text-muted-foreground"
              )}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "list" ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-secondary text-muted-foreground"
              )}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filteredUnits.map((unit) => (
            <div 
              key={unit.id}
              onClick={() => handleOpenBooking(unit)}
              className={cn(
                "group relative p-3 rounded-xl border border-border/50 hover:border-primary/50 transition-all cursor-pointer overflow-hidden",
                unit.status === 'available' ? "bg-white/[0.02]" : "bg-secondary/20 opacity-80"
              )}
            >
              {/* Status Indicator Bar */}
              <div className={cn("absolute top-0 left-0 right-0 h-1", statusConfig[unit.status]?.color || "bg-slate-500")} />
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{unit.block || "A"}-{unit.floor || "0"}</span>
                <span className="text-sm font-bold truncate group-hover:text-primary transition-colors">{unit.unit_number}</span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground">{unit.unit_type || "2BR"}</span>
                <Badge variant={statusConfig[unit.status]?.variant || "secondary"} className="text-[9px] px-1.5 py-0">
                  {statusConfig[unit.status]?.label || unit.status}
                </Badge>
              </div>

              {/* Hover Details */}
              <div className="absolute inset-0 bg-background/95 p-3 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-primary">{unit.code}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Maximize2 size={10} /> {unit.area_usable} m²
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <DollarSign size={10} /> {(unit.list_price / 1000000000).toFixed(2)} Tỷ
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (unit.status === 'available') {
                      handleOpenBooking(unit);
                    } else {
                      alert(`Căn ${unit.code} đang ở trạng thái ${statusConfig[unit.status]?.label}. \nVui lòng chọn căn khác hoặc liên hệ Admin để kiểm tra.`);
                    }
                  }}
                  className="w-full py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {unit.status === 'available' ? 'Đặt chỗ ngay' : 'Chi tiết'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Mã căn</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Vị trí</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Loại / Diện tích</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Giá niêm yết</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-sm group-hover:text-primary transition-colors">{unit.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Block {unit.block}</span>
                      <span className="text-xs text-muted-foreground">Tầng {unit.floor} - {unit.unit_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{unit.unit_type}</span>
                      <span className="text-xs text-muted-foreground">{unit.area_usable} m² ({unit.bedrooms} PN)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">
                    {(unit.list_price / 1000000000).toFixed(2)} Tỷ
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusConfig[unit.status]?.variant || "secondary"}>
                      {statusConfig[unit.status]?.label || unit.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      disabled={unit.status !== 'available'}
                      onClick={() => handleOpenBooking(unit)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-md shadow-primary/10 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      Đặt chỗ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title={`Phiếu đặt chỗ - Căn ${selectedUnit?.code}`}
      >
        <form onSubmit={handleAddBooking} className="space-y-4">
          <div className="p-3 bg-secondary/50 rounded-xl border border-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Giá niêm yết</span>
              <span className="text-sm font-bold text-primary">
                {selectedUnit ? (selectedUnit.list_price / 1000000000).toFixed(2) : 0} Tỷ
              </span>
            </div>
            <Badge variant="success">Available</Badge>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Khách hàng</label>
            <select 
              required
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              value={bookingForm.customer_id}
              onChange={e => setBookingForm({...bookingForm, customer_id: e.target.value})}
            >
              <option value="">Chọn khách hàng</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Nhân viên Sales</label>
            <select 
              required
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              value={bookingForm.sales_id}
              onChange={e => setBookingForm({...bookingForm, sales_id: e.target.value})}
            >
              <option value="">Chọn Sales</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Số tiền cọc (VND)</label>
              <input 
                required
                type="number"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={bookingForm.booking_amount}
                onChange={e => setBookingForm({...bookingForm, booking_amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Giá chốt (VND)</label>
              <input 
                required
                type="number"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={bookingForm.agreed_price}
                onChange={e => setBookingForm({...bookingForm, agreed_price: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Ngày đặt chỗ</label>
              <input 
                required
                type="date"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={bookingForm.booking_date}
                onChange={e => setBookingForm({...bookingForm, booking_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Ngày hết hạn</label>
              <input 
                required
                type="date"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                value={bookingForm.expiry_date}
                onChange={e => setBookingForm({...bookingForm, expiry_date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Ghi chú</label>
            <textarea 
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 min-h-[60px]"
              value={bookingForm.notes}
              onChange={e => setBookingForm({...bookingForm, notes: e.target.value})}
            />
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
            Xác nhận Đặt chỗ
          </button>
        </form>
      </Modal>

      {filteredUnits.length === 0 && (
        <div className="py-20 text-center glass-card rounded-2xl border border-border/50">
          <Home size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-bold">Không có sản phẩm nào</h3>
          <p className="text-muted-foreground">Vui lòng kiểm tra lại bộ lọc hoặc import dữ liệu.</p>
        </div>
      )}
    </div>
  );
}
