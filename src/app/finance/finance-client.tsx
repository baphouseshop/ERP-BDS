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

  // Aggregate profit by project
  const profitByProject = useMemo(() => {
    const projectAgg: Record<string, { rev: number, exp: number, name: string }> = {};
    
    projects.forEach(p => {
      projectAgg[p.id] = { rev: 0, exp: 0, name: p.name };
    });

    initialRevenue.forEach(r => {
      if (r.project_id && projectAgg[r.project_id]) {
        projectAgg[r.project_id].rev += (r.received_amount || 0);
      }
    });

    initialExpenses.forEach(e => {
      if (e.project_id && projectAgg[e.project_id]) {
        projectAgg[e.project_id].exp += (e.total_amount || e.amount || 0);
      }
    });

    return Object.values(projectAgg)
      .map(p => ({
        name: p.name,
        profit: (p.rev - p.exp) / 1000000000, // Convert to Billions
        rev: p.rev / 1000000000,
        exp: p.exp / 1000000000
      }))
      .filter(p => p.rev > 0 || p.exp > 0)
      .sort((a, b) => b.profit - a.profit);
  }, [initialRevenue, initialExpenses, projects]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)} Tỷ`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)} Tr`;
    return val.toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Tổng Doanh thu" 
          value={formatCurrency(metrics.totalRev)} 
          subValue="+12.5% so với tháng trước"
          icon={<DollarSign className="text-emerald-500" />}
          trend="up"
        />
        <MetricCard 
          title="Tổng Chi phí" 
          value={formatCurrency(metrics.totalExp)} 
          subValue="-2.3% tối ưu vận hành"
          icon={<Wallet className="text-blue-500" />}
          trend="down"
        />
        <MetricCard 
          title="Lợi nhuận ròng" 
          value={formatCurrency(metrics.netProfit)} 
          subValue="Biên lợi nhuận: 24%"
          icon={<Activity className="text-amber-500" />}
          trend="up"
        />
        <MetricCard 
          title="Chỉ số ROS" 
          value={`${metrics.ros.toFixed(1)}%`} 
          subValue="Mục tiêu: 30%"
          icon={<Zap className="text-purple-500" />}
          trend={metrics.ros > 25 ? "up" : "down"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Distribution */}
        <div className="lg:col-span-1 p-6 glass-card rounded-3xl border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <PieIcon size={18} className="text-primary" />
              Cơ cấu chi phí
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => formatCurrency(Number(value || 0))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {expenseByCategory.slice(0, 5).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-bold">{((item.value / metrics.totalExp) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profit by Project */}
        <div className="lg:col-span-2 p-6 glass-card rounded-3xl border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              Lợi nhuận theo Dự án (Tỷ VNĐ)
            </h3>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitByProject} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis type="number" stroke="#888" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={10} width={100} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Legend />
                <Bar dataKey="rev" name="Doanh thu" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="exp" name="Chi phí" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Financial Advisor */}
      <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap size={120} className="text-emerald-500" />
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
            <Activity className="text-white" size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-emerald-500">Phân tích Tài chính từ AI Agent</h3>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Dòng tiền hiện tại đang **ổn định** với biên lợi nhuận ròng đạt {metrics.ros.toFixed(1)}%. 
              Chi phí lớn nhất tập trung vào **{expenseByCategory[0]?.name}**, chiếm {((expenseByCategory[0]?.value / metrics.totalExp) * 100).toFixed(1)}% ngân sách. 
              Dự án **{profitByProject[0]?.name}** đang mang lại hiệu quả sinh lời tốt nhất. 
              <span className="block mt-2 font-medium text-emerald-400">Đề xuất: Tiếp tục duy trì ngân sách Marketing cho {profitByProject[0]?.name} và tối ưu hóa chi phí vận hành văn phòng để nâng chỉ số ROS lên 30%.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="glass-card rounded-3xl border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            Nhật ký chi phí gần đây
          </h3>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus size={14} /> Ghi nhận chi phí
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-xs font-bold text-muted-foreground uppercase">
                <th className="px-6 py-4">Ngày</th>
                <th className="px-6 py-4">Hạng mục</th>
                <th className="px-6 py-4">Diễn giải</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {initialExpenses.slice(0, 5).map((exp) => (
                <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm">{new Date(exp.expense_date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-[10px] uppercase">{categoryLabels[exp.category] || exp.category}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{exp.description}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-500">{formatCurrency(exp.total_amount || exp.amount)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={exp.payment_status === 'paid' ? 'success' : 'warning'}>
                      {exp.payment_status === 'paid' ? 'Đã chi' : 'Chờ duyệt'}
                    </Badge>
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

function MetricCard({ title, value, subValue, icon, trend }: any) {
  return (
    <div className="p-6 glass-card rounded-3xl border border-border/50 relative overflow-hidden group hover:border-primary/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-secondary/50 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend === 'up' ? "Tăng" : "Giảm"}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
        <h2 className="text-2xl font-black">{value}</h2>
        <p className="text-[10px] text-muted-foreground font-medium">{subValue}</p>
      </div>
    </div>
  );
}
