"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { 
  Calculator, 
  Search, 
  Filter, 
  DollarSign, 
  ArrowUpRight, 
  Briefcase,
  CheckCircle2,
  Clock,
  MoreVertical,
  ChevronRight,
  User,
  XCircle,
  FileWarning,
  Building2,
  Plus,
  AlertCircle,
  FileText,
  CreditCard,
  UserPlus
} from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface AccountingClientProps {
  commissionRecords: any[];
  internalCommissions: any[];
  cancellations: any[];
}

export function AccountingClient({ 
  commissionRecords,
  internalCommissions,
  cancellations
}: AccountingClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"developer_ar" | "internal_comm" | "cancellations">("developer_ar");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sample data fallback if empty
  const internalData = internalCommissions.length > 0 ? internalCommissions : [
    {
      id: "mock-1",
      employees: { full_name: "Nguyễn Văn A" },
      sale_contracts: { contract_number: "HĐ-2024-001" },
      recipient_type: "SALES_AGENT",
      net_amount: 25000000,
      status: "pending"
    },
    {
      id: "mock-2",
      employees: { full_name: "Trần Thị B" },
      sale_contracts: { contract_number: "HĐ-2024-005" },
      recipient_type: "TEAM_LEADER",
      net_amount: 15000000,
      status: "paid"
    }
  ];

  const cancellationData = cancellations.length > 0 ? cancellations : [
    {
      id: "mock-cancel-1",
      sale_contracts: { contract_number: "HĐ-2023-999" },
      cancellation_number: "CANCEL-001",
      reason: "Khách hàng không đủ khả năng tài chính",
      refund_to_customer: 50000000,
      commission_reversed: 12000000,
      status: "pending"
    }
  ];

  const filteredRecords = commissionRecords.filter(c => {
    const matchesSearch = 
      (c.sale_contracts?.contract_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.projects?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = selectedProject === "all" || c.project_id === selectedProject;
    return matchesSearch && matchesProject;
  });

  const handleReceiveFromDev = async (recordId: string) => {
    if (!confirm("Bạn có chắc chắn xác nhận đã thu tiền từ Chủ đầu tư cho khoản hoa hồng này?")) return;
    setLoadingId(recordId);
    try {
      const { error } = await supabase
        .from('commission_records')
        .update({ 
          status: 'received',
          received_date: new Date().toISOString()
        })
        .eq('id', recordId);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Error confirming payment:", err);
      alert("Lỗi khi xác nhận thu tiền. Vui lòng thử lại.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleApproveInternal = async (recordId: string) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt chi khoản hoa hồng nội bộ này cho nhân viên?")) return;
    setLoadingId(recordId);
    try {
      const { error } = await supabase
        .from('internal_commissions')
        .update({ 
          status: 'paid',
          paid_date: new Date().toISOString()
        })
        .eq('id', recordId);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Error approving commission:", err);
      alert("Lỗi khi duyệt chi. Vui lòng thử lại.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancelContract = async (recordId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xác nhận hủy hợp đồng này? Thao tác này sẽ thu hồi hoa hồng đã tính.")) return;
    setLoadingId(recordId);
    try {
      const { error } = await supabase
        .from('cancellations')
        .update({ 
          status: 'processed',
          processed_date: new Date().toISOString()
        })
        .eq('id', recordId);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Error processing cancellation:", err);
      alert("Lỗi khi xử lý hủy. Vui lòng thử lại.");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredInternal = internalData.filter(i => {
    const matchesSearch = 
      (i.sale_contracts?.contract_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.employees?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const fmt = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num) + " đ";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calculator size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Kế toán & Hoa hồng</h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Duyệt hoa hồng nội bộ và quản lý công nợ Chủ đầu tư
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-48 font-medium"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#00FF88] text-black rounded-xl text-sm font-black shadow-lg shadow-[#00FF88]/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            <span>THÊM MỚI</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-secondary/30 rounded-[1.5rem] w-fit border border-white/5">
        {[
          { id: "developer_ar", label: "Công nợ CĐT", icon: Building2 },
          { id: "internal_comm", label: "Hoa hồng Nội bộ", icon: Briefcase },
          { id: "cancellations", label: "Xử lý Hủy HĐ", icon: FileWarning },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Developer Receivables Tab */}
      {activeTab === "developer_ar" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <div key={record.id} className="glass-card rounded-[2rem] border border-white/5 p-6 space-y-4 hover:border-primary/50 transition-all group">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{record.projects?.name}</span>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">HĐ: {record.sale_contracts?.contract_number}</h3>
                </div>
                <Badge variant={record.status === 'received' ? 'success' : 'secondary'}>
                  {record.status === 'received' ? 'Đã thu' : 'Chờ CĐT'}
                </Badge>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/20 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Số tiền hoa hồng</span>
                  <span className="font-bold text-emerald-500">{fmt(record.commission_amount)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground italic text-[10px]">Tỷ lệ: {parseFloat(((record.commission_rate || 0) * 100).toFixed(4))}%</span>
                  <span className="text-muted-foreground italic text-[10px]">VAT: {fmt(record.vat_amount)}</span>
                </div>
              </div>

              <button 
                onClick={() => handleReceiveFromDev(record.id)}
                disabled={record.status === 'received' || loadingId === record.id}
                className={cn(
                  "w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border",
                  record.status === 'received'
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default"
                    : "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {loadingId === record.id ? (
                  <Clock size={16} className="animate-spin" />
                ) : record.status === 'received' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <DollarSign size={16} />
                )}
                {record.status === 'received' ? 'Đã xác nhận thu tiền' : 'Xác nhận đã thu tiền CĐT'}
              </button>
            </div>
          ))}
          {filteredRecords.length === 0 && (
            <div className="col-span-full py-20 text-center glass-card rounded-[2rem] border border-white/5">
              <Clock size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-bold">Không có công nợ CĐT nào</h3>
              <p className="text-muted-foreground">Tất cả các khoản hoa hồng đã được thu hồi.</p>
            </div>
          )}
        </div>
      )}

      {/* Internal Commissions Tab */}
      {activeTab === "internal_comm" && (
        <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nhân viên</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hợp đồng</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Số tiền thực nhận</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Trạng thái</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInternal.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                        {item.employees?.full_name?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{item.employees?.full_name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.recipient_type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-semibold text-sm">{item.sale_contracts?.contract_number}</span>
                  </td>
                  <td className="px-8 py-6 text-right font-bold text-primary">
                    {fmt(item.net_amount)}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <Badge variant={item.status === 'paid' ? 'success' : 'secondary'}>
                      {item.status === 'paid' ? 'Đã chi' : 'Chờ duyệt'}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleApproveInternal(item.id)}
                      disabled={item.status === 'paid' || loadingId === item.id}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold transition-all",
                        item.status === 'paid'
                          ? "bg-emerald-500/10 text-emerald-500 cursor-default"
                          : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      {item.status === 'paid' ? 'Đã duyệt' : 'Duyệt chi'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancellations Tab */}
      {activeTab === "cancellations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cancellationData.map((item) => (
            <div key={item.id} className="glass-card rounded-[2rem] border border-white/5 p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <XCircle size={48} className={cn(
                    "transition-colors",
                    item.status === 'processed' ? "text-emerald-500/20" : "text-rose-500/10 group-hover:text-rose-500/20"
                  )} />
                </div>
                <div className="space-y-4 flex-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                        item.status === 'processed' ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                      )}>
                        {item.status === 'processed' ? 'Đã xử lý hủy' : 'Hủy giao dịch'}
                      </span>
                      <span className="text-xs text-muted-foreground font-bold">{item.cancellation_number}</span>
                    </div>
                    <h3 className="text-xl font-bold">HĐ: {item.sale_contracts?.contract_number}</h3>
                    <p className="text-sm text-muted-foreground italic">Lý do: {item.reason}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Hoàn khách</span>
                      <div className="font-bold">{fmt(item.refund_to_customer)}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Thu hồi HH</span>
                      <div className="font-bold text-rose-500">-{fmt(item.commission_reversed)}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-end gap-2 min-w-[140px]">
                  <button 
                    onClick={() => handleCancelContract(item.id)}
                    disabled={item.status === 'processed' || loadingId === item.id}
                    className={cn(
                      "w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg",
                      item.status === 'processed'
                        ? "bg-emerald-500/10 text-emerald-500 cursor-default shadow-none"
                        : "bg-rose-500 text-white shadow-rose-500/20 hover:opacity-90"
                    )}
                  >
                    {loadingId === item.id ? <Clock size={16} className="animate-spin mx-auto" /> : item.status === 'processed' ? 'Đã xác nhận' : 'Xác nhận hủy'}
                  </button>
                  <button 
                    onClick={() => alert("Đang mở hồ sơ chi tiết... Vui lòng chờ trong giây lát.")}
                    className="w-full py-2.5 bg-secondary text-muted-foreground rounded-xl text-xs font-bold hover:text-foreground transition-all"
                  >
                    Xem hồ sơ
                  </button>
                </div>
              </div>
            ))}
          </div>
          {cancellationData.length === 0 && (
            <div className="py-20 text-center glass-card rounded-[2rem] border border-white/5 bg-secondary/10">
              <CheckCircle2 size={48} className="mx-auto text-emerald-500/50 mb-4" />
              <h3 className="text-lg font-bold">Không có hồ sơ hủy hợp đồng</h3>
              <p className="text-muted-foreground">Mọi giao dịch đều đang ở trạng thái ổn định.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm giao dịch kế toán mới"
      >
        <div className="space-y-6 py-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
            <AlertCircle className="text-amber-500 shrink-0" size={20} />
            <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
              Thông thường các giao dịch hoa hồng được tự động tạo khi Hợp đồng được ký kết. 
              Chỉ sử dụng tính năng này để điều chỉnh số dư hoặc nhập các khoản chi phí phát sinh đặc biệt.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-secondary/50 border border-white/5 hover:border-primary/50 transition-all text-left group">
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <CreditCard size={20} />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-sm">Ghi nhận công nợ CĐT</div>
                <div className="text-[10px] text-muted-foreground">Tạo yêu cầu thanh toán từ Chủ đầu tư</div>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-secondary/50 border border-white/5 hover:border-emerald-500/50 transition-all text-left group">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <UserPlus size={20} />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-sm">Tạo hoa hồng nội bộ</div>
                <div className="text-[10px] text-muted-foreground">Chi hoa hồng lẻ cho cộng tác viên/nhân viên</div>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-secondary/50 border border-white/5 hover:border-rose-500/50 transition-all text-left group">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <FileText size={20} />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-sm">Xử lý hoàn tiền/Hủy HĐ</div>
                <div className="text-[10px] text-muted-foreground">Ghi nhận hồ sơ khách hàng rút cọc/hủy HĐ</div>
              </div>
            </button>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Chọn một loại giao dịch để tiếp tục
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
