export type AdminTabId =
  | "users"
  | "tenants"
  | "admins"
  | "subscriptions"
  | "categories"
  | "products";

export interface AdminTabConfig {
  id: AdminTabId;
  label: string;
  icon: string;
  color: string;
}

export const ADMIN_TABS: AdminTabConfig[] = [
  { id: "users", label: "Quản lý User", icon: "👤", color: "blue" },
  { id: "tenants", label: "Quản lý Shopowner", icon: "🏢", color: "indigo" },
  { id: "admins", label: "Quản lý Admin", icon: "👑", color: "purple" },
  { id: "subscriptions", label: "Quản lý Subscription", icon: "📦", color: "green" },
  { id: "categories", label: "Quản lý danh mục", icon: "📂", color: "teal" },
  { id: "products", label: "Quản lý sản phẩm", icon: "🛒", color: "amber" },
];
