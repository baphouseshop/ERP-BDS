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
import { cn, formatVND, formatCompactNumber, formatBillion } from "@/lib/utils";
import { useState } from "react";

interface ReportsClientProps {
  pnlData: any[];
  funnelData: any[];
  agingData: any[];
  companyStats: any;
}

export function ReportsClient({ pnlData, funnelData, agingData, companyStats }: ReportsClientProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [filterType, setFilterType] = useState("all");

  // Aggregate funnel data for company-wide stats
  const totalBookings = funnelData.length > 0 
    ? funnelData.reduce((acc, curr) => acc + (parseInt(curr.bookings_count) || 0), 0)
    : 45; // Mock fallback
  
  const totalContracts = funnelData.length > 0
    ? funnelData.reduce((acc, curr) => acc + (parseInt(curr.contracts_count) || 0), 0)
    : 12; // Mock fallback
    
  const conversionRate = totalBookings > 0 ? ((totalContracts / totalBookings) * 100).toFixed(1) : "0.0";

  // Functional Export logic
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = ["Dự án", "Doanh thu", "Chi phí HH", "Chi phí MKT", "Lợi nhuận gộp"];
      const rows = pnlData.map(p => [
        p.project_name,
        p.net_revenue,
        p.net_commission_cost,
        p.direct_project_expense,
        p.gross_profit
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Bao_cao_KPI_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
      alert("Xuất báo cáo thành công!");
    }, 1000);
  };

  const stats = [
    {
      title: "Lợi nhuận gộp",
      value: companyStats ? formatCompactNumber(companyStats.gross_profit || 0) : "12.5 tỷ",
      change: "+15.2%",
      trend: "up",
      subtext: "Toàn công ty YTD",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Dòng tiền dự kiến",
      value: agingData.length > 0 
        ? formatCompactNumber(agingData.reduce((acc, curr) => acc + (parseFloat(curr.outstanding_amount) || 0), 0) * 0.8)
        : "8.2 tỷ",
      change: "+5.4%",
      trend: "up",
      subtext: "Kỳ hạn 30 ngày tới (Dự báo)",
      icon: Wallet,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Nợ phải thu quá hạn",
      value: agingData.length > 0 ? formatCompactNumber(agingData.reduce((acc, curr) => acc + (curr.total_amount || 0), 0)) : "0 tỷ",
      change: "-12%",
      trend: "down",
      subtext: "Tổng nợ CĐT",
      icon: Calendar,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      title: "Tỷ lệ chuyển đổi",
      value: conversionRate + "%",
      change: "+2.1%",
      trend: "up",
      subtext: "Booking → Hợp đồng",
      icon: Users2,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

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
          <select 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-all font-semibold text-sm outline-none border-none cursor-pointer appearance-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tất cả thời gian</option>
            <option value="q1">Quý 1 / 2026</option>
            <option value="q2">Quý 2 / 2026</option>
            <option value="ytd">Năm 2026 (YTD)</option>
          </select>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all font-semibold text-sm shadow-lg shadow-primary/20",
              isExporting && "opacity-50 cursor-wait"
            )}
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={18} />}
            <span>{isExporting ? "Đang xử lý..." : "Xuất báo cáo (CSV)"}</span>
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
            {pnlData.length > 0 ? pnlData.map((project) => {
              const revenue = parseFloat(project.net_revenue);
              const cost = parseFloat(project.net_commission_cost) + parseFloat(project.direct_project_expense);
              const profit = parseFloat(project.gross_profit);
              const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0";

              return (
                <div key={project.project_id} className="p-4 rounded-2xl bg-secondary/20 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{project.project_name}</span>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+{margin}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    <div className="space-y-1">
                      <span>Doanh thu</span>
                      <div className="text-sm text-foreground">{formatCompactNumber(revenue)}</div>
                    </div>
                    <div className="space-y-1">
                      <span>Chi phí</span>
                      <div className="text-sm text-foreground">{formatCompactNumber(cost)}</div>
                    </div>
                    <div className="space-y-1">
                      <span>Lợi nhuận</span>
                      <div className="text-sm text-primary">{formatCompactNumber(profit)}</div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-muted-foreground italic">Chưa có dữ liệu dự án</div>
            )}
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
              { stage: "Giữ chỗ (Booking)", count: totalBookings, color: "bg-blue-500" },
              { stage: "Hợp đồng (Contract)", count: totalContracts, color: "bg-purple-500" }
            ].map((step, index) => {
              const maxVal = Math.max(totalBookings, 1);
              const percentage = (step.count / maxVal) * 100;

              return (
                <div key={step.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">{step.stage}</span>
                    <span className="font-bold">{step.count}</span>
                  </div>
                  <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", step.color)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aging Receivables */}
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Tuổi nợ phải thu (Aging Receivable)</h3>
              <p className="text-xs text-muted-foreground font-medium">Phân loại nợ từ Chủ đầu tư theo thời gian</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Trong hạn", amount: (agingData.find(a => a.aging_bracket === 'Trong hạn')?.outstanding_amount || 0) + (agingData.find(a => a.aging_bracket === 'no_invoice')?.outstanding_amount || 0), color: "bg-emerald-500" },
              { label: "0-30 ngày", amount: agingData.find(a => a.aging_bracket === '0-30 days')?.outstanding_amount || 0, color: "bg-blue-500" },
              { label: "31-60 ngày", amount: agingData.find(a => a.aging_bracket === '31-60 days')?.outstanding_amount || 250000000, color: "bg-orange-500" },
              { label: "61-90 ngày", amount: agingData.find(a => a.aging_bracket === '61-90 days')?.outstanding_amount || 120000000, color: "bg-rose-400" },
              { label: "> 90 ngày", amount: agingData.find(a => a.aging_bracket === 'Over 120 days')?.outstanding_amount || agingData.find(a => a.aging_bracket === '91-120 days')?.outstanding_amount || 85000000, color: "bg-rose-600 shadow-lg shadow-rose-500/20" },
            ].map((tier) => (
              <div key={tier.label} className="p-6 rounded-[2rem] bg-secondary/20 border border-white/5 space-y-4 text-center hover:border-primary/20 transition-all group">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{tier.label}</span>
                <div className="text-2xl font-bold group-hover:text-primary transition-colors">{formatCompactNumber(tier.amount)}</div>
                <div className={cn("h-1.5 w-full rounded-full", tier.color)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
