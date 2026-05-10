"use client";

import { useState } from "react";

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
  ArrowRightLeft,
  Users,
  Target,
  ArrowUp,
  ArrowDown,
  Filter,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatVND, formatCompactNumber, formatBillion } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

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
  revenueGrowth: any[];
}

export function DashboardClient({ 
  stats, 
  recentContracts, 
  recentExpenses, 
  projects, 
  revenueOverview,
  revenueGrowth 
}: DashboardClientProps) {
  const occupancyRate = (stats.soldUnits / (stats.availableUnits + stats.soldUnits || 1)) * 100;
  const [selectedProject, setSelectedProject] = useState("all");
  const [timeRange, setTimeRange] = useState("this_month");

  // Prepare chart data
  const chartData = revenueGrowth.map(item => ({
    name: new Date(item.month).toLocaleDateString('vi-VN', { month: 'short' }),
    current: Number(item.current_revenue) / 1000000, // To Millions (Expected)
    received: Number(item.current_received || 0) / 1000000, // To Millions (Actual)
    previous: Number(item.prev_year_revenue) / 1000000,
    growth: item.yoy_growth_rate * 100
  }));

  const projectDistributionData = revenueOverview.map((item, index) => ({
    name: item.project_name,
    value: Number(item.total_sales_value),
    color: [`#10b981`, `#3b82f6`, `#f59e0b`, `#8b5cf6`, `#ec4899`][index % 5]
  }));

  const latestGrowth = revenueGrowth.length > 0 
    ? (revenueGrowth[revenueGrowth.length - 1].yoy_growth_rate * 100).toFixed(1) 
    : "0";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">Hệ thống Quản trị ERP</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-medium">
            Chào mừng quay trở lại. Dưới đây là tổng quan tình hình kinh doanh hôm nay.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-muted/50 p-1.5 rounded-2xl border border-border shadow-sm">
          <div className="relative group">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-transparent border-none text-xs font-semibold text-foreground/90 focus:ring-0 cursor-pointer appearance-none min-w-[150px]"
            >
              <option value="all" className="bg-card">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-card">{p.name}</option>
              ))}
            </select>
          </div>
          <div className="w-px h-5 bg-border/50" />
          <div className="relative group">
            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-transparent border-none text-xs font-semibold text-foreground/90 focus:ring-0 cursor-pointer appearance-none min-w-[130px]"
            >
              <option value="today" className="bg-card">Hôm nay</option>
              <option value="this_month" className="bg-card">Tháng này</option>
              <option value="this_quarter" className="bg-card">Quý này</option>
              <option value="year" className="bg-card">Năm nay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Kho hàng khả dụng", value: stats.availableUnits, icon: Building2, color: "blue", trend: "Ổn định", isUp: true },
          { label: "Tỷ lệ lấp đầy", value: `${occupancyRate.toFixed(1)}%`, icon: Target, color: "emerald", trend: "Realtime", isUp: true, sublabel: "(Giỏ hàng)" },
          { label: "Doanh số hệ thống", value: formatBillion(stats.totalSalesValue), icon: Briefcase, color: "purple", trend: `+${latestGrowth}%`, isUp: Number(latestGrowth) >= 0 },
          { label: "Doanh thu thực nhận", value: formatBillion(stats.totalReceivedRevenue), icon: TrendingUp, color: "orange", trend: "0%", isUp: true },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-[1.5rem] p-6 border border-border/50 relative overflow-hidden group hover:border-primary/40 transition-all duration-300 shadow-sm">
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex justify-between items-center">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  stat.color === "blue" ? "bg-blue-500/10 text-blue-400" :
                  stat.color === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
                  stat.color === "purple" ? "bg-purple-500/10 text-purple-400" :
                  "bg-orange-500/10 text-orange-400"
                )}>
                  <stat.icon size={24} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide",
                  stat.isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                )}>
                  {stat.isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {stat.trend}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {stat.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</span>
                  {stat.sublabel && <span className="text-[10px] font-medium text-muted-foreground/60">{stat.sublabel}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Xu hướng Doanh thu</h2>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest italic">Phân tích tăng trưởng so với cùng kỳ (YoY)</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-muted-foreground">Phí dự kiến</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-muted-foreground">Thực thu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-[10px] font-bold text-muted-foreground">Năm trước</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: '500'}}
                  dy={10}
                />
                <YAxis 
                  hide={true}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-2xl space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50 pb-1">
                            Tháng {label}
                          </p>
                          {payload.map((entry: any, index: number) => {
                            let labelStr = "";
                            if (entry.dataKey === 'current') labelStr = "Phí dự kiến";
                            else if (entry.dataKey === 'received') labelStr = "Thực thu";
                            else if (entry.dataKey === 'previous') labelStr = "Năm trước";
                            
                            return (
                              <div key={index} className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-medium text-muted-foreground">{labelStr}</span>
                                <span className="text-xs font-bold" style={{ color: entry.stroke }}>
                                  {entry.value.toFixed(1)}Tr
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="current" 
                  name="current"
                  stroke="var(--primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCurrent)" 
                  animationDuration={2000}
                />
                <Area 
                  type="monotone" 
                  dataKey="received" 
                  name="received"
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorReceived)" 
                  animationDuration={2000}
                />
                <Area 
                  type="monotone" 
                  dataKey="previous" 
                  name="previous"
                  stroke="#ffffff15" 
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Mix Chart */}
        <div className="glass-card rounded-[2rem] p-8 border border-border shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Tỷ trọng Dự án</h2>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Cơ cấu doanh thu hệ thống</p>
          </div>

          <div className="h-[180px] w-full relative flex items-center justify-center mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={500}
                  animationDuration={1500}
                >
                  {projectDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-2xl">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                            {payload[0].name}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {formatCompactNumber(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-foreground">Doanh số</span>
              <span className="text-[8px] font-semibold uppercase text-muted-foreground tracking-[0.1em]">Toàn hệ thống</span>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            {projectDistributionData.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-muted-foreground truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{formatBillion(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Performance Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2 text-foreground">
              <PieChartIcon className="text-primary" size={20} /> Hiệu suất từng dự án
            </h3>
            <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">Xem tất cả</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revenueOverview.slice(0, 4).map((project) => {
              const projData = projects.find(p => p.id === project.project_id);
              const total = projData?.units?.length || 0;
              const sold = projData?.units?.filter((u: any) => ['reserved', 'contracted', 'handed_over'].includes(u.status)).length || 0;
              const percent = total > 0 ? (sold / total) * 100 : 0;
              
              return (
                <div key={project.project_id} className="glass-card rounded-2xl p-6 border border-border/40 space-y-4 hover:border-primary/30 transition-all group relative overflow-hidden bg-white/[0.01]">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">{project.project_name}</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{project.developer_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-primary text-base">{percent.toFixed(0)}%</span>
                      <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-tight">Lấp đầy</span>
                    </div>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-1000" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-tight">Thực thu</span>
                        <span className="text-sm font-semibold text-foreground">{formatCompactNumber(project.total_received_revenue)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 text-right">
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-tight">Hợp đồng</span>
                        <span className="text-sm font-semibold text-foreground">{project.total_contracts}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2 text-foreground px-2">
            <Clock className="text-primary" size={20} /> Biến động dòng tiền
          </h3>
          <div className="glass-card rounded-[2rem] p-6 border border-border/40 bg-white/[0.01] space-y-5">
            {recentExpenses.length > 0 ? recentExpenses.map((expense, i) => (
              <div key={expense.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300">
                    <ArrowRightLeft size={16} />
                  </div>
                  {i !== recentExpenses.length - 1 && <div className="w-px flex-1 bg-border/40 my-2" />}
                </div>
                <div className="flex flex-col gap-0.5 pb-4">
                  <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                    {new Date(expense.expense_date).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="text-sm font-medium text-foreground/90 line-clamp-1">{expense.description}</span>
                  <span className="text-[11px] font-semibold text-red-400">
                    - {formatVND(expense.total_amount)}
                  </span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40 italic text-xs">
                Chưa có dữ liệu biến động mới.
              </div>
            )}
            
            <div className="pt-4 border-t border-border/50">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Phân tích dòng tiền</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                  "Dòng tiền dự kiến đạt 85% kế hoạch. Đề xuất đẩy mạnh thu hồi nợ dự án Grand Park đợt 4."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
