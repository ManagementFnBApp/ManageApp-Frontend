"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, updateUser, type AppUser } from "@/apis/adminApi";
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
  const [editTarget, setEditTarget] = useState<AppUser | null>(null);
  const [editForm, setEditForm] = useState({
    email: "",
    username: "",
    full_name: "",
    phone: "",
    is_active: true,
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

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

  const openEdit = (u: AppUser) => {
    setEditTarget(u);
    setEditForm({
      email: u.email ?? "",
      username: u.username ?? "",
      full_name: u.profile?.full_name ?? "",
      phone: u.profile?.phone ?? "",
      is_active: u.is_active,
    });
    setEditError("");
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditError("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditSubmitting(true);
    setEditError("");
    try {
      const updated = await updateUser(editTarget.user_id, {
        email: editForm.email.trim(),
        username: editForm.username.trim(),
        full_name: editForm.full_name.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        is_active: editForm.is_active,
      });
      setUsers((prev) =>
        prev.map((u) => (u.user_id === editTarget.user_id ? updated : u)),
      );
      closeEdit();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string | string[] } } }).response
          ?.data?.message ?? (e as { message?: string }).message;
      setEditError(
        Array.isArray(msg) ? msg.join(", ") : String(msg || "Cập nhật thất bại"),
      );
    } finally {
      setEditSubmitting(false);
    }
  };

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
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRow cols={7} />
            ) : error ? (
              <ErrorRow cols={7} message={error} onRetry={load} />
            ) : filtered.length === 0 ? (
              <EmptyRow cols={7} message="Không có user nào" />
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
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      >
                        Sửa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                Cập nhật user #{editTarget.user_id}
              </h3>
              <button
                type="button"
                onClick={closeEdit}
                className="text-gray-400 hover:text-gray-700 transition p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {editError && <p className="text-red-500 text-sm">{editError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="Email"
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
                <input
                  type="text"
                  required
                  minLength={3}
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, username: e.target.value }))
                  }
                  placeholder="Username"
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  placeholder="Họ tên"
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="Số điện thoại"
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                />
                Hoạt động
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {editSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
