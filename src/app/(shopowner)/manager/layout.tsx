"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  UtensilsCrossed,
  ShoppingCart,
  BarChart2,
  Sun,
  Sunset,
  PackageOpen,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Moon,
  Sun as SunIcon,
  LogOut,
  Home,
  ChevronDown,
  User,
  Users,
  Clock,
  UserCheck,
} from "lucide-react";
import { handleLogout, getStoredRoleNormalized } from "@/apis/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Staff chỉ thấy: Tạo đơn hàng, Đơn hàng, Phiếu nhập hàng, Phiếu hủy hàng
const MAIN_ITEMS_STAFF = [
  { href: "/manager", label: "Tạo đơn hàng", icon: ShoppingCart },
  { href: "/manager/orders", label: "Đơn hàng", icon: ClipboardList },
];

// Shopowner thấy thêm: Quản lý Menu, Quản lý nhân viên, Quản lý ca, Quản lý khách hàng
const MAIN_ITEMS_SHOPOWNER_EXTRA = [
  { href: "/manager/menu", label: "Quản lý Menu", icon: UtensilsCrossed },
  { href: "/manager/staff", label: "Quản lý nhân viên", icon: Users },
  { href: "/manager/shifts", label: "Quản lý ca", icon: Clock },
  { href: "/manager/customers", label: "Quản lý khách hàng", icon: UserCheck },
];

const REPORT_ITEMS = [
  {
    id: "report-monthly",
    href: "/manager/report",
    label: "Báo cáo tháng",
    icon: BarChart2,
  },
  { id: "report-morning", label: "Báo cáo buổi sáng", icon: Sun },
  { id: "report-afternoon", label: "Báo cáo buổi chiều", icon: Sunset },
];

const OTHER_ITEMS = [
  { id: "import", label: "Phiếu nhập hàng", icon: PackageOpen },
  { id: "cancel", label: "Phiếu hủy hàng", icon: XCircle },
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
  const mainItems = isStaff
    ? MAIN_ITEMS_STAFF
    : [...MAIN_ITEMS_STAFF, ...MAIN_ITEMS_SHOPOWNER_EXTRA];

  const handleReportOrOther = (id: string) => {
    if (
      id === "report-morning" ||
      id === "report-afternoon" ||
      id === "import" ||
      id === "cancel"
    ) {
      // Tính năng đang phát triển - giữ hành vi cũ
      alert("Tính năng đang được phát triển.");
    }
  };

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
              <img src="/icon.svg" alt="Icon" width="24" height="24"></img>
              <span className="font-bold text-gray-800 text-xl mt-1">
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

        {/* MAIN */}
        <nav className="flex-1 overflow-y-auto py-3">
          {!collapsed && (
            <p className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Chính
            </p>
          )}
          <ul className="space-y-0.5 px-2">
            {mainItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive(href)
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon size={20} className="shrink-0 text-slate-500" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              </li>
            ))}
          </ul>

          {!collapsed && (
            <>
              {!isStaff && (
                <>
                  <p className="px-4 py-1.5 mt-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Báo cáo
                  </p>
                  <ul className="space-y-0.5 px-2">
                    {REPORT_ITEMS.map(({ id, href, label, icon: Icon }) => (
                      <li key={id}>
                        {href ? (
                          <Link
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                              isActive(href)
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                            }`}
                          >
                            <Icon
                              size={20}
                              className="shrink-0 text-slate-500"
                            />
                            <span>{label}</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReportOrOther(id)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition w-full text-left"
                          >
                            <Icon
                              size={20}
                              className="shrink-0 text-slate-500"
                            />
                            <span>{label}</span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="px-4 py-1.5 mt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Khác
              </p>
              <ul className="space-y-0.5 px-2">
                {OTHER_ITEMS.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => handleReportOrOther(id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition w-full text-left"
                    >
                      <Icon size={20} className="shrink-0 text-slate-500" />
                      <span>{label}</span>
                    </button>
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
              <DropdownMenuItem disabled className="gap-2 opacity-60">
                <User size={14} />
                <span className="text-xs">{managerName}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() =>
                  router.push(role === "SHOPOWNER" ? "/" : "/manager")
                }
              >
                <Home size={14} />
                {role === "SHOPOWNER" ? "Trang chủ" : "Về trang chính"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="gap-2 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut size={14} />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
