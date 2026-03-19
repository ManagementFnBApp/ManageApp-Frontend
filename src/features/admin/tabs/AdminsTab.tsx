"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  type AdminUser,
  type AppUser,
} from "@/apis/adminApi";
import {
  Badge,
  LoadingRow,
  EmptyRow,
  ErrorRow,
  isAdminRole,
} from "@/features/admin/AdminTabsCommon";

export function AdminsTab() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    fullName: "",
    phone: "",
  });
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const mapUserToAdmin = (u: AppUser): AdminUser => ({
    adminId: u.user_id,
    email: u.email ?? "",
    fullName: u.profile?.full_name ?? u.username,
    phone: u.profile?.phone ?? null,
    isActive: u.is_active,
    lastLogin:
      u.last_login != null
        ? typeof u.last_login === "string"
          ? u.last_login
          : new Date(u.last_login).toISOString()
        : null,
    createdAt: u.created_at,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const users = await getUsers();
      const onlyAdmins = users.filter((u) => isAdminRole(u.role));
      setAdmins(onlyAdmins.map(mapUserToAdmin));
    } catch {
      setError("Không thể tải danh sách admin");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getErrorMessage = (e: unknown): string => {
    const err = e as {
      message?: string;
      originalError?: {
        code?: string;
        message?: string;
        response?: { data?: { message?: string | string[] } };
      };
      response?: { data?: { message?: string | string[] } };
    };
    const msg = err?.message ?? err?.originalError?.message;
    if (
      msg === "Network Error" ||
      err?.originalError?.code === "ERR_NETWORK" ||
      (typeof msg === "string" &&
        (msg.includes("CORS") || msg.includes("blocked")))
    ) {
      return "Không thể kết nối tới server. Backend (localhost:2999) cần cấu hình CORS cho phép method PATCH.";
    }
    if (typeof msg === "string" && msg.trim()) return msg;
    const data = err?.response?.data ?? err?.originalError?.response?.data;
    const apiMsg = data?.message;
    if (Array.isArray(apiMsg)) return apiMsg.join(", ");
    if (typeof apiMsg === "string") return apiMsg;
    return "Đã xảy ra lỗi. Vui lòng thử lại.";
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const newUser = await createUser({
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        role_code: "ADMIN",
      });
      if (form.fullName.trim() || form.phone?.trim()) {
        try {
          await updateUser(newUser.user_id, {
            full_name: form.fullName.trim() || undefined,
            phone: form.phone?.trim() || undefined,
          });
        } catch {
          // ignore
        }
      }
      setShowForm(false);
      setForm({
        email: "",
        username: "",
        password: "",
        fullName: "",
        phone: "",
      });
      await load();
      setSuccessMessage("Đã thêm Admin thành công!");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (e: unknown) {
      setFormError(
        getErrorMessage(e) ||
          "Tạo admin thất bại. Kiểm tra kết nối hoặc thông tin đã nhập.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (id: number, email: string) => {
    if (
      !confirm(
        `Bỏ quyền Admin của "${email}"? Tài khoản vẫn tồn tại nhưng không còn là admin.`,
      )
    )
      return;
    setActioningId(id);
    setActionError(null);
    try {
      await updateUser(id, { role_id: null });
      setAdmins((prev) => prev.filter((a) => a.adminId !== id));
    } catch (e: unknown) {
      setActionError(getErrorMessage(e));
    } finally {
      setActioningId(null);
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    setActioningId(id);
    setActionError(null);
    try {
      const updated = await updateUser(id, { is_active: !current });
      setAdmins((prev) =>
        prev.map((a) =>
          a.adminId === id ? { ...a, isActive: updated.is_active } : a,
        ),
      );
    } catch (e: unknown) {
      setActionError(getErrorMessage(e));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="relative">
      {successMessage && (
        <div
          role="alert"
          className="fixed top-24 right-6 z-[100] animate-[slideInRight_0.4s_ease-out]"
        >
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg bg-green-500 text-white max-w-sm">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              ✓
            </span>
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}
      {actionError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800"
        >
          <span className="flex-shrink-0 text-red-500 text-xl">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium">Lỗi thao tác</p>
            <p className="text-sm mt-0.5">{actionError}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium transition"
          >
            Đóng
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Danh sách Admin</h2>
          <p className="text-sm text-gray-500">{admins.length} quản trị viên</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
        >
          <span>+</span> Thêm Admin
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 bg-purple-50 border border-purple-100 rounded-2xl space-y-3"
        >
          <h3 className="font-semibold text-purple-800 mb-1">
            Tạo tài khoản Admin mới
          </h3>
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
            >
              <span className="flex-shrink-0">⚠️</span>
              <p>{formError}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <input
              required
              type="text"
              placeholder="Username * (≥3 ký tự)"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              minLength={3}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <input
              required
              type="password"
              placeholder="Mật khẩu * (≥6 ký tự)"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              minLength={6}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <input
              type="text"
              placeholder="Họ tên"
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : "Tạo Admin"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Họ tên</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-center">Ngày Tạo</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRow cols={6} />
            ) : error ? (
              <ErrorRow cols={6} message={error} onRetry={load} />
            ) : admins.length === 0 ? (
              <EmptyRow cols={6} message="Chưa có admin nào" />
            ) : (
              admins.map((a) => (
                <tr key={a.adminId} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400 font-mono">
                    #{a.adminId}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {a.fullName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      text={a.isActive ? "Hoạt động" : "Vô hiệu"}
                      color={a.isActive ? "green" : "red"}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-center">
                    {new Date(a.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        disabled={actioningId === a.adminId}
                        onClick={() => handleToggle(a.adminId, a.isActive)}
                        className={`text-xs px-3 py-1 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          a.isActive
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {actioningId === a.adminId
                          ? "Đang xử lý..."
                          : a.isActive
                            ? "Vô hiệu"
                            : "Kích hoạt"}
                      </button>
                      <button
                        type="button"
                        disabled={actioningId === a.adminId}
                        onClick={() => handleRemoveAdmin(a.adminId, a.email)}
                        className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actioningId === a.adminId
                          ? "Đang xử lý..."
                          : "Bỏ quyền Admin"}
                      </button>
                    </div>
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
