"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateLoyaltyPoints,
  type Customer,
} from "@/apis/customerApi";
import { getStoredRoleNormalized } from "@/apis/auth";
import { getAll as getAllMerchandise } from "@/apis/merchandise";
import { createRedemption } from "@/apis/merchandise-redemption";
import { UserPlus, Pencil, Trash2, Gift, ArrowLeftRight, X, Package } from "lucide-react";

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "—";

export default function ManagerCustomersPage() {
  const router = useRouter();

  // Chỉ cho phép SHOPOWNER và STAFF truy cập trang này
  useEffect(() => {
    const currentRole = getStoredRoleNormalized();
    if (currentRole !== "SHOPOWNER" && currentRole !== "STAFF") {
      router.replace("/manager");
    }
  }, [router]);

  const [list, setList] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "points" | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [form, setForm] = useState({
    phone: "",
    full_name: "",
    loyalty_point: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // ── Merchandise Redemption state ──
  const [redeemCustomer, setRedeemCustomer] = useState<Customer | null>(null);
  const [merchandiseList, setMerchandiseList] = useState<{ id: string; merchandise_name: string; point_required: number; total_quantity: number; is_active: boolean }[]>([]);
  const [merchandiseLoading, setMerchandiseLoading] = useState(false);
  const [redeemMerchandiseId, setRedeemMerchandiseId] = useState<string>("");
  const [redeemQty, setRedeemQty] = useState(1);
  const [redeemSubmitting, setRedeemSubmitting] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState("");

  const isStaff = role === "STAFF";
  const isShopOwner = role === "SHOPOWNER";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomers();
      setList(data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRole(getStoredRoleNormalized());
    load();
  }, [load]);

  const shopId =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("shopId") || 0)
      : 0;

  // ── Open Redeem Modal ──
  const openRedeem = async (c: Customer) => {
    setRedeemCustomer(c);
    setRedeemMerchandiseId("");
    setRedeemQty(1);
    setRedeemError("");
    setRedeemSuccess("");
    setMerchandiseLoading(true);
    try {
      const items = await getAllMerchandise();
      const active = (Array.isArray(items) ? items : []).filter(
        (m: { is_active: boolean; total_quantity: number }) => m.is_active && m.total_quantity > 0,
      );
      setMerchandiseList(active);
    } catch {
      setMerchandiseList([]);
    } finally {
      setMerchandiseLoading(false);
    }
  };

  const closeRedeem = () => {
    setRedeemCustomer(null);
    setRedeemError("");
    setRedeemSuccess("");
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCustomer || !redeemMerchandiseId) {
      setRedeemError("Vui lòng chọn quà đổi điểm.");
      return;
    }
    if (redeemQty < 1) {
      setRedeemError("Số lượng phải >= 1.");
      return;
    }
    const chosen = merchandiseList.find((m) => String(m.id) === redeemMerchandiseId);
    if (chosen && chosen.point_required * redeemQty > redeemCustomer.loyalty_point) {
      setRedeemError(
        `Khách hàng chỉ có ${redeemCustomer.loyalty_point} điểm, cần ${chosen.point_required * redeemQty} điểm.`,
      );
      return;
    }
    setRedeemSubmitting(true);
    setRedeemError("");
    setRedeemSuccess("");
    try {
      await createRedemption({
        customer_id: redeemCustomer.id,
        merchandise_id: Number(redeemMerchandiseId),
        quantity: redeemQty,
      });
      setRedeemSuccess("Đổi quà thành công!");
      // Refresh customer list to update loyalty points
      await load();
      // Update the local redeemCustomer reference
      setTimeout(() => closeRedeem(), 1200);
    } catch (err: any) {
      setRedeemError(
        err?.message ?? err?.response?.data?.message ?? "Đổi quà thất bại.",
      );
    } finally {
      setRedeemSubmitting(false);
    }
  };

  const openAdd = () => {
    setForm({ phone: "", full_name: "", loyalty_point: 0 });
    setFormError("");
    setSelected(null);
    setModal("add");
  };

  const openEdit = (c: Customer) => {
    setSelected(c);
    setForm({
      phone: c.phone,
      full_name: c.full_name ?? "",
      loyalty_point: c.loyalty_point,
    });
    setFormError("");
    setModal("edit");
  };

  const openPoints = (c: Customer) => {
    setSelected(c);
    setForm({
      phone: c.phone,
      full_name: c.full_name ?? "",
      loyalty_point: c.loyalty_point,
    });
    setFormError("");
    setModal("points");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  const openDeleteModal = (c: Customer) => {
    setDeleteTarget(c);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      setFormError("Số điện thoại không được trống.");
      return;
    }
    if (!shopId) {
      setFormError(
        "Bạn chưa có shop. Vui lòng đăng nhập lại sau khi đăng ký gói.",
      );
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await createCustomer({
        shop_id: shopId,
        phone: form.phone.trim(),
        full_name: form.full_name.trim() || undefined,
        loyalty_point: form.loyalty_point || undefined,
      });
      closeModal();
      await load();
    } catch (e: any) {
      setFormError(
        e?.message ?? e?.response?.data?.message ?? "Tạo khách hàng thất bại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!form.phone.trim()) {
      setFormError("Số điện thoại không được trống.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await updateCustomer(selected.id, {
        phone: form.phone.trim(),
        full_name: form.full_name.trim() || undefined,
        loyalty_point: form.loyalty_point,
      });
      closeModal();
      await load();
    } catch (e: any) {
      setFormError(
        e?.message ?? e?.response?.data?.message ?? "Cập nhật thất bại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setFormError("");
    try {
      await updateLoyaltyPoints(selected.id, form.loyalty_point);
      closeModal();
      await load();
    } catch (e: any) {
      setFormError(
        e?.message ?? e?.response?.data?.message ?? "Cập nhật điểm thất bại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteCustomer(deleteTarget.id);
      closeDeleteModal();
      await load();
    } catch (e: any) {
      setDeleteError(
        e?.message ?? e?.response?.data?.message ?? "Xóa thất bại.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredList = normalizedSearch
    ? list.filter((c) => {
        const name = (c.full_name ?? "").toLowerCase();
        const phone = (c.phone ?? "").toLowerCase();
        return (
          name.includes(normalizedSearch) || phone.includes(normalizedSearch)
        );
      })
    : list;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Khách hàng</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Danh sách khách hàng của cửa hàng. Nhân viên có thể thêm/sửa và cập
            nhật điểm thưởng.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc SĐT..."
            className="w-72 max-w-[52vw] px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          />
          {isStaff && (
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
            >
              <UserPlus size={18} />
              Thêm khách hàng
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={load} className="underline">
            Thử lại
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Đang tải...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            {search.trim()
              ? "Không tìm thấy khách hàng phù hợp."
              : "Chưa có khách hàng nào."}
            {!search.trim() && isStaff && ' Bấm "Thêm khách hàng" để thêm.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Họ tên</th>
                  <th className="px-4 py-3 text-left">SĐT</th>
                  <th className="px-4 py-3 text-right">Điểm thưởng</th>
                  <th className="px-4 py-3 text-left">Ngày tạo</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      #{c.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {c.full_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-800">{c.phone}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      {c.loyalty_point}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {(isStaff || isShopOwner) && (
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition text-xs font-medium"
                            title="Cập nhật khách hàng"
                          >
                            <Pencil size={14} />
                            Cập nhật
                          </button>
                        )}
                        {(isStaff || isShopOwner) && (
                          <button
                            type="button"
                            onClick={() => openRedeem(c)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            title="Đổi quà"
                          >
                            <ArrowLeftRight size={16} />
                          </button>
                        )}
                        {isStaff && (
                          <>
                            <button
                              type="button"
                              onClick={() => openPoints(c)}
                              className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition"
                              title="Điểm thưởng"
                            >
                              <Gift size={16} />
                            </button>
                          </>
                        )}
                        {isShopOwner && (
                          <button
                            type="button"
                            onClick={() => openDeleteModal(c)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm */}
      {modal === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Thêm khách hàng
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="0912345678"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Họ tên
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Điểm thưởng
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.loyalty_point}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      loyalty_point: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? "Đang tạo..." : "Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {modal === "edit" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Sửa khách hàng
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Họ tên
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Điểm thưởng
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.loyalty_point}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      loyalty_point: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Điểm thưởng */}
      {modal === "points" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Cập nhật điểm thưởng — {selected.full_name || selected.phone}
            </h2>
            <form onSubmit={handleUpdatePoints} className="space-y-4">
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Điểm thưởng
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.loyalty_point}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      loyalty_point: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xóa */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Xác nhận xóa khách hàng
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Bạn có chắc muốn xóa khách hàng{" "}
              <span className="font-semibold text-slate-800">
                {deleteTarget.full_name || deleteTarget.phone}
              </span>
              ?
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm mb-4">
              <p>
                <span className="text-slate-500">ID:</span> #{deleteTarget.id}
              </p>
              <p>
                <span className="text-slate-500">Họ tên:</span>{" "}
                {deleteTarget.full_name || "—"}
              </p>
              <p>
                <span className="text-slate-500">SĐT:</span>{" "}
                {deleteTarget.phone}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {deleteLoading ? "Đang xóa..." : "Xóa khách"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đổi quà */}
      {redeemCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Package size={16} className="text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Đổi quà cho khách hàng
                </h3>
              </div>
              <button
                type="button"
                onClick={closeRedeem}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleRedeem} className="px-6 py-5 space-y-4">
              {/* Customer Info */}
              <div className="px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500">Khách hàng</p>
                <p className="text-sm font-semibold text-slate-800">
                  {redeemCustomer.full_name || redeemCustomer.phone}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Điểm hiện có: <span className="font-bold text-blue-600">{redeemCustomer.loyalty_point}</span>
                </p>
              </div>

              {redeemError && (
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {redeemError}
                </div>
              )}
              {redeemSuccess && (
                <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-medium">
                  {redeemSuccess}
                </div>
              )}

              {/* Select Merchandise */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Chọn quà đổi điểm <span className="text-red-400">*</span>
                </label>
                {merchandiseLoading ? (
                  <div className="flex items-center gap-2 py-3 text-slate-400 text-sm">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-400 rounded-full animate-spin" />
                    Đang tải danh sách quà...
                  </div>
                ) : merchandiseList.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">Không có quà khả dụng.</p>
                ) : (
                  <select
                    value={redeemMerchandiseId}
                    onChange={(e) => setRedeemMerchandiseId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition bg-white"
                  >
                    <option value="">-- Chọn quà --</option>
                    {merchandiseList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.merchandise_name} — {m.point_required} điểm (còn {m.total_quantity})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  min={1}
                  value={redeemQty}
                  onChange={(e) => setRedeemQty(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                />
              </div>

              {/* Cost Preview */}
              {redeemMerchandiseId && (() => {
                const chosen = merchandiseList.find((m) => String(m.id) === redeemMerchandiseId);
                if (!chosen) return null;
                const totalCost = chosen.point_required * redeemQty;
                const remaining = redeemCustomer.loyalty_point - totalCost;
                return (
                  <div className="px-3 py-2.5 bg-blue-50 rounded-xl border border-blue-200 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tổng điểm cần:</span>
                      <span className="font-bold text-blue-700">{totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-slate-600">Điểm còn lại:</span>
                      <span className={`font-bold ${remaining >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {remaining.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeRedeem}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={redeemSubmitting || !redeemMerchandiseId || merchandiseLoading}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {redeemSubmitting ? "Đang xử lý..." : "Đổi quà"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
