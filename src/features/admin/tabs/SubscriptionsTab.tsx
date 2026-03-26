"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  type SubscriptionPlan,
  type UpdateSubscriptionDto,
} from "@/apis/adminApi";
import {
  Badge,
  LoadingRow,
  EmptyRow,
  ErrorRow,
} from "@/features/admin/AdminTabsCommon";

export function SubscriptionsTab() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    packageCode: "",
    description: "",
    price: "",
    billingCycle: "MONTHLY",
  });
  const [editTarget, setEditTarget] = useState<SubscriptionPlan | null>(null);
  const [editForm, setEditForm] = useState<{
    packageCode: string;
    description: string;
    price: string;
    billingCycle: string;
    isActive: boolean;
  }>({
    packageCode: "",
    description: "",
    price: "",
    billingCycle: "MONTHLY",
    isActive: true,
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPlans(await getSubscriptions());
    } catch {
      setError("Không thể tải danh sách subscription");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const created = await createSubscription({
        packageCode: form.packageCode.toUpperCase(),
        description: form.description || undefined,
        price: Number(form.price),
        billingCycle: form.billingCycle,
      });
      setPlans((prev) => [...prev, created]);
      setShowForm(false);
      setForm({
        packageCode: "",
        description: "",
        price: "",
        billingCycle: "MONTHLY",
      });
    } catch (e: unknown) {
      setFormError((e as { message?: string })?.message || "Tạo gói thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const CYCLE_LABEL: Record<string, string> = {
    MONTHLY: "Hàng tháng",
    YEARLY: "Hàng năm",
    ONCE: "Một lần",
  };

  const openEdit = (p: SubscriptionPlan) => {
    setEditTarget(p);
    setEditForm({
      packageCode: p.package_code ?? "",
      description: p.description ?? "",
      price: String(p.price ?? 0),
      billingCycle: p.billing_cycle ?? "MONTHLY",
      isActive: p.is_active ?? true,
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
      const payload: UpdateSubscriptionDto = {
        packageCode: editForm.packageCode.toUpperCase(),
        description: editForm.description || undefined,
        price: Number(editForm.price),
        billingCycle: editForm.billingCycle,
        isActive: editForm.isActive,
      };
      const updated = await updateSubscription(editTarget.subscription_id, payload);
      setPlans((prev) =>
        prev.map((p) =>
          p.subscription_id === editTarget.subscription_id ? updated : p,
        ),
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
          <h2 className="text-lg font-bold text-gray-900">
            Danh sách gói Subscription
          </h2>
          <p className="text-sm text-gray-500">{plans.length} gói dịch vụ</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition"
        >
          <span>+</span> Thêm gói
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 bg-green-50 border border-green-100 rounded-2xl space-y-3"
        >
          <h3 className="font-semibold text-green-800 mb-1">
            Tạo gói subscription mới
          </h3>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="text"
              placeholder="Mã gói (VD: BASIC, PRO) *"
              value={form.packageCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, packageCode: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 uppercase"
            />
            <input
              required
              type="number"
              placeholder="Giá (VNĐ) *"
              value={form.price}
              min={0}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <input
              type="text"
              placeholder="Mô tả"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <select
              value={form.billingCycle}
              onChange={(e) =>
                setForm((f) => ({ ...f, billingCycle: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
            >
              <option value="MONTHLY">Hàng tháng</option>
              <option value="YEARLY">Hàng năm</option>
              <option value="ONCE">Một lần</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : "Tạo gói"}
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
              <th className="px-4 py-3 text-left">Mã gói</th>
              <th className="px-4 py-3 text-left">Mô tả</th>
              <th className="px-4 py-3 text-left">Giá</th>
              <th className="px-4 py-3 text-left">Chu kỳ</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRow cols={7} />
            ) : error ? (
              <ErrorRow cols={7} message={error} onRetry={load} />
            ) : plans.length === 0 ? (
              <EmptyRow
                cols={7}
                message="Chưa có gói nào. Hãy tạo gói đầu tiên!"
              />
            ) : (
              plans.map((p) => (
                <tr
                  key={p.subscription_id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-gray-400 font-mono">
                    #{p.subscription_id}
                  </td>
                  <td className="px-4 py-3">
                    <Badge text={p.package_code} color="green" />
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {p.description || (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {p.price.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      text={CYCLE_LABEL[p.billing_cycle] ?? p.billing_cycle}
                      color="blue"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      text={p.is_active === false ? "Tạm ngưng" : "Hoạt động"}
                      color={p.is_active === false ? "gray" : "green"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-green-50 text-green-700 hover:bg-green-100 transition"
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
                Cập nhật gói #{editTarget.subscription_id}
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
                  type="text"
                  required
                  value={editForm.packageCode}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, packageCode: e.target.value }))
                  }
                  placeholder="Mã gói"
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm uppercase"
                />
                <input
                  type="number"
                  required
                  min={0}
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="Giá"
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Mô tả"
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm sm:col-span-2"
                />
                <select
                  value={editForm.billingCycle}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, billingCycle: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                >
                  <option value="MONTHLY">Hàng tháng</option>
                  <option value="YEARLY">Hàng năm</option>
                  <option value="ONCE">Một lần</option>
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
                Hoạt động
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
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
