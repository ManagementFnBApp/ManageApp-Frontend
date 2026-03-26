"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoredRoleNormalized } from "@/apis/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { ADMIN_TABS, type AdminTabId } from "@/features/admin/AdminTabs.types";
import { ChevronDown, User, Home, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [adminEmail, setAdminEmail] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const activeTab = (searchParams.get("tab") as AdminTabId) || "users";

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = getStoredRoleNormalized();
    if (!token || role !== "ADMIN") {
      router.replace("/auth?mode=login");
      return;
    }
    setAdminEmail(localStorage.getItem("username") || "");
    setAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    router.push("/auth?mode=login");
  };

  if (!authorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar
        adminEmail={adminEmail}
        tabs={ADMIN_TABS}
        activeTab={activeTab}
        onTabChange={(tab) => {
          router.push(`/admin?tab=${tab}`);
        }}
        onLogout={handleLogout}
      />

      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-base font-semibold text-slate-700">
            Hệ thống quản lý cửa hàng
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {adminEmail.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {adminEmail}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Quản trị viên
                  </p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => router.push("/admin/profile")}
              >
                <User size={15} />
                <span className="text-xs">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <Home size={14} />
                <span className="text-xs">Trang chủ</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}