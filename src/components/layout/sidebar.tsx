"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  FileText,
  Calculator,
  History,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  Contact,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Dự án & Sản phẩm", href: "/projects", icon: Building2 },
  { name: "Khách hàng", href: "/customers", icon: Users },
  { name: "Nhân viên", href: "/employees", icon: Contact },
  { name: "Phiếu đặt chỗ", href: "/bookings", icon: Briefcase },
  { name: "Hợp đồng", href: "/contracts", icon: FileText },
  { name: "Kế toán & Hoa hồng", href: "/accounting", icon: Calculator },
  { name: "Lịch sử & Audit", href: "/audit", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <TrendingUp size={24} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight">ERP BĐS</span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Hệ thống Quản trị v3.0</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  "transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">Nguyễn Văn A</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase truncate">Admin</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
            <Settings size={18} />
          </button>
          <button className="flex items-center justify-center p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors text-destructive">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
