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
  ArrowRightLeft,
  Users,
  Target,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
    current: Number(item.current_revenue) / 1000000, // To Millions
    previous: Number(item.prev_year_revenue) / 1000000,
    growth: item.yoy_growth_rate * 100
  }));

  const projectDistributionData = revenueOverview.map((item, index) => ({
    name: item.project_name,
    value: Number(item.total_sales_value),
    color: [`#10b981`, `#3b82f6`, `#f59e0b`, `#8b5cf6`, `#ec4899`][index % 5]
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-white">Hệ thống Quản trị ERP BĐS</h1>
          <p className="text-white/60 font-medium text-lg">Chào mừng quay trở lại. Dưới đây là tổng quan tình hình kinh doanh hôm nay.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-[1.5rem] border border-white/10 shadow-xl">
          <div className="relative group">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors" />
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="pl-9 pr-4 py-2 bg-transparent border-none text-xs font-bold text-white focus:ring-0 cursor-pointer appearance-none min-w-[140px]"
            >
              <option value="all" className="bg-[#111]">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-[#111]">{p.name}</option>
              ))}
            </select>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="relative group">
            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-9 pr-4 py-2 bg-transparent border-none text-xs font-bold text-white focus:ring-0 cursor-pointer appearance-none min-w-[120px]"
            >
              <option value="today" className="bg-[#111]">Hôm nay</option>
              <option value="this_month" className="bg-[#111]">Tháng này</option>
              <option value="this_quarter" className="bg-[#111]">Quý này</option>
              <option value="year" className="bg-[#111]">Năm nay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Kho hàng khả dụng", value: stats.availableUnits, icon: Building2, color: "blue", trend: "+2.5%", isUp: true },
          { label: "Tỷ lệ lấp đầy giỏ hàng", value: `${occupancyRate.toFixed(1)}%`, icon: Target, color: "emerald", trend: "+4.2%", isUp: true, sublabel: "(Cọc/Bán/Khóa)" },
          { label: "Doanh số hệ thống", value: `${(stats.totalSalesValue / 1000000000).toFixed(2)}B`, icon: Briefcase, color: "purple", trend: "+12%", isUp: true },
          { label: "Doanh thu thực nhận", value: `${(stats.totalReceivedRevenue / 1000000000).toFixed(2)}B`, icon: TrendingUp, color: "orange", trend: "+8.1%", isUp: true },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-[2rem] p-7 border border-white/10 relative overflow-hidden group hover:border-primary/50 transition-all duration-500 shadow-2xl">
            <div className={cn(
              "absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150 blur-2xl",
              stat.color === "blue" ? "bg-blue-400" :
              stat.color === "emerald" ? "bg-emerald-400" :
              stat.color === "purple" ? "bg-purple-400" :
              "bg-orange-400"
            )} />
            <div className="flex flex-col gap-5 relative z-10">
              <div className="flex justify-between items-center">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                  stat.color === "blue" ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white" :
                  stat.color === "emerald" ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white" :
                  stat.color === "purple" ? "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white" :
                  "bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white"
                )}>
                  <stat.icon size={28} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                  stat.isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                )}>
                  {stat.isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {stat.trend}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mb-1">
                  {stat.label} {stat.sublabel && <span className="lowercase text-white/30 font-medium">{stat.sublabel}</span>}
                </span>
                <span className="text-4xl font-bold tracking-tighter text-white drop-shadow-md">{stat.value}</span>
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
              <h2 className="text-2xl font-bold tracking-tight text-white">Xu hướng Doanh thu</h2>
              <p className="text-xs text-white/40 font-semibold uppercase tracking-widest italic">Phân tích tăng trưởng theo tháng (MoM)</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-white/60">Năm nay</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <span className="text-[10px] font-bold text-white/60">Năm trước</span>
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#ffffff40', fontSize: 10, fontWeight: 'bold'}}
                  dy={10}
                />
                <YAxis 
                  hide={true}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="current" 
                  stroke="var(--primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCurrent)" 
                  animationDuration={2000}
                />
                <Area 
                  type="monotone" 
                  dataKey="previous" 
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
        <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Tỷ trọng Dự án</h2>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest italic">Cơ cấu doanh thu theo giỏ hàng</p>
          </div>

          <div className="h-[200px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={500}
                  animationDuration={1500}
                >
                  {projectDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">100%</span>
              <span className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em]">Hệ thống</span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {projectDistributionData.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold text-white/70 truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-white">{(item.value / 1000000000).toFixed(1)}B</span>
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
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 text-white">
              <PieChartIcon className="text-primary" /> Hiệu suất từng dự án
            </h3>
            <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Xem tất cả</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revenueOverview.slice(0, 4).map((project) => {
              const projData = projects.find(p => p.id === project.project_id);
              const total = projData?.units?.length || 0;
              const sold = projData?.units?.filter((u: any) => u.status !== 'available').length || 0;
              const percent = total > 0 ? (sold / total) * 100 : 0;
              
              return (
                <div key={project.project_id} className="glass-card rounded-3xl p-6 border border-white/5 space-y-4 hover:border-primary/30 transition-all group relative overflow-hidden bg-white/[0.01]">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-white group-hover:text-primary transition-colors">{project.project_name}</span>
                      <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">{project.developer_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-primary text-lg">{percent.toFixed(0)}%</span>
                      <span className="text-[8px] font-medium text-white/30 uppercase italic">Lấp đầy</span>
                    </div>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-1000" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-bold text-white/30 uppercase">Giá trị thực thu</span>
                        <span className="text-sm font-black text-white">{(project.total_received_revenue / 1000000).toFixed(0)}Tr VND</span>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                        <span className="text-[8px] font-bold text-white/30 uppercase">Hợp đồng</span>
                        <span className="text-sm font-black text-white">{project.total_contracts}</span>
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
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-white px-2">
            <Clock className="text-primary" /> Dòng tiền & Biến động
          </h3>
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/[0.01] space-y-6">
            {recentExpenses.length > 0 ? recentExpenses.map((expense, i) => (
              <div key={expense.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300">
                    <ArrowRightLeft size={18} />
                  </div>
                  {i !== recentExpenses.length - 1 && <div className="w-px flex-1 bg-white/5 my-2" />}
                </div>
                <div className="flex flex-col gap-1 pb-4">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{new Date(expense.expense_date).toLocaleDateString('vi-VN')}</span>
                  <span className="text-sm font-bold text-white/80 line-clamp-1">{expense.description}</span>
                  <span className="text-[11px] font-black text-red-400 italic">- {(expense.total_amount).toLocaleString('vi-VN')} VND</span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-white/20 italic text-xs">
                Chưa có dữ liệu biến động mới.
              </div>
            )}
            
            <div className="pt-4 border-t border-white/5">
              <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <AlertCircle size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Trợ lý AI Phân tích</span>
                </div>
                <p className="text-[10px] text-white/50 font-medium leading-relaxed italic">
                  "Dòng tiền thu về trong tháng 5 dự kiến đạt 85% kế hoạch. Đề xuất đẩy mạnh thu hồi nợ dự án Grand Park đợt 4."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
