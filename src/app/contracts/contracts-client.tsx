"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, formatVND, formatBillion } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Home, 
  DollarSign, 
  MoreVertical,
  ChevronRight,
  Printer,
  Download,
  AlertCircle
} from "lucide-react";

interface ContractsClientProps {
  initialContracts: any[];
}

const statusConfig: Record<string, { label: string, variant: any }> = {
  draft: { label: "Bản thảo", variant: "secondary" },
  signed: { label: "Đã ký", variant: "success" },
  cancelled: { label: "Đã hủy", variant: "destructive" },
  completed: { label: "Hoàn tất", variant: "success" },
};

export function ContractsClient({ initialContracts }: ContractsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredContracts = initialContracts.filter(c => {
    const matchesSearch = 
      (c.contract_number || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.customers?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.units?.code || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const openDetail = (contract: any) => {
    setSelectedContract(contract);
    setIsDetailModalOpen(true);
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
                className="pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full md:w-64 font-medium"
              />
            </div>
            
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-9 pr-8 py-2 bg-secondary border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold cursor-pointer min-w-[150px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Bản thảo</option>
                <option value="signed">Đã ký</option>
                <option value="completed">Hoàn tất</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Số Hợp đồng</th>
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Khách hàng</th>
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sản phẩm</th>
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Giá trị</th>
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredContracts.map((contract) => (
              <tr 
                key={contract.id} 
                onClick={() => openDetail(contract)}
                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <FileText size={20} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">{contract.contract_number}</span>
                      <span className="text-[10px] text-muted-foreground/70 font-medium">Ký: {new Date(contract.signed_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold">{contract.customers?.full_name}</span>
                    <span className="text-xs text-muted-foreground">{contract.customers?.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-primary">{contract.units?.code}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{contract.units?.projects?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{formatBillion(contract.total_value)}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Hồng: {contract.agreed_commission_rate}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={statusConfig[contract.status]?.variant || "secondary"}>
                    {statusConfig[contract.status]?.label || contract.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all inline-block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredContracts.length === 0 && (
          <div className="p-20 text-center space-y-3">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <FileText size={32} />
            </div>
            <div>
              <p className="font-bold">Chưa có hợp đồng nào</p>
              <p className="text-sm text-muted-foreground">Danh sách hợp đồng sẽ hiển thị sau khi hoàn tất Booking.</p>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Chi tiết Hợp đồng: ${selectedContract?.contract_number}`}
      >
        {selectedContract && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Khách hàng</p>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-primary" />
                  <span className="text-sm font-bold">{selectedContract.customers?.full_name}</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Sản phẩm</p>
                <div className="flex items-center gap-2">
                  <Home size={14} className="text-primary" />
                  <span className="text-sm font-bold">{selectedContract.units?.code}</span>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Thông tin tài chính</h3>
              <div className="glass-card p-5 rounded-2xl border border-border/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng giá trị HĐ</span>
                  <span className="text-lg font-bold text-primary">{formatVND(selectedContract.total_value)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tỷ lệ hoa hồng</span>
                  <span className="font-bold">{selectedContract.agreed_commission_rate}%</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">Hoa hồng dự kiến</span>
                  <span className="font-bold text-emerald-500">{formatVND(selectedContract.expected_commission_amount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Printer size={16} />
                <span>In hợp đồng</span>
              </button>
              <button 
                onClick={() => {
                  alert("Đang khởi tạo file PDF... Vui lòng chờ trong giây lát.");
                  window.print();
                }}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
              >
                <Download size={16} />
                <span>Tải File PDF</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
              <AlertCircle size={20} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-500 leading-relaxed font-medium">
                Vui lòng kiểm tra kỹ thông tin trước khi thực hiện các thao tác kế toán. Hợp đồng này đã được kích hoạt tiến độ thanh toán tự động.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
