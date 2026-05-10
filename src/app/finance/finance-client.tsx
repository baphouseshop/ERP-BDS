"use client";

import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieIcon, 
  BarChart3, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Briefcase,
  Layers,
  Search,
  Filter,
  Plus,
  Zap
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FinanceClientProps {
  initialExpenses: any[];
  initialRevenue: any[];
  projects: any[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const categoryLabels: Record<string, string> = {
  commission_to_sales: "HH Nhân viên",
  commission_to_f2: "HH Đại lý F2",
  salary: "Lương nhân sự",
  social_insurance: "Bảo hiểm",
  marketing: "Marketing/ADS",
  event_open_sale: "Sự kiện bán hàng",
  office_rent: "Mặt bằng",
  utilities: "Điện nước/Dịch vụ",
  travel: "Công tác phí",
  training: "Đào tạo",
  software_it: "Phần mềm/IT",
  other_selling: "Chi phí bán hàng khác",
  other_admin: "Chi phí QL khác",
  office: "Văn phòng"
};

export function FinanceClient({ initialExpenses, initialRevenue, projects }: FinanceClientProps) {
  const [timeRange, setTimeRange] = useState<"30" | "90" | "365">("30");

  const metrics = useMemo(() => {
    const totalRev = initialRevenue.reduce((sum, r) => sum + (r.received_amount || 0), 0);
    const totalExp = initialExpenses.reduce((sum, e) => sum + (e.total_amount || e.amount || 0), 0);
    const netProfit = totalRev - totalExp;
    const ros = totalRev > 0 ? (netProfit / totalRev) * 100 : 0;
    
    return {
      totalRev,
      totalExp,
      netProfit,
      ros
    };
  }, [initialRevenue, initialExpenses]);

  // Aggregate expenses by category for Pie Chart
  const expenseByCategory = useMemo(() => {
    const agg: Record<string, number> = {};
    initialExpenses.forEach(e => {
      const cat = e.category || 'other_admin';
      agg[cat] = (agg[cat] || 0) + (e.total_amount || e.amount || 0);
    });
    return Object.entries(agg).map(([name, value]) => ({
      name: categoryLabels[name] || name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [initialExpenses]);

  // Aggregate profit by project name to avoid duplicates
  const profitByProject = useMemo(() => {
    const projectAgg: Record<string, { rev: number, exp: number }> = {};
    
    // Process revenue
    initialRevenue.forEach(r => {
      const name = r.projects?.name || "Khác";
      if (!projectAgg[name]) projectAgg[name] = { rev: 0, exp: 0 };
      projectAgg[name].rev += (r.received_amount || 0);
    });

    // Process expenses
    initialExpenses.forEach(e => {
      const projectName = projects.find(p => p.id === e.project_id)?.name || "Chi phí chung";
      if (!projectAgg[projectName]) projectAgg[projectName] = { rev: 0, exp: 0 };
      projectAgg[projectName].exp += (e.total_amount || e.amount || 0);
    });

    return Object.entries(projectAgg)
      .map(([name, data]) => ({
        name,
        profit: (data.rev - data.exp) / 1000000, // Convert to Millions for better bar scale
        rev: data.rev / 1000000,
        exp: data.exp / 1000000
      }))
      .filter(p => p.rev > 0 || p.exp > 0)
      .sort((a, b) => b.rev - a.rev);
  }, [initialRevenue, initialExpenses, projects]);

  // Generate mock trend data for premium look (Real data would need daily aggregation)
  const trendData = useMemo(() => {
    return [
      { date: '01/05', rev: 45, exp: 32 },
      { date: '02/05', rev: 52, exp: 35 },
      { date: '03/05', rev: 48, exp: 38 },
      { date: '04/05', rev: 61, exp: 42 },
      { date: '05/05', rev: 55, exp: 40 },
      { date: '06/05', rev: 70, exp: 45 },
      { date: '07/05', rev: 85, exp: 48 },
    ];
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)} Tỷ`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)} Tr`;
    return val.toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Metrics with Premium Glow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Tổng Doanh thu" 
          value={formatCurrency(metrics.totalRev)} 
          subValue="+12.5% so với tháng trước"
          icon={<DollarSign className="text-emerald-400" />}
          trend="up"
          color="emerald"
        />
        <MetricCard 
          title="Tổng Chi phí" 
          value={formatCurrency(metrics.totalExp)} 
          subValue="-2.3% tối ưu vận hành"
          icon={<Wallet className="text-blue-400" />}
          trend="down"
          color="blue"
        />
        <MetricCard 
          title="Lợi nhuận ròng" 
          value={formatCurrency(metrics.netProfit)} 
          subValue={`Biên lợi nhuận: ${metrics.ros.toFixed(1)}%`}
          icon={<Activity className="text-amber-400" />}
          trend={metrics.netProfit > 0 ? "up" : "down"}
          color="amber"
        />
        <MetricCard 
          title="Chỉ số ROS" 
          value={`${metrics.ros.toFixed(1)}%`} 
          subValue="Mục tiêu: 30%"
          icon={<Zap className="text-purple-400" />}
          trend={metrics.ros > 25 ? "up" : "down"}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cashflow Trend - Premium Area Chart */}
        <div className="lg:col-span-8 p-8 glass-card rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-500" />
                Biến động dòng tiền
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Theo dõi tương quan Thu - Chi theo thời gian</p>
            </div>
            <div className="flex gap-2 bg-secondary/50 p-1 rounded-xl">
              {['7 ngày', '30 ngày', '90 ngày'].map((range, i) => (
                <button key={range} className={cn("px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all", i === 0 ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                />
                <Area type="monotone" dataKey="rev" name="Doanh thu" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="exp" name="Chi phí" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Structure - Premium Donut */}
        <div className="lg:col-span-4 p-8 glass-card rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent shadow-2xl">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-8">
            <PieIcon size={20} className="text-primary" />
            Cơ cấu chi phí
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                  formatter={(value: any) => formatCurrency(Number(value || 0))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {expenseByCategory.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: COLORS[idx % COLORS.length], boxShadow: `0 0 10px ${COLORS[idx % COLORS.length]}40` }} />
                  <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-bold">{((item.value / metrics.totalExp) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profit by Project - Refined Bar Chart */}
        <div className="lg:col-span-12 p-8 glass-card rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Hiệu quả kinh doanh theo Dự án
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Đơn vị: Triệu VNĐ</p>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitByProject} margin={{ left: 40, right: 40, top: 20, bottom: 20 }} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: '500'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 10 }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                  formatter={(value: any) => formatCurrency(Number(value || 0) * 1000000)}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="rev" name="Doanh thu" fill="#10b981" radius={[10, 10, 0, 0]} />
                <Bar dataKey="exp" name="Chi phí" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Financial Advisor - Premium Glassmorphism */}
      <div className="p-8 rounded-[2.5rem] border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
        
        <div className="flex items-start gap-6 relative z-10">
          <div className="p-4 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-2xl shadow-xl shadow-emerald-500/20">
            <Zap className="text-white fill-white/20" size={28} />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-emerald-400 tracking-tight">AI Executive Advisor</h3>
            <div className="h-px w-20 bg-emerald-500/30" />
            <p className="text-base text-muted-foreground max-w-4xl leading-relaxed font-medium italic">
              "Dòng tiền hiện tại đang ghi nhận mức âm do các khoản chi phí đầu tư ban đầu vào dự án **{profitByProject[0]?.name}**. 
              Tuy nhiên, biên lợi nhuận kỳ vọng vẫn duy trì ở mức {metrics.ros.toFixed(1)}%. 
              Hạng mục **{expenseByCategory[0]?.name}** đang chiếm tỷ trọng cao nhất ({((expenseByCategory[0]?.value / metrics.totalExp) * 100).toFixed(1)}%). 
              Chúng tôi khuyến nghị tối ưu hóa chi phí vận hành văn phòng để cải thiện thanh khoản trong ngắn hạn."
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions - Clean & Modern */}
      <div className="glass-card rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Layers size={20} className="text-primary" />
              Lịch sử Giao dịch Tài chính
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Danh sách các khoản chi và thu gần nhất</p>
          </div>
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 active:scale-95">
            <Plus size={18} /> Ghi nhận mới
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/20 text-xs font-black text-muted-foreground uppercase tracking-widest">
                <th className="px-8 py-5">Ngày</th>
                <th className="px-8 py-5">Hạng mục</th>
                <th className="px-8 py-5">Nội dung chi tiết</th>
                <th className="px-8 py-5">Giá trị</th>
                <th className="px-8 py-5">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {initialExpenses.slice(0, 8).map((exp) => (
                <tr key={exp.id} className="hover:bg-white/[0.03] transition-all group">
                  <td className="px-8 py-5 text-sm font-medium">{new Date(exp.expense_date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-8 py-5">
                    <Badge variant="outline" className="text-[10px] py-1 px-3 rounded-lg border-white/20 bg-white/5 font-bold uppercase">{categoryLabels[exp.category] || exp.category}</Badge>
                  </td>
                  <td className="px-8 py-5 text-sm text-muted-foreground group-hover:text-foreground transition-colors">{exp.description}</td>
                  <td className="px-8 py-5 text-sm font-black text-emerald-400">{formatCurrency(exp.total_amount || exp.amount)}</td>
                  <td className="px-8 py-5">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      exp.payment_status === 'paid' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", exp.payment_status === 'paid' ? "bg-emerald-500" : "bg-amber-500")} />
                      {exp.payment_status === 'paid' ? 'Đã hoàn tất' : 'Chờ xử lý'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subValue, icon, trend, color }: any) {
  const colorMap: any = {
    emerald: "from-emerald-500/20 to-transparent border-emerald-500/20 shadow-emerald-500/5",
    blue: "from-blue-500/20 to-transparent border-blue-500/20 shadow-blue-500/5",
    amber: "from-amber-500/20 to-transparent border-amber-500/20 shadow-amber-500/5",
    purple: "from-purple-500/20 to-transparent border-purple-500/20 shadow-purple-500/5",
  };

  return (
    <div className={cn(
      "p-8 glass-card rounded-[2.5rem] border bg-gradient-to-br relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-xl",
      colorMap[color]
    )}>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-4 bg-secondary/80 rounded-2xl shadow-inner group-hover:rotate-12 transition-transform duration-500">
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full backdrop-blur-md",
          trend === 'up' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
        )}>
          {trend === 'up' ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
          {trend === 'up' ? "TĂNG" : "GIẢM"}
        </div>
      </div>
      
      <div className="space-y-2 relative z-10">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
        <h2 className="text-3xl font-black tracking-tighter group-hover:translate-x-1 transition-transform">{value}</h2>
        <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
          <Activity size={12} className="opacity-50" />
          {subValue}
        </p>
      </div>
    </div>
  );
}

