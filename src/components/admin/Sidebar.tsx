"use client";

import Link from "next/link";
import type { AdminTabId, AdminTabConfig } from "@/features/admin/AdminTabs.types";

interface AdminSidebarProps {
  adminEmail: string;
  tabs: AdminTabConfig[];
  activeTab: AdminTabId;
  onTabChange: (tab: AdminTabId) => void;
  onLogout: () => void;
}

export function AdminSidebar({
  adminEmail,
  tabs,
  activeTab,
  onTabChange,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed left-0 top-0 z-40">
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">MA</span>
          </div>
          <span className="font-bold text-gray-800 text-sm">ManageApp</span>
        </Link>
      </div>

      <div className="px-4 py-3 mx-3 mt-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold flex-shrink-0">
            {adminEmail.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white/75">Quản trị viên</p>
            <p className="text-sm font-bold truncate">{adminEmail}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
              activeTab === tab.id
                ? "bg-blue-50 text-blue-600 border border-blue-100"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
        <div className="pt-2 border-t border-gray-100 mt-2">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            <span>🌐</span> Trang chủ
          </Link>
        </div>
      </nav>

      <div className="px-3 pb-5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <span>🚪</span> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
