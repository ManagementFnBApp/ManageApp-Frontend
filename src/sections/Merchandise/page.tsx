"use client";

import { useState, useEffect, useCallback } from "react";
import { getAll, create, update, remove, type CreateMerchandiseRequest } from "@/apis/merchandise";
import {
  Badge,
  LoadingRow,
  EmptyRow,
  ErrorRow,
} from "@/features/admin/AdminTabsCommon";
import { Pencil, Trash2, Plus, X, Package } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────
interface Merchandise {
  id: string;
  merchandise_name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  point_required: number;
  total_quantity: number;
  is_active: boolean;
}

// ─── Modal Form ────────────────────────────────────────────────
function MerchandiseFormModal({
  item,
  onClose,
  onSaved,
}: {
  item: Merchandise | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!item;

  const [form, setForm] = useState<CreateMerchandiseRequest>({
    merchandise_name: item?.merchandise_name ?? "",
    description: item?.description ?? "",
    sku: item?.sku ?? "",
    barcode: item?.barcode ?? "",
    point_required: item?.point_required ?? 0,
    total_quantity: item?.total_quantity ?? 0,
    is_active: item?.is_active ?? true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === "" ? 0 : Number(value)
          : value,
    }));
  };

  const handleToggle = () => {
    setForm((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.merchandise_name.trim()) {
      setFormError("Tên quà không được để trống");
      return;
    }
    if (form.point_required < 0) {
      setFormError("Điểm yêu cầu phải >= 0");
      return;
    }
    if (form.total_quantity < 0) {
      setFormError("Số lượng phải >= 0");
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      if (isEdit && item) {
        await update(item.id, form);
      } else {
        await create(form);
      }
      onSaved();
    } catch (err: unknown) {
      setFormError(
        (err as { message?: string })?.message ||
          (isEdit ? "Cập nhật thất bại" : "Tạo thất bại"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Card */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl border border-gray-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package size={16} className="text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {isEdit ? "Cập nhật quà đổi điểm" : "Thêm quà đổi điểm"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {formError && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {formError}
            </div>
          )}

          {/* Merchandise Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Tên quà <span className="text-red-400">*</span>
            </label>
            <input
              name="merchandise_name"
              required
              type="text"
              placeholder="VD: Ly sứ thương hiệu, Túi canvas..."
              value={form.merchandise_name}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Mô tả chi tiết về quà đổi điểm..."
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition resize-none"
            />
          </div>

          {/* SKU + Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                SKU
              </label>
              <input
                name="sku"
                type="text"
                placeholder="VD: MER-001"
                value={form.sku}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Barcode
              </label>
              <input
                name="barcode"
                type="text"
                placeholder="VD: 8901234567890"
                value={form.barcode}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
          </div>

          {/* Points + Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Điểm yêu cầu <span className="text-red-400">*</span>
              </label>
              <input
                name="point_required"
                required
                type="number"
                min={0}
                value={form.point_required}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tổng số lượng <span className="text-red-400">*</span>
              </label>
              <input
                name="total_quantity"
                required
                type="number"
                min={0}
                value={form.total_quantity}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Trạng thái hoạt động</span>
            <button
              type="button"
              onClick={handleToggle}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.is_active ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.is_active ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting
                ? isEdit
                  ? "Đang cập nhật..."
                  : "Đang tạo..."
                : isEdit
                  ? "Cập nhật"
                  : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────
function DeleteConfirmModal({
  name,
  onConfirm,
  onCancel,
  deleting,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Xác nhận xóa</h3>
        <p className="text-sm text-gray-500 mb-5">
          Bạn có chắc muốn xóa <strong className="text-gray-700">{name}</strong>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {deleting ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function MerchandisePage() {
  const [items, setItems] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Merchandise | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Merchandise | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getAll();
      setItems(Array.isArray(list) ? list : []);
    } catch {
      setError("Không thể tải danh sách quà đổi điểm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item: Merchandise) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSaved = () => {
    closeModal();
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch {
      // keep modal open so user can retry
    } finally {
      setDeleting(false);
    }
  };

  const TABLE_COLS = 7;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={22} className="text-blue-500" />
            Quản lý quà đổi điểm
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý danh sách quà đổi điểm cho khách hàng. {items.length > 0 && `${items.length} sản phẩm.`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} />
          Thêm quà đổi điểm
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3.5 text-left font-semibold">Tên quà</th>
                <th className="px-4 py-3.5 text-left font-semibold">SKU</th>
                <th className="px-4 py-3.5 text-left font-semibold">Barcode</th>
                <th className="px-4 py-3.5 text-right font-semibold">Điểm</th>
                <th className="px-4 py-3.5 text-right font-semibold">Số lượng</th>
                <th className="px-4 py-3.5 text-center font-semibold">Trạng thái</th>
                <th className="px-4 py-3.5 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <LoadingRow cols={TABLE_COLS} />
              ) : error ? (
                <ErrorRow cols={TABLE_COLS} message={error} onRetry={load} />
              ) : items.length === 0 ? (
                <EmptyRow
                  cols={TABLE_COLS}
                  message="Chưa có quà đổi điểm nào. Bấm «Thêm quà đổi điểm» để bắt đầu."
                />
              ) : (
                items.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-semibold text-gray-900">{m.merchandise_name}</p>
                        {m.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">
                      {m.sku || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">
                      {m.barcode || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-blue-600">
                      {m.point_required.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-700">
                      {m.total_quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        text={m.is_active ? "Hoạt động" : "Tắt"}
                        color={m.is_active ? "green" : "gray"}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(m)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                          title="Xóa"
                        >
                          <Trash2 size={15} />
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <MerchandiseFormModal
          item={editingItem}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          name={deleteTarget.merchandise_name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
