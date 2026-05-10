"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { 
  Calculator, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  FileText,
  Briefcase,
  CheckCircle2,
  Clock,
  Loader2,
  MoreVertical,
  ChevronRight,
  Plus,
  User
} from "lucide-react";

interface AccountingClientProps {
  initialEntries: any[];
  coa: any[];
  pendingSchedules: any[];
  commissionRecords: any[];
}

export function AccountingClient({ 
  initialEntries, 
  coa, 
  pendingSchedules, 
  commissionRecords 
}: AccountingClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"collections" | "ledger" | "commissions" | "coa">("collections");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    method: "transfer",
    notes: ""
  });

  const handleOpenPayment = (schedule: any) => {
    setSelectedSchedule(schedule);
    setPaymentForm({
      ...paymentForm,
      amount: (schedule.amount - (schedule.paid_amount || 0)).toString()
    });
    setIsPaymentModalOpen(true);
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    setIsLoading(true);

    // Call RPC or perform multiple inserts
    // For now, let's just update the schedule and create an entry
    // Ideally, this should be an RPC to ensure atomicity
    
    const amount = parseFloat(paymentForm.amount);
    
    // 1. Update Payment Schedule
    const { error: scheduleError } = await supabase
      .from("payment_schedules")
      .update({
        paid_amount: (selectedSchedule.paid_amount || 0) + amount,
        paid_date: paymentForm.payment_date,
        status: amount >= selectedSchedule.amount ? 'paid' : 'partial'
      })
      .eq("id", selectedSchedule.id);

    if (scheduleError) {
      alert(scheduleError.message);
      setIsLoading(false);
      return;
    }

    // 2. Create Accounting Entry
    const { data: entry, error: entryError } = await supabase
      .from("accounting_entries")
      .insert([{
        entry_number: `PT-${Date.now().toString().slice(-6)}`,
        entry_date: paymentForm.payment_date,
        description: `Thu tiền đợt ${selectedSchedule.installment_number} - HĐ: ${selectedSchedule.sale_contracts?.contract_number}`,
        total_amount: amount,
        source_table: 'payment_schedules',
        source_id: selectedSchedule.id
      }])
      .select()
      .single();

    if (entryError) {
      alert(entryError.message);
    } else {
      // 3. Create Entry Lines (Debit Cash/Bank, Credit Receivables)
      await supabase.from("accounting_entry_lines").insert([
        {
          entry_id: entry.id,
          line_number: 1,
          account_code: paymentForm.method === 'transfer' ? '112' : '111', // Bank or Cash
          entry_type: 'debit',
          amount: amount,
          partner_type: 'customer',
          partner_id: selectedSchedule.sale_contracts?.customers?.id
        },
        {
          entry_id: entry.id,
          line_number: 2,
          account_code: '131', // Accounts Receivable
          entry_type: 'credit',
          amount: amount,
          partner_type: 'customer',
          partner_id: selectedSchedule.sale_contracts?.customers?.id
        }
      ]);

      setIsPaymentModalOpen(false);
      router.refresh();
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl w-fit border border-border">
        {[
          { id: "collections", label: "Thu tiền", icon: ArrowDownLeft },
          { id: "ledger", label: "Sổ cái", icon: FileText },
          { id: "commissions", label: "Hoa hồng", icon: Briefcase },
          { id: "coa", label: "Hệ thống tài khoản", icon: Calculator },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "collections" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingSchedules.map((schedule) => (
            <div key={schedule.id} className="glass-card rounded-2xl border border-border/50 p-6 space-y-4 hover:border-primary/50 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Hợp đồng: {schedule.sale_contracts?.contract_number}</span>
                  <span className="font-bold text-lg group-hover:text-primary transition-colors">{schedule.description}</span>
                </div>
                <Badge variant={new Date(schedule.due_date) < new Date() ? "destructive" : "secondary"}>
                  {new Date(schedule.due_date) < new Date() ? "Quá hạn" : "Sắp tới"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><User size={14} /> Khách hàng</span>
                  <span className="font-bold">{schedule.sale_contracts?.customers?.full_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><DollarSign size={14} /> Số tiền</span>
                  <span className="font-bold text-primary">{(schedule.amount).toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar size={14} /> Hạn chót</span>
                  <span className="font-medium">{new Date(schedule.due_date).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <button 
                onClick={() => handleOpenPayment(schedule)}
                className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={14} />
                Xác nhận thu tiền
              </button>
            </div>
          ))}
          {pendingSchedules.length === 0 && (
            <div className="col-span-full py-20 text-center glass-card rounded-2xl border border-border/50">
              <Clock size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-bold">Không có khoản thu nào chờ xử lý</h3>
              <p className="text-muted-foreground">Tất cả các đợt thanh toán đã được hoàn tất hoặc chưa tới hạn.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "ledger" && (
        <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Số bút toán</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ngày</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Diễn giải</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {initialEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <span className="font-bold text-sm group-hover:text-primary transition-colors">{entry.entry_number}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(entry.entry_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium truncate max-w-xs">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-sm">{(entry.total_amount).toLocaleString('vi-VN')} VND</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "commissions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commissionRecords.map((record) => (
            <div key={record.id} className="glass-card rounded-2xl border border-border/50 p-6 space-y-4 hover:border-primary/50 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Briefcase size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{record.projects?.name}</span>
                  <span className="font-bold text-lg group-hover:text-primary transition-colors">{(record.commission_amount / 1000000).toFixed(1)}Tr VND</span>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Số HĐ</span>
                  <span className="font-bold">{record.sale_contracts?.contract_number}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tỷ lệ</span>
                  <span className="font-bold">{record.commission_rate * 100}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Trạng thái</span>
                  <Badge variant={record.status === 'received' ? 'success' : 'secondary'}>{record.status}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "coa" && (
        <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Mã tài khoản</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên tài khoản</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {coa.map((account) => (
                <tr key={account.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-primary text-sm">{account.account_code}</td>
                  <td className="px-6 py-4 text-sm font-medium">{account.account_name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground uppercase">{account.account_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Xác nhận thu tiền"
      >
        <form onSubmit={handleCollectPayment} className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-2xl border border-border space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Khách hàng</span>
              <span className="font-bold">{selectedSchedule?.sale_contracts?.customers?.full_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Khoản thu</span>
              <span className="font-bold">{selectedSchedule?.description}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Số tiền thu thực tế (VND)</label>
            <input 
              required
              type="number"
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              value={paymentForm.amount}
              onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Ngày thu</label>
            <input 
              required
              type="date"
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              value={paymentForm.payment_date}
              onChange={e => setPaymentForm({...paymentForm, payment_date: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Phương thức</label>
            <select 
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              value={paymentForm.method}
              onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}
            >
              <option value="transfer">Chuyển khoản</option>
              <option value="cash">Tiền mặt</option>
            </select>
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-500 hover:text-white transition-all duration-300"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
            Xác nhận giao dịch
          </button>
        </form>
      </Modal>
    </div>
  );
}
