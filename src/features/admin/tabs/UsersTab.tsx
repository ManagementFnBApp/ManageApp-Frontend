"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, type AppUser } from "@/apis/adminApi";
import {
  Badge,
  LoadingRow,
  EmptyRow,
  ErrorRow,
  isUserAccount,
} from "@/features/admin/AdminTabsCommon";

export function UsersTab() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await getUsers());
    } catch {
      setError("Không thể tải danh sách user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onlyUsers = users.filter((u) => isUserAccount(u));
  const filtered = onlyUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (d: string | undefined) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Danh sách User</h2>
          <p className="text-sm text-gray-500">{onlyUsers.length} account </p>
        </div>
        <input
          type="text"
          placeholder="Tìm theo username, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-64"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRow cols={6} />
            ) : error ? (
              <ErrorRow cols={6} message={error} onRetry={load} />
            ) : filtered.length === 0 ? (
              <EmptyRow cols={6} message="Không có user nào" />
            ) : (
              filtered.map((u) => (
                <tr key={u.user_id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400 font-mono">
                    #{u.user_id}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.username}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.role ? (
                      <Badge
                        text={u.role}
                        color={u.role === "SHOPOWNER" ? "green" : "blue"}
                      />
                    ) : (
                      <Badge text="user" color="gray" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      text={u.is_active ? "Hoạt động" : "Vô hiệu"}
                      color={u.is_active ? "green" : "red"}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(u.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
