"use client";

import { 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download,
  Filter,
  PieChart,
  LineChart,
  Wallet,
  Calendar,
  Building2,
  Users2
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    title: "Lợi nhuận gộp",
    value: "12.4 tỷ",
    change: "+15.2%",
    trend: "up",
    subtext: "Toàn công ty YTD",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Dòng tiền dự báo",
    value: "45.8 tỷ",
    change: "+5.4%",
    trend: "up",
    subtext: "Kỳ hạn 30 ngày tới",
    icon: Wallet,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Nợ phải thu quá hạn",
    value: "2.1 tỷ",
    change: "-12%",
    trend: "down",
    subtext: "Aging > 90 ngày",
    icon: Calendar,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    title: "Tỷ lệ chuyển đổi",
    value: "18.5%",
    change: "+2.1%",
    trend: "up",
    subtext: "Booking → Hợp đồng",
    icon: Users2,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export function ReportsClient() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Báo cáo & KPI</h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Phân tích tài chính, hiệu suất sale và dự báo dòng tiền
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-all font-semibold text-sm">
            <Filter size={18} />
            <span>Lọc báo cáo</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all font-semibold text-sm shadow-lg shadow-primary/20">
            <Download size={18} />
            <span>Xuất báo cáo (MISA/Fast)</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="glass-card rounded-[2rem] p-6 border border-white/5 space-y-4 hover:border-primary/20 transition-all group">
            <div className="flex items-center justify-between">
              <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {stat.trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
              <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">{stat.value}</h3>
              <p className="text-[10px] text-muted-foreground font-medium italic">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L by Project */}
        <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">P&L theo dự án</h3>
              <p className="text-xs text-muted-foreground font-medium">Lợi nhuận ròng sau thuế và chi phí MKT</p>
            </div>
            <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground">
              <Building2 size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { name: "Vinhomes Grand Park", revenue: 150000000000, cost: 120000000000, profit: 30000000000, margin: 20 },
              { name: "Akari City", revenue: 85000000000, cost: 65000000000, profit: 20000000000, margin: 23.5 },
              { name: "The 9 Stellars", revenue: 42000000000, cost: 35000000000, profit: 70000000000, margin: 16.6 },
            ].map((project) => (
              <div key={project.name} className="p-4 rounded-2xl bg-secondary/20 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{project.name}</span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+{project.margin}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  <div className="space-y-1">
                    <span>Doanh thu</span>
                    <div className="text-sm text-foreground">{(project.revenue / 1e9).toFixed(1)} tỷ</div>
                  </div>
                  <div className="space-y-1">
                    <span>Chi phí</span>
                    <div className="text-sm text-foreground">{(project.cost / 1e9).toFixed(1)} tỷ</div>
                  </div>
                  <div className="space-y-1">
                    <span>Lợi nhuận</span>
                    <div className="text-sm text-primary">{(project.profit / 1e9).toFixed(1)} tỷ</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Funnel KPI */}
        <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Phễu bán hàng & KPI</h3>
              <p className="text-xs text-muted-foreground font-medium">Hiệu suất chuyển đổi Pipeline</p>
            </div>
            <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground">
              <PieChart size={20} />
            </button>
          </div>
          
          <div className="relative space-y-6">
            {[
              { label: "Leads / Khách hàng tiềm năng", value: 1240, color: "bg-blue-500", percentage: 100 },
              { label: "Bookings / Phiếu đặt chỗ", value: 450, color: "bg-purple-500", percentage: 36 },
              { label: "Contracts / Hợp đồng", value: 185, color: "bg-emerald-500", percentage: 15 },
              { label: "Commission / Đã thu tiền", value: 120, color: "bg-orange-500", percentage: 10 },
            ].map((step) => (
              <div key={step.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">{step.label}</span>
                  <span className="font-bold">{step.value}</span>
                </div>
                <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", step.color)}
                    style={{ width: `${step.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aging Receivables */}
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Tuổi nợ phải thu (Aging Receivable)</h3>
              <p className="text-xs text-muted-foreground font-medium">Phân loại nợ từ Chủ đầu tư theo thời gian</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Trong hạn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Quá hạn 1-30 ngày</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Quá hạn > 90 ngày</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Trong hạn", amount: 25.4, color: "bg-emerald-500" },
              { label: "1-30 ngày", amount: 8.2, color: "bg-orange-500" },
              { label: "31-60 ngày", amount: 4.5, color: "bg-rose-400" },
              { label: "61-90 ngày", amount: 3.1, color: "bg-rose-500" },
              { label: "> 90 ngày", amount: 2.1, color: "bg-rose-600 shadow-lg shadow-rose-500/20" },
            ].map((tier) => (
              <div key={tier.label} className="p-6 rounded-[2rem] bg-secondary/20 border border-white/5 space-y-4 text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{tier.label}</span>
                <div className="text-2xl font-bold">{tier.amount} tỷ</div>
                <div className={cn("h-1.5 w-full rounded-full", tier.color)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
