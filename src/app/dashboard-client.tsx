"use client";

import { 
  Building2, 
  Briefcase, 
  TrendingUp, 
  ArrowUpRight, 
  Clock,
  CheckCircle2,
  AlertCircle,
  PieChart as PieChartIcon,
  Wallet,
  ArrowRightLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  stats: {
    availableUnits: number;
    soldUnits: number;
    totalSalesValue: number;
    totalExpectedRevenue: number;
    totalReceivedRevenue: number;
    totalContracts: number;
  };
  recentContracts: any[];
  recentExpenses: any[];
  projects: any[];
  revenueOverview: any[];
}

export function DashboardClient({ stats, recentContracts, recentExpenses, projects, revenueOverview }: DashboardClientProps) {
  const soldPercentage = (stats.soldUnits / (stats.availableUnits + stats.soldUnits || 1)) * 100;

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Căn hộ khả dụng", value: stats.availableUnits, icon: Building2, color: "blue", sub: "Trong tổng số kho hàng" },
          { label: "Căn hộ đã bán", value: stats.soldUnits, icon: CheckCircle2, color: "emerald", sub: `${soldPercentage.toFixed(1)}% tỉ lệ lấp đầy` },
          { label: "Tổng giá trị HĐ", value: `${(stats.totalSalesValue / 1000000000).toFixed(2)}B`, icon: Briefcase, color: "purple", sub: "Tổng giá trị niêm yết" },
          { label: "Dòng tiền thực thu", value: `${(stats.totalReceivedRevenue / 1000000000).toFixed(2)}B`, icon: TrendingUp, color: "orange", sub: `HH thực thu từ CĐT` },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-3xl p-6 border border-border/50 relative overflow-hidden group hover:border-primary/50 transition-all duration-500">
            <div className={cn(
              "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-110",
              stat.color === "blue" ? "bg-blue-500" :
              stat.color === "emerald" ? "bg-emerald-500" :
              stat.color === "purple" ? "bg-purple-500" :
              "bg-orange-500"
            )} />
            <div className="flex flex-col gap-4 relative z-10">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                stat.color === "blue" ? "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white" :
                stat.color === "emerald" ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
                stat.color === "purple" ? "bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white" :
                "bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white"
              )}>
                <stat.icon size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <span className="text-3xl font-black tracking-tighter">{stat.value}</span>
                <span className="text-[10px] font-bold text-muted-foreground mt-1 opacity-70 italic">{stat.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Performance */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <PieChartIcon className="text-primary" /> Hiệu suất Dự án
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revenueOverview.map((project) => {
              const overview = revenueOverview.find(o => o.project_id === project.project_id);
              const projData = projects.find(p => p.id === project.project_id);
              const total = projData?.units?.length || 0;
              const sold = projData?.units?.filter((u: any) => u.status !== 'available').length || 0;
              const percent = total > 0 ? (sold / total) * 100 : 0;
              
              return (
                <div key={project.project_id} className="glass-card rounded-3xl p-6 border border-border/50 space-y-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-black text-lg truncate max-w-[180px]">{project.project_name}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{project.developer_name}</span>
                    </div>
                    <Badge variant={percent > 80 ? "success" : percent > 50 ? "secondary" : "outline"}>
                      {percent.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase italic">
                      <span>HH phải thu: {(overview?.total_receivable_from_developer / 1000000000).toFixed(2)}B</span>
                      <span>Hợp đồng: {overview?.total_contracts}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Contracts Table */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-black tracking-tight">Hợp đồng vừa ký kết</h3>
            <div className="glass-card rounded-3xl border border-border/50 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/30 border-b border-border">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Số HĐ</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Khách hàng</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Sản phẩm</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground text-right">Giá trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentContracts.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                      <td className="px-6 py-4 text-sm font-black group-hover:text-primary">{c.contract_number}</td>
                      <td className="px-6 py-4 text-sm font-medium">{c.customers?.full_name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{c.units?.code}</td>
                      <td className="px-6 py-4 text-right text-sm font-black text-primary">{(c.total_value / 1000000000).toFixed(2)}B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Activity Log */}
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Clock className="text-primary" /> Chi phí & Biến động
          </h2>
          <div className="space-y-4">
            {recentExpenses.length > 0 ? recentExpenses.map((expense, i) => (
              <div key={expense.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <ArrowRightLeft size={20} />
                  </div>
                  {i !== recentExpenses.length - 1 && <div className="w-px flex-1 bg-border/50 my-1" />}
                </div>
                <div className="flex flex-col gap-1 pb-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{new Date(expense.expense_date).toLocaleDateString('vi-VN')}</span>
                  <span className="text-sm font-medium line-clamp-2">{expense.description}</span>
                  <span className="text-[10px] font-black text-red-500 italic uppercase">- {(expense.total_amount).toLocaleString('vi-VN')} VND</span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground italic text-sm">
                Chưa có chi phí nào được ghi nhận.
              </div>
            )}
          </div>
          
          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-primary" />
              <span className="text-sm font-black italic uppercase tracking-tighter">Cảnh báo Automations</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
              Công cụ Cron tự động quét 8h hàng ngày. Có 5 đợt thanh toán sắp đến hạn trong 3 ngày tới.
            </p>
            <button className="w-full py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
              Chạy quét ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
