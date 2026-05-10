"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  FileDown, 
  Filter, 
  MoreVertical, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Target,
  BadgeDollarSign,
  PieChart,
  Calendar,
  Building2,
  Tag,
  Loader2,
  CheckCircle2,
  Edit2,
  Trash2,
  PrinterIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  project_name: string;
  amount: number;
  status: "paid" | "pending";
}

interface MarketingClientProps {
  initialExpenses: any[];
  projects: any[];
  analysis: any[];
}

export function MarketingClient({ initialExpenses, projects, analysis }: MarketingClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: "MARKETING",
    description: "",
    amount: "",
    project_id: projects[0]?.id || "",
    payment_status: "paid"
  });

  const fmt = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num) + " đ";
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Bạn có chắc chắn muốn lưu khoản chi phí "${form.description}" với số tiền ${new Intl.NumberFormat("vi-VN").format(parseFloat(form.amount))} đ?`)) return;
    setIsLoading(true);

    const { error } = await supabase.from("expenses").insert([{
      expense_date: form.expense_date,
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      project_id: form.project_id,
      payment_status: form.payment_status
    }]);

    if (error) {
      alert(error.message);
    } else {
      setIsModalOpen(false);
      setForm({
        ...form,
        description: "",
        amount: ""
      });
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleDeleteExpense = async (id: string, description: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khoản chi: "${description}"? Hành động này không thể hoàn tác.`)) return;
    
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      router.refresh();
    }
    setActiveMenu(null);
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthAnalysis = analysis.find(a => parseInt(a.month) === currentMonth) || analysis[0];

  const filteredExpenses = initialExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.projects?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === "all" || expense.project_id === selectedProject;
    const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory;
    
    // Simple period filtering logic
    let matchesPeriod = true;
    if (selectedPeriod === "this-month") {
      const expenseDate = new Date(expense.expense_date);
      matchesPeriod = expenseDate.getMonth() + 1 === currentMonth && expenseDate.getFullYear() === new Date().getFullYear();
    }
    
    return matchesSearch && matchesProject && matchesCategory && matchesPeriod;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const stats = [
    {
      title: "Tổng chi phí lọc",
      value: fmt(totalFilteredAmount),
      change: "+12%",
      trend: "up",
      subtext: "Theo bộ lọc hiện tại",
      icon: BadgeDollarSign,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Chi phí Marketing",
      value: fmt(filteredExpenses.filter(e => e.category === 'MARKETING').reduce((sum, e) => sum + e.amount, 0)),
      change: "-5%",
      trend: "down",
      subtext: "quảng cáo + sự kiện",
      icon: Target,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Số lượng khoản chi",
      value: `${filteredExpenses.length} mục`,
      change: "-8%",
      trend: "down",
      subtext: "Trong kỳ báo cáo",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Dự án đang xem",
      value: selectedProject === 'all' ? "Tất cả" : projects.find(p => p.id === selectedProject)?.name || "N/A",
      change: "+0.6",
      trend: "up",
      subtext: "Dữ liệu lọc theo dự án",
      icon: PieChart,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  // Database Categories Mapping
  const categories = [
    { id: 'MARKETING', label: "Marketing & Quảng cáo", color: "bg-blue-500" },
    { id: 'EVENT_OPEN_SALE', label: "Sự kiện mở bán", color: "bg-purple-500" },
    { id: 'OFFICE_RENT', label: "Văn phòng & Nhà mẫu", color: "bg-orange-500" },
    { id: 'SALARY_BONUS', label: "Lương & Thưởng", color: "bg-emerald-500" },
    { id: 'OTHER', label: "Khác", color: "bg-slate-500" },
  ];

  const breakdown = categories.map(cat => {
    const amount = filteredExpenses
      .filter(e => e.category === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const percentage = totalFilteredAmount > 0 ? (amount / totalFilteredAmount) * 100 : 0;
    return { ...cat, amount, percentage };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing & Chi phí</h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Theo dõi ngân sách, ROAS và CPA theo dự án
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Tính năng 'Xuất báo cáo Marketing' đang được khởi tạo... Vui lòng kiểm tra lại sau.")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-all font-bold text-xs uppercase tracking-wider"
          >
            <FileDown size={18} />
            <span>Xuất Excel</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all font-bold text-xs uppercase tracking-wider shadow-[0_8px_30px_rgb(var(--primary-rgb),0.3)] border border-primary/20"
          >
            <Plus size={18} />
            <span>Nhập chi phí</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 glass-card rounded-[2rem] border border-white/5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Kỳ</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full bg-secondary border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="this-month">Tháng này</option>
              <option value="last-month">Tháng trước</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Dự án</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-secondary border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Loại</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-secondary border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
            >
              <option value="all">Tất cả loại</option>
              <option value="MARKETING">Marketing & Quảng cáo</option>
              <option value="EVENT_OPEN_SALE">Sự kiện mở bán</option>
              <option value="OFFICE_RENT">Văn phòng & Nhà mẫu</option>
              <option value="SALARY_BONUS">Lương & Thưởng</option>
              <option value="OTHER">Chi phí khác</option>
            </select>
          </div>
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Breakdown Charts */}
        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] p-8 border border-white/5 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Chi phí theo loại</h3>
              <p className="text-xs text-muted-foreground font-medium">Tỷ trọng ngân sách đã chi</p>
            </div>
            
            <div className="space-y-5">
              {breakdown.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">{item.label}</span>
                    <span className="font-bold">{fmt(item.amount)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Transaction List */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Danh sách chi phí</h3>
                <p className="text-xs text-muted-foreground font-medium">Chi tiết các khoản chi phát sinh</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="bg-secondary/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-medium w-full md:w-64 focus:ring-2 focus:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/20">
                    <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ngày</th>
                    <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Loại chi phí</th>
                    <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mô tả</th>
                    <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dự án</th>
                    <th className="text-right py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Số tiền</th>
                    <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trạng thái</th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-5 px-6 text-sm font-medium">{new Date(expense.expense_date).toLocaleDateString('vi-VN')}</td>
                      <td className="py-5 px-6">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          expense.category === "MARKETING" ? "bg-blue-500/10 text-blue-500" :
                          expense.category === "EVENT_OPEN_SALE" ? "bg-purple-500/10 text-purple-500" :
                          expense.category === "OFFICE_RENT" ? "bg-orange-500/10 text-orange-500" :
                          expense.category === "SALARY_BONUS" ? "bg-emerald-500/10 text-emerald-500" :
                          "bg-slate-500/10 text-slate-500"
                        )}>
                          {expense.category?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold max-w-[200px] truncate">{expense.description}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{expense.projects?.name}</p>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-sm font-medium text-muted-foreground">{expense.projects?.name}</td>
                      <td className="py-5 px-6 text-right font-bold text-base">{fmt(expense.amount)}</td>
                      <td className="py-5 px-6 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap inline-block",
                          expense.payment_status === "paid" 
                            ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" 
                            : "bg-orange-500/5 text-orange-500 border-orange-500/20"
                        )}>
                          {expense.payment_status === "paid" ? "Đã TT" : "Chờ TT"}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === expense.id ? null : expense.id);
                          }}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {activeMenu === expense.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveMenu(null)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                              <button 
                                onClick={() => {
                                  alert("Tính năng Sửa đang được phát triển.");
                                  setActiveMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-secondary flex items-center gap-2 transition-colors"
                              >
                                <Edit2 size={14} className="text-blue-500" />
                                <span>Sửa chi phí</span>
                              </button>
                              <button 
                                onClick={() => {
                                  alert("Tính năng In phiếu đang được phát triển.");
                                  setActiveMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-secondary flex items-center gap-2 transition-colors"
                              >
                                <PrinterIcon size={14} className="text-emerald-500" />
                                <span>In phiếu chi</span>
                              </button>
                              <div className="my-1 border-t border-border" />
                              <button 
                                onClick={() => handleDeleteExpense(expense.id, expense.description)}
                                className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-rose-500/10 text-rose-500 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 size={14} />
                                <span>Xóa khoản chi</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nhập chi phí phát sinh"
      >
        <form onSubmit={handleAddExpense} className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Ngày chi</label>
              <input 
                required
                type="date"
                className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                value={form.expense_date}
                onChange={e => setForm({...form, expense_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Loại chi phí</label>
              <select 
                className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              >
                <option value="MARKETING">Marketing & Quảng cáo</option>
                <option value="EVENT_OPEN_SALE">Sự kiện mở bán</option>
                <option value="OFFICE_RENT">Thuê nhà mẫu/VP</option>
                <option value="SALARY_BONUS">Lương & Thưởng</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Dự án áp dụng</label>
            <select 
              className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
              value={form.project_id}
              onChange={e => setForm({...form, project_id: e.target.value})}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Mô tả chi tiết</label>
            <input 
              required
              placeholder="VD: Chạy quảng cáo Facebook Vinhomes Grand Park tháng 5..."
              className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Số tiền (VND)</label>
              <input 
                required
                type="text"
                placeholder="0"
                className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                value={form.amount ? new Intl.NumberFormat("vi-VN").format(parseInt(form.amount.replace(/\./g, ""))) : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
                  setForm({...form, amount: raw});
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Trạng thái</label>
              <select 
                className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
                value={form.payment_status}
                onChange={e => setForm({...form, payment_status: e.target.value})}
              >
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chờ thanh toán</option>
              </select>
            </div>
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            Lưu chi phí
          </button>
        </form>
      </Modal>
    </div>
  );
}
