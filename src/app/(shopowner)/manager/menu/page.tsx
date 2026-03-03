"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, CreateProductPayload } from "@/apis/productApi";
import { MENU_CATEGORIES } from "@/data/mockMenu";
import { useMenuStore } from "@/data/useMenuStore";

const CATEGORIES = MENU_CATEGORIES.map((c) => ({ id: c.id, name: c.label }));

const EMPTY_FORM: CreateProductPayload = {
  categoryId: CATEGORIES[0].id,
  productName: "",
  sku: "",
  barcode: "",
  description: "",
  measureUnit: "ly",
  importPrice: 0, // giá nhập kho
  listPrice: 0, // giá bán lẻ
  isActive: true,
};

type ModalMode = "add" | "edit" | null;
type ToastType = "create" | "edit" | "soft-delete" | "hard-delete";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n) + " ₫";

export default function MenuManagePage() {
  const router = useRouter();
  const {
    products,
    loading,
    error: apiError,
    refresh,
    addProduct,
    editProduct,
    deactivateProduct,
    removeProduct,
    toggleActive,
  } = useMenuStore();

  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<CreateProductPayload>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Product | null>(
    null,
  );

  const [toast, setToast] = useState<{ type: ToastType } | null>(null);

  const showToast = (type: ToastType) => {
    setToast({ type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filtered list ──
  const filtered = products.filter((p) => {
    const matchSearch =
      !search.trim() ||
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && p.isActive) ||
      (filterActive === "inactive" && !p.isActive);
    return matchSearch && matchActive;
  });

  // ── Open modals ──
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditTarget(null);
    setModalMode("add");
  };

  const openEdit = (product: Product) => {
    setForm({
      categoryId: product.categoryId,
      productName: product.productName,
      sku: product.sku,
      barcode: product.barcode ?? "",
      description: product.description ?? "",
      measureUnit: product.measureUnit ?? "ly",
      importPrice: product.importPrice,
      listPrice: product.listPrice,
      isActive: product.isActive,
    });
    setFormError(null);
    setEditTarget(product);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditTarget(null);
  };

  // ── Submit form ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim()) {
      setFormError("Tên sản phẩm không được trống.");
      return;
    }
    if (!form.sku.trim()) {
      setFormError("SKU không được trống.");
      return;
    }
    if (form.listPrice <= 0) {
      setFormError("Giá bán phải lớn hơn 0.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (modalMode === "add") {
        await addProduct({
          categoryId: form.categoryId,
          productName: form.productName,
          sku: form.sku,
          barcode: form.barcode || null,
          description: form.description || null,
          measureUnit: form.measureUnit || null,
          importPrice: form.importPrice,
          listPrice: form.listPrice,
          isActive: form.isActive ?? true,
        });
        closeModal();
        showToast("create");
      } else if (editTarget) {
        await editProduct(editTarget.productId, {
          categoryId: form.categoryId,
          productName: form.productName,
          sku: form.sku,
          barcode: form.barcode || null,
          description: form.description || null,
          measureUnit: form.measureUnit || null,
          importPrice: form.importPrice,
          listPrice: form.listPrice,
          isActive: form.isActive,
        });
        closeModal();
        showToast("edit");
      }
    } catch (err: unknown) {
      setFormError(
        (err as { message?: string })?.message ?? "Có lỗi xảy ra, thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Soft delete ──
  const confirmSoftDelete = async () => {
    if (!deleteTarget) return;
    await deactivateProduct(deleteTarget.productId);
    setDeleteTarget(null);
    showToast("soft-delete");
  };

  // ── Hard delete ──
  const confirmHardDelete = async () => {
    if (!hardDeleteTarget) return;
    await removeProduct(hardDeleteTarget.productId);
    setHardDeleteTarget(null);
    showToast("hard-delete");
  };

  const getCategoryName = (id: number) =>
    CATEGORIES.find((c) => c.id === id)?.name ?? `Cat #${id}`;

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-5 right-5 z-[60] flex items-center gap-3 bg-emerald-500 rounded-2xl shadow-xl px-5 py-4 min-w-[300px] max-w-sm">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="flex-1 text-sm font-medium text-white">
            {toast.type === "create"
              ? "Bạn đã thêm sản phẩm mới thành công!"
              : toast.type === "hard-delete"
                ? "Bạn đã xóa thành công!"
                : "Bạn đã chỉnh sửa thành công!"}
          </p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-white/70 hover:text-white transition shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
        <button
          type="button"
          onClick={() => router.push("/manager")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition text-sm font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Dashboard
        </button>
        <h1 className="text-xl font-bold text-gray-800">Quản lý Menu</h1>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-lime-400 hover:bg-lime-500 text-white font-semibold rounded-xl shadow transition"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm sản phẩm
        </button>
      </header>

      {/* ── API error banner ── */}
      {apiError && (
        <div className="px-8 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
          <span className="text-amber-700 text-sm font-medium">{apiError}</span>
          <button
            type="button"
            onClick={refresh}
            className="ml-auto text-xs underline text-amber-600 hover:text-amber-800 transition"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="px-8 py-4 flex flex-wrap gap-3 items-center bg-white border-b border-gray-100">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, SKU..."
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none w-64"
        />
        <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm">
          {(["all", "active", "inactive"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilterActive(v)}
              className={`px-4 py-2 font-medium transition ${
                filterActive === v
                  ? "bg-lime-400 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {v === "all"
                ? "Tất cả"
                : v === "active"
                  ? "Đang bán"
                  : "Ngừng bán"}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-400 ml-auto">
          {filtered.length} sản phẩm
        </span>
      </div>

      {/* ── Table ── */}
      <main className="flex-1 px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-2 text-gray-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm">Không có sản phẩm nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Sản phẩm</th>
                  <th className="px-5 py-3 text-left">Danh mục</th>
                  <th className="px-5 py-3 text-left">SKU</th>
                  <th className="px-5 py-3 text-right">Giá vốn</th>
                  <th className="px-5 py-3 text-right">Giá bán</th>
                  <th className="px-5 py-3 text-center">Trạng thái</th>
                  <th className="px-5 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p, idx) => (
                  <tr key={p.productId} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800">
                        {p.productName}
                      </p>
                      {p.description && (
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">
                          {p.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {getCategoryName(p.categoryId)}
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-500">
                      {p.sku}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {formatPrice(p.importPrice)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">
                      {formatPrice(p.listPrice)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        type="button"
                        onClick={async () => {
                          await toggleActive(p.productId);
                          showToast("soft-delete");
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition ${
                          p.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        {p.isActive ? "Đang bán" : "Ngừng bán"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          title="Ngừng bán"
                          className="p-1.5 rounded-lg text-orange-400 hover:bg-orange-50 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHardDeleteTarget(p)}
                          title="Xóa vĩnh viễn"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ══ ADD / EDIT MODAL ══ */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {modalMode === "add"
                  ? "Thêm sản phẩm mới"
                  : `Chỉnh sửa: ${editTarget?.productName}`}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    value={form.productName}
                    onChange={(e) =>
                      setForm({ ...form, productName: e.target.value })
                    }
                    placeholder="VD: Cà phê sữa đá"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Danh mục *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({ ...form, categoryId: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Đơn vị
                  </label>
                  <input
                    type="text"
                    value={form.measureUnit}
                    onChange={(e) =>
                      setForm({ ...form, measureUnit: e.target.value })
                    }
                    placeholder="ly, hộp, kg..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="VD: CF-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) =>
                      setForm({ ...form, barcode: e.target.value })
                    }
                    placeholder="Tùy chọn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Giá nhập (VND) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.importPrice}
                    onChange={(e) =>
                      setForm({ ...form, importPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Giá bán (VND) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.listPrice}
                    onChange={(e) =>
                      setForm({ ...form, listPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  placeholder="Mô tả ngắn về sản phẩm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? "bg-lime-400" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
                <span className="text-sm text-gray-700">
                  {form.isActive ? "Đang bán" : "Ngừng bán"}
                </span>
              </div>

              {formError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-white font-semibold text-sm transition disabled:opacity-60"
                >
                  {submitting
                    ? "Đang lưu..."
                    : modalMode === "add"
                      ? "Thêm mới"
                      : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ SOFT DELETE CONFIRM ══ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Ngừng bán sản phẩm?</h3>
                <p className="text-sm text-gray-500">
                  Sản phẩm sẽ bị ẩn khỏi menu, không bị xóa.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mb-5">
              <span className="font-semibold">{deleteTarget.productName}</span>{" "}
              — SKU: {deleteTarget.sku}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmSoftDelete}
                className="flex-1 py-2.5 rounded-xl bg-orange-400 hover:bg-orange-500 text-white font-semibold text-sm transition"
              >
                Ngừng bán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ HARD DELETE CONFIRM ══ */}
      {hardDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Xóa vĩnh viễn?</h3>
                <p className="text-sm text-red-500">
                  Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 bg-red-50 rounded-lg px-3 py-2 mb-5">
              <span className="font-semibold">
                {hardDeleteTarget.productName}
              </span>{" "}
              — SKU: {hardDeleteTarget.sku}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setHardDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmHardDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
