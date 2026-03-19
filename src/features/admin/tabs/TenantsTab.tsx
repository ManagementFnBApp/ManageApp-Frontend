"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUsers,
  createManagedUser,
  type AppUser,
  type CreateManagedUserDto,
} from "@/apis/adminApi";
import {
  Badge,
  LoadingRow,
  EmptyRow,
  ErrorRow,
  isShopownerOrStaff,
} from "@/features/admin/AdminTabsCommon";

export function TenantsTab() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showManagedForm, setShowManagedForm] = useState(false);
  const [managedSubmitting, setManagedSubmitting] = useState(false);
  const [managedFormError, setManagedFormError] = useState("");
  const [managedSuccess, setManagedSuccess] = useState("");
  const [managedForm, setManagedForm] = useState<
    CreateManagedUserDto & { confirmPassword: string }
  >({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role_code: "STAFF",
  });
  const [isShopOwner, setIsShopOwner] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await getUsers());
    } catch {
      setError("Không thể tải danh sách shopowner/staff");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsShopOwner((role ?? "").toUpperCase() === "SHOPOWNER");
  }, []);

  const getManagedErrorMessage = (e: unknown): string => {
    const err = e as {
      message?: string;
      response?: { data?: { message?: string | string[] } };
    };
    const msg = err?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    const apiMsg = err?.response?.data?.message;
    if (Array.isArray(apiMsg)) return apiMsg.join(", ");
    if (typeof apiMsg === "string") return apiMsg;
    return "Đã xảy ra lỗi. Vui lòng thử lại.";
  };

  const handleCreateManaged = async (e: React.FormEvent) => {
    e.preventDefault();
    if (managedForm.password !== managedForm.confirmPassword) {
      setManagedFormError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setManagedSubmitting(true);
    setManagedFormError("");
    try {
      await createManagedUser({
        email: managedForm.email.trim(),
        username: managedForm.username.trim(),
        password: managedForm.password,
        role_code: managedForm.role_code,
      });
      setShowManagedForm(false);
      setManagedForm({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        role_code: "STAFF",
      });
      await load();
      setManagedSuccess(
        "Tài khoản đã tạo. Thông tin đăng nhập (username, mật khẩu) đã được gửi đến email của người dùng.",
      );
      setTimeout(() => setManagedSuccess(""), 5000);
    } catch (e: unknown) {
      setManagedFormError(getManagedErrorMessage(e));
    } finally {
      setManagedSubmitting(false);
    }
  };

  const shopownerAndStaff = users.filter((u) => isShopownerOrStaff(u.role));
  const filtered = shopownerAndStaff.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.profile?.full_name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (d: string | undefined) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  return (
    <div>
      {managedSuccess && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-800"
        >
          <span className="text-green-500 text-xl">✓</span>
          <p className="text-sm font-medium">{managedSuccess}</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Danh sách Shopowner & Staff
          </h2>
          <p className="text-sm text-gray-500">
            {shopownerAndStaff.length} account (Shopowner + Staff)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isShopOwner ? (
            <button
              type="button"
              onClick={() => {
                setShowManagedForm(true);
                setManagedFormError("");
                setManagedForm({
                  email: "",
                  username: "",
                  password: "",
                  confirmPassword: "",
                  role_code: "STAFF",
                });
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Thêm nhân viên / Shopowner
            </button>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Chỉ có SHOPOWNER mới có chức năng tạo tài khoản cho nhân viên của
              Cửa hàng.
            </p>
          )}
          <input
            type="text"
            placeholder="Tìm theo username, email, tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"
          />
        </div>
      </div>
      {isShopOwner && showManagedForm && (
        <div className="mb-5 p-5 rounded-xl border border-indigo-200 bg-indigo-50/50">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Tạo tài khoản (thông tin đăng nhập sẽ gửi qua email)
          </h3>
          {managedFormError && (
            <p className="text-sm text-red-600 mb-3">{managedFormError}</p>
          )}
          <form
            onSubmit={handleCreateManaged}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={managedForm.email}
                onChange={(e) =>
                  setManagedForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={managedForm.username}
                onChange={(e) =>
                  setManagedForm((f) => ({ ...f, username: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={managedForm.password}
                onChange={(e) =>
                  setManagedForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                required
                value={managedForm.confirmPassword}
                onChange={(e) =>
                  setManagedForm((f) => ({
                    ...f,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex items-end gap-2">
              <select
                value={managedForm.role_code}
                onChange={(e) =>
                  setManagedForm((f) => ({
                    ...f,
                    role_code: e.target.value as "SHOPOWNER" | "STAFF",
                  }))
                }
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="STAFF">STAFF</option>
                <option value="SHOPOWNER">SHOPOWNER</option>
              </select>
              <button
                type="submit"
                disabled={managedSubmitting}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {managedSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
              <button
                type="button"
                onClick={() => setShowManagedForm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Email</th>
              {/* <th className="px-4 py-3 text-left">Họ tên</th> */}
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Cửa hàng (shop_id)</th>
              <th className="px-4 py-3 text-left">
                Chủ shop (owner_manager_id)
              </th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRow cols={9} />
            ) : error ? (
              <ErrorRow cols={9} message={error} onRetry={load} />
            ) : filtered.length === 0 ? (
              <EmptyRow cols={9} message="Chưa có shopowner hoặc staff nào" />
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
                  <td className="px-4 py-3 text-gray-600">
                    {u.profile?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {u.role ? (
                      <Badge
                        text={u.role}
                        color={
                          u.role.toUpperCase() === "SHOPOWNER"
                            ? "green"
                            : "blue"
                        }
                      />
                    ) : (
                      <Badge text="—" color="gray" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.shop_id != null ? (
                      `#${u.shop_id}`
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.owner_manager_id != null ? (
                      `#${u.owner_manager_id}`
                    ) : (
                      <span className="text-gray-300">—</span>
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
