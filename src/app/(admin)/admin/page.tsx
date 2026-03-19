"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers, getSubscriptions } from "@/apis/adminApi";
import type { AppUser } from "@/apis/adminApi";
import { getCategories } from "@/apis/categoryApi";
import { getProducts } from "@/apis/productApi";
import { isAdminRole, isUserAccount, isShopownerOrStaff } from "@/features/admin/AdminTabsCommon";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { ADMIN_TABS, type AdminTabId } from "@/features/admin/AdminTabs.types";
import {
  UsersTab,
  TenantsTab,
  AdminsTab,
  SubscriptionsTab,
  CategoriesTab,
  ProductsTab,
} from "@/features/admin/tabs";

export default function AdminDashboard() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTabId>("users");
  const [stats, setStats] = useState({
    users: 0,
    tenants: 0,
    admins: 0,
    subscriptions: 0,
    categories: 0,
    products: 0,
  });

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    if (!token || role !== "ADMIN") {
      router.replace("/auth?mode=login");
      return;
    }
    setAdminEmail(localStorage.getItem("username") || "");

    Promise.allSettled([
      getUsers(),
      getSubscriptions(),
      getCategories(),
      getProducts(),
    ]).then((results) => {
      const usersList =
        results[0].status === "fulfilled" ? results[0].value : [];
      const userCount = Array.isArray(usersList)
        ? (usersList as AppUser[]).filter((u) => isUserAccount(u)).length
        : 0;
      const shopownerStaffCount = Array.isArray(usersList)
        ? (usersList as AppUser[]).filter((u) =>
            isShopownerOrStaff(u.role),
          ).length
        : 0;
      const adminCount = Array.isArray(usersList)
        ? (usersList as AppUser[]).filter((u) => isAdminRole(u.role)).length
        : 0;
      const categoriesList =
        results[2].status === "fulfilled" ? results[2].value : [];
      const productsList =
        results[3].status === "fulfilled" ? results[3].value : [];
      setStats({
        users: userCount,
        tenants: shopownerStaffCount,
        admins: adminCount,
        subscriptions:
          results[1].status === "fulfilled" ? (results[1].value as unknown[]).length : 0,
        categories: Array.isArray(categoriesList) ? categoriesList.length : 0,
        products: Array.isArray(productsList) ? productsList.length : 0,
      });
    });
  }, [router]);

  if (!mounted) return null;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    router.push("/auth?mode=login");
  };

  const STAT_CARDS = [
    {
      label: "Tổng User",
      value: stats.users,
      icon: "👤",
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-600",
      tab: "users" as AdminTabId,
    },
    {
      label: "Shopowner & Staff",
      value: stats.tenants,
      icon: "🏢",
      bg: "bg-indigo-50 border-indigo-200",
      text: "text-indigo-600",
      tab: "tenants" as AdminTabId,
    },
    {
      label: "Tổng Admin",
      value: stats.admins,
      icon: "👑",
      bg: "bg-purple-50 border-purple-200",
      text: "text-purple-600",
      tab: "admins" as AdminTabId,
    },
    {
      label: "Gói Subscription",
      value: stats.subscriptions,
      icon: "📦",
      bg: "bg-green-50 border-green-200",
      text: "text-green-600",
      tab: "subscriptions" as AdminTabId,
    },
    {
      label: "Danh mục",
      value: stats.categories,
      icon: "📂",
      bg: "bg-teal-50 border-teal-200",
      text: "text-teal-600",
      tab: "categories" as AdminTabId,
    },
    {
      label: "Sản phẩm",
      value: stats.products,
      icon: "🛒",
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-600",
      tab: "products" as AdminTabId,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar
        adminEmail={adminEmail}
        tabs={ADMIN_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Chào mừng, {adminEmail}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              👑 Admin
            </span>
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-700 text-xs font-medium">Online</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {STAT_CARDS.map((s) => (
              <button
                key={s.label}
                onClick={() => setActiveTab(s.tab)}
                className={`${s.bg} border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition text-left w-full`}
              >
                <div className="text-3xl">{s.icon}</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex border-b border-gray-100 px-6 pt-4 gap-1 overflow-x-auto">
              {ADMIN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "users" && <UsersTab />}
              {activeTab === "tenants" && <TenantsTab />}
              {activeTab === "admins" && <AdminsTab />}
              {activeTab === "subscriptions" && <SubscriptionsTab />}
              {activeTab === "categories" && <CategoriesTab />}
              {activeTab === "products" && <ProductsTab />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
