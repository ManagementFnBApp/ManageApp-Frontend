"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  UtensilsCrossed,
  ShoppingCart,
  BarChart2,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  ChevronDown,
  User,
  Users,
  Clock,
  UserCheck,
  CreditCard,
} from "lucide-react";
import { handleLogout, getStoredRoleNormalized } from "@/apis/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Bán hàng — cả staff và shopowner đều thấy
const SALE_ITEMS = [
  { href: "/manager", label: "Tạo đơn hàng", icon: ShoppingCart },
  { href: "/manager/orders", label: "Đơn hàng", icon: ClipboardList },
  { href: "/manager/inventory", label: "Kho hàng", icon: PackageOpen },
];

// Quản lý — chỉ shopowner
const MANAGE_ITEMS = [
  { href: "/manager/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/manager/staff", label: "Nhân viên", icon: Users },
  { href: "/manager/shifts", label: "Ca làm việc", icon: Clock },
  { href: "/manager/customers", label: "Khách hàng", icon: UserCheck },
];

// Báo cáo & Tài chính — chỉ shopowner
const FINANCE_ITEMS = [
  { href: "/manager/report", label: "Báo cáo tháng", icon: BarChart2 },
  { href: "/manager/subscription", label: "Gói dịch vụ", icon: CreditCard },
  { href: "/manager/payment-settings", label: "Cài đặt thanh toán", icon: CreditCard },
];

function getRoleDisplayLabel(role: string): string {
  const r = (role || "").toUpperCase();
  if (r === "SHOPOWNER") return "Chủ shop";
  if (r === "STAFF") return "Nhân viên";
  return r || "Quản lý";
}

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [managerName, setManagerName] = useState("Manager");
  const [role, setRole] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) setManagerName(name);
    setRole(getStoredRoleNormalized());
  }, []);

  const isStaff = role === "STAFF";

  const isActive = (href: string) => {
    if (href === "/manager") return pathname === "/manager";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* ── Sidebar ── */}
      <aside
        className={`flex flex-col bg-white border-r border-slate-200 transition-all duration-300 shrink-0 ${
          collapsed ? "w-18" : "w-60"
        }`}
        style={{ borderTopRightRadius: 12, borderBottomRightRadius: 12 }}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between gap-2 px-3 py-4 border-b border-slate-100">
          {!collapsed && (
            <Link href="/manager" className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
                  />
                </svg>
              </div>
              <span className="font-bold text-slate-800 truncate">
                LumioViet
              </span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition shrink-0"
            title={collapsed ? "Mở rộng" : "Thu gọn"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto py-3 flex flex-col gap-1">
          {/* ── Bán hàng ── */}
          {!collapsed && (
            <p className="px-4 pt-1 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Bán hàng
            </p>
          )}
          <ul className="space-y-0.5 px-2">
            {SALE_ITEMS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive(href)
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${isActive(href) ? "text-blue-500" : "text-slate-400"}`}
                  />
                  {!collapsed && <span>{label}</span>}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Quản lý (shopowner only) ── */}
          {!isStaff && (
            <>
              {!collapsed && (
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Quản lý
                </p>
              )}
              {collapsed && <div className="mx-3 my-2 border-t border-slate-100" />}
              <ul className="space-y-0.5 px-2">
                {MANAGE_ITEMS.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive(href)
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`shrink-0 ${isActive(href) ? "text-blue-500" : "text-slate-400"}`}
                      />
                      {!collapsed && <span>{label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* ── Báo cáo & Tài chính ── */}
              {!collapsed && (
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Báo cáo & Tài chính
                </p>
              )}
              {collapsed && <div className="mx-3 my-2 border-t border-slate-100" />}
              <ul className="space-y-0.5 px-2">
                {FINANCE_ITEMS.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive(href)
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`shrink-0 ${isActive(href) ? "text-blue-500" : "text-slate-400"}`}
                      />
                      {!collapsed && <span>{label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
      </aside>

      {/* ── Content area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="shrink-0 flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
          <h1 className="text-base font-semibold text-slate-700">
            Hệ thống quản lý cửa hàng
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {managerName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {managerName}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {getRoleDisplayLabel(role)}
                  </p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => router.push("/manager/profile")}
              >
                <User size={15} />
                <span className="text-xs">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isStaff && (
                <>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => router.push("/")}
                  >
                    <Home size={14} />
                    <span className="text-xs">Trang chủ</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                variant="destructive"
                className="gap-2 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut size={14} />
                <span className="text-xs">Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
