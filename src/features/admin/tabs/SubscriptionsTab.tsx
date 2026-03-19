"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSubscriptions,
  createSubscription,
  type SubscriptionPlan,
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRow cols={5} />
            ) : error ? (
              <ErrorRow cols={5} message={error} onRetry={load} />
            ) : plans.length === 0 ? (
              <EmptyRow
                cols={5}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
