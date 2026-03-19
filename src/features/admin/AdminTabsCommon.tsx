"use client";

import type { AppUser } from "@/apis/adminApi";

export function Badge({ text, color }: { text: string; color: string }) {
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    gray: "bg-gray-100 text-gray-600",
    yellow: "bg-yellow-100 text-yellow-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${map[color] ?? map.gray}`}
    >
      {text}
    </span>
  );
}

export function LoadingRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="py-12 text-center text-gray-400">
        <div className="flex justify-center items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      </td>
    </tr>
  );
}

export function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-12 text-center text-gray-400 text-sm">
        {message}
      </td>
    </tr>
  );
}

export function ErrorRow({
  cols,
  message,
  onRetry,
}: {
  cols: number;
  message: string;
  onRetry: () => void;
}) {
  return (
    <tr>
      <td colSpan={cols} className="py-8 text-center">
        <p className="text-red-500 text-sm mb-2">{message}</p>
        <button
          onClick={onRetry}
          className="text-sm text-blue-600 hover:underline"
        >
          Thử lại
        </button>
      </td>
    </tr>
  );
}

export const isAdminRole = (role: string | null | undefined) =>
  (role ?? "").toUpperCase() === "ADMIN";

export const isUserAccount = (u: AppUser) => u.role_id == null;

export const isShopownerOrStaff = (role: string | null | undefined) => {
  const r = (role ?? "").toUpperCase();
  return r === "SHOPOWNER" || r === "STAFF";
};
