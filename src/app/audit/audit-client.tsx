"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  History, 
  Search, 
  Filter, 
  Eye, 
  ArrowRight, 
  User, 
  Calendar,
  Clock,
  Database,
  Tag,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileJson,
  RefreshCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types ---
interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: any;
  new_data: any;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    role: string;
  };
}

// --- Helpers ---
const tableLabels: Record<string, string> = {
  sale_contracts: "Hợp đồng mua bán",
  commission_records: "Phiếu hoa hồng",
  internal_commissions: "Hoa hồng nội bộ",
  projects: "Dự án",
  units: "Sản phẩm/Căn hộ",
  employees: "Nhân sự",
  expenses: "Chi phí",
  bookings: "Phiếu đặt chỗ",
  cancellations: "Yêu cầu hủy",
  profiles: "Hồ sơ người dùng",
  customers: "Khách hàng",
  developers: "Chủ đầu tư",
  f2_agencies: "Đại lý F2",
  distribution_contracts: "Hợp đồng phân phối",
  payment_schedules: "Tiến độ thanh toán",
  accounting_entries: "Bút toán kế toán",
  accounting_entry_lines: "Chi tiết bút toán"
};

const actionConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  INSERT: { label: "Tạo mới", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  UPDATE: { label: "Cập nhật", color: "text-blue-400", bg: "bg-blue-500/10", icon: RefreshCcw },
  DELETE: { label: "Xóa", color: "text-rose-400", bg: "bg-rose-500/10", icon: XCircle }
};

const formatTime = (dateStr: string) => {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateStr));
};

// --- Components ---
export function AuditClient() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [stats, setStats] = useState({ total: 0, inserts: 0, updates: 0, deletes: 0 });
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        setError(error.message);
        throw error;
      }
      setLogs(data || []);
      setError(null);
      
      // Basic Stats
      if (data) {
        setStats({
          total: data.length,
          inserts: data.filter(l => l.action === 'INSERT').length,
          updates: data.filter(l => l.action === 'UPDATE').length,
          deletes: data.filter(l => l.action === 'DELETE').length,
        });
      }
    } catch (err: any) {
      console.error("Error fetching audit logs:", err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchLogs();
    
    // Set up Realtime subscription
    const channel = supabase
      .channel('audit_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'audit_logs' 
      }, () => {
        fetchLogs(); // Re-fetch for simplicity, or we could append manually
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs, supabase]);

  const filteredLogs = logs.filter(log => {
    const s = search.toLowerCase();
    return (
      (log.table_name || "").toLowerCase().includes(s) ||
      (log.user_email || "").toLowerCase().includes(s) ||
      (log.profiles?.full_name || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Lịch sử Hệ thống
          </h1>
          <p className="text-muted-foreground mt-1">Ghi nhận mọi biến động dữ liệu và hoạt động của người dùng (Audit Trail)</p>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCcw size={18} className={cn(loading && "animate-spin")} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng sự kiện", value: stats.total, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/5", badge: "Ổn định" },
          { label: "Tạo mới (INSERT)", value: stats.inserts, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/5", badge: "Realtime" },
          { label: "Cập nhật (UPDATE)", value: stats.updates, icon: RefreshCcw, color: "text-amber-400", bg: "bg-amber-500/5", badge: "+100.0%" },
          { label: "Xóa (DELETE)", value: stats.deletes, icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/5", badge: "0%" },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="p-6 rounded-[32px] bg-[#0A0A0A] border border-white/5 shadow-2xl backdrop-blur-xl transition-all group hover:border-white/10"
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/5", stat.color)}>
                <stat.icon size={22} />
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">↑ {stat.badge}</span>
              </div>
            </div>
            
            <div className="mt-8 space-y-1">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em]">{stat.label}</p>
              <h3 className="text-4xl font-black tracking-tighter text-white tabular-nums">
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Table Card */}
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col glass-effect">
        <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo bảng, email hoặc người thực hiện..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 flex-1 sm:w-40">
              <option value="">Tất cả bảng</option>
              {Object.entries(tableLabels).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
            <button className="p-2.5 bg-background border border-border rounded-xl hover:bg-secondary transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-border">Thời gian</th>
                <th className="px-6 py-4 border-b border-border">Người thực hiện</th>
                <th className="px-6 py-4 border-b border-border">Phòng ban</th>
                <th className="px-6 py-4 border-b border-border">Hành động</th>
                <th className="px-6 py-4 border-b border-border">Đối tượng thay đổi</th>
                <th className="px-6 py-4 border-b border-border text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4"><div className="h-6 bg-muted rounded w-full" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <AlertCircle size={48} className="mx-auto text-rose-500 mb-4 opacity-50" />
                    <p className="text-rose-500 font-bold">Lỗi truy vấn dữ liệu</p>
                    <p className="text-xs text-muted-foreground mt-2">{error}</p>
                    <button onClick={fetchLogs} className="mt-4 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-bold border border-rose-500/20">Thử lại</button>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                    <History size={48} className="mx-auto opacity-20 mb-4" />
                    <p>Không tìm thấy lịch sử thay đổi nào</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const action = actionConfig[log.action] || { label: log.action, color: "text-gray-400", bg: "bg-gray-500/10", icon: AlertCircle };
                  return (
                    <motion.tr 
                      layout
                      key={log.id} 
                      className="hover:bg-secondary/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{formatTime(log.created_at)}</span>
                          <span className="text-[10px] text-muted-foreground opacity-70">ID: {log.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white tracking-tight">
                              {log.profiles?.full_name || log.user_email?.split('@')[0] || "Hệ thống"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[150px]">
                              {log.user_email || "system@erp.internal"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight",
                          (log.user_role || log.profiles?.role) === 'Admin' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                        )}>
                          {log.user_role || log.profiles?.role || "Hệ thống"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", action.bg, action.color, "border-current/10")}>
                          <action.icon size={14} />
                          {action.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Database size={14} className="text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground/80">{tableLabels[log.table_name] || log.table_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-all group-hover:scale-110"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
          <span className="text-xs text-muted-foreground font-medium">Hiển thị {filteredLogs.length} kết nối gần nhất</span>
          <div className="flex gap-2">
            <button className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-30" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-30" disabled>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[85vh] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl", actionConfig[selectedLog.action]?.bg)}>
                    <FileJson className={cn("w-6 h-6", actionConfig[selectedLog.action]?.color)} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Chi tiết thay đổi</h2>
                    <p className="text-xs text-muted-foreground">ID bản ghi: {selectedLog.record_id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="p-2 hover:bg-secondary rounded-xl transition-colors"
                >
                  <XCircle className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-8">
                {/* Meta info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoItem icon={User} label="Người sửa" value={selectedLog.profiles?.full_name || selectedLog.user_email || "Hệ thống tự động"} />
                  <InfoItem icon={Building} label="Phòng ban" value={selectedLog.profiles?.role || "Automation"} />
                  <InfoItem icon={Calendar} label="Ngày" value={new Date(selectedLog.created_at).toLocaleDateString('vi-VN')} />
                  <InfoItem icon={Clock} label="Giờ" value={new Date(selectedLog.created_at).toLocaleTimeString('vi-VN')} />
                </div>

                {/* Analysis is now the main focus */}
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Activity size={22} />
                    <span className="text-lg font-bold">Mô tả thay đổi thực tế</span>
                  </div>
                  
                  <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                    {selectedLog.action === 'UPDATE' && selectedLog.old_data && selectedLog.new_data ? (
                      Object.keys(selectedLog.new_data).map(key => {
                        // Skip internal tracking fields unless they are the only changes
                        if (['updated_at', 'created_at', 'id'].includes(key)) return null;
                        
                        const oldVal = selectedLog.old_data[key];
                        const newVal = selectedLog.new_data[key];
                        
                        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                          return (
                            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-white/5 last:border-0">
                              <span className="font-bold text-gray-400 min-w-[140px] text-xs uppercase tracking-wider">{key}:</span>
                              <div className="flex items-center gap-3 overflow-hidden">
                                <span className="text-rose-400/80 line-through text-sm truncate max-w-[200px]">
                                  {oldVal === null ? "Trống" : String(oldVal)}
                                </span>
                                <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                                <span className="text-emerald-400 font-bold text-sm">
                                  {newVal === null ? "Xóa bỏ" : String(newVal)}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-primary font-medium">
                          {selectedLog.action === 'INSERT' ? "Bản ghi mới được khởi tạo với toàn bộ thông tin ban đầu." : "Bản ghi đã được xóa hoàn toàn khỏi hệ thống."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-muted/10 text-center">
                <span className="text-xs text-muted-foreground">Nhấn vào vùng trống hoặc nút X để đóng chi tiết</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold truncate">{value}</p>
    </div>
  );
}
