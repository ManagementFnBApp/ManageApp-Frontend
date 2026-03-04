"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, CreateProductPayload } from "@/apis/productApi";
import { useMenuStore } from "@/data/useMenuStore";
import {
  type Category,
  getCategories,
  createCategory,
} from "@/apis/categoryApi";

type ModalMode = "add" | "edit" | null;
type ToastType = "create" | "edit" | "soft-delete" | "hard-delete";

const EMPTY_FORM: CreateProductPayload = {
  categoryId: 0,
  productName: "",
  sku: "",
  barcode: "",
  description: "",
  measureUnit: "ly",
  importPrice: 0,
  listPrice: 0,
  isActive: true,
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n) + " ₫";

export default function MenuManagePage() {
  const router = useRouter();
  const {
    products,
    loading,
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryForm, setCategoryForm] = useState<{
    categoryName: string;
    isActive: boolean;
  }>({
    categoryName: "",
    isActive: true,
  });

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Product | null>(
    null,
  );

  const [toast, setToast] = useState<{ type: ToastType } | null>(null);

  useEffect(() => {
    setLoadingCategories(true);
    getCategories()
      .then((list) => {
        setCategories(list);
        setCategoryError(null);
      })
      .catch(() => {
        setCategoryError(
          "Không thể tải danh mục sản phẩm. Vui lòng kiểm tra backend /categories.",
        );
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  const activeCategories = categories.filter((c) => c.isActive);
  const categoryIds = activeCategories.map((c) => c.id);
  const hasCategories = categoryIds.length > 0;

  const showToast = (type: ToastType) => {
    setToast({ type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const openAdd = () => {
    const defaultCategoryId = categoryIds[0] ?? 0;
    setForm({ ...EMPTY_FORM, categoryId: defaultCategoryId });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasCategories) {
      setFormError(
        "Bạn cần tạo danh mục sản phẩm trước khi thêm sản phẩm mới.",
      );
      return;
    }

    if (!form.categoryId || form.categoryId <= 0) {
      setFormError(
        "Vui lòng chọn danh mục hợp lệ. Hãy tạo loại sản phẩm trước nếu chưa có.",
      );
      return;
    }
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
          barcode: form.barcode || undefined,
          description: form.description || undefined,
          measureUnit: form.measureUnit || undefined,
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
          barcode: form.barcode || undefined,
          description: form.description || undefined,
          measureUnit: form.measureUnit || undefined,
          importPrice: form.importPrice,
          listPrice: form.listPrice,
          isActive: form.isActive,
        });
        closeModal();
        showToast("edit");
      }
    } catch (err: unknown) {
      let errorMessage = "Có lỗi xảy ra, thử lại.";
      
      if (err && typeof err === 'object') {
        const error = err as any;
        // Kiểm xem error có response data từ backend
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmSoftDelete = async () => {
    if (!deleteTarget) return;
    await deactivateProduct(deleteTarget.productId);
    setDeleteTarget(null);
    showToast("soft-delete");
  };

  const confirmHardDelete = async () => {
    if (!hardDeleteTarget) return;
    await removeProduct(hardDeleteTarget.productId);
    setHardDeleteTarget(null);
    showToast("hard-delete");
  };

  const getCategoryName = (id: number) => {
    const found = categories.find((c) => c.id === id);
    return found ? found.categoryName : `Danh mục #${id}`;
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.categoryName.trim()) {
      setCategoryError("Tên loại sản phẩm không được trống.");
      return;
    }
    setCategorySubmitting(true);
    setCategoryError(null);
    try {
      const created = await createCategory({
        categoryName: categoryForm.categoryName.trim(),
        isActive: categoryForm.isActive,
      });
      setCategories((prev) => [created, ...prev]);
      setCategoryModalOpen(false);
    } catch {
      setCategoryError(
        "Không thể tạo loại sản phẩm. Vui lòng kiểm tra API /categories.",
      );
    } finally {
      setCategorySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      {/* Toast */}
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
                : toast.type === "soft-delete"
                  ? "Trạng thái bán đã được cập nhật!"
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

      {/* Header */}
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
        <div className="flex items-center gap-3">
          {!hasCategories && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium max-w-xs">
              <span>
                Bạn cần tạo <span className="font-semibold">loại sản phẩm</span>{" "}
                trước khi thêm sản phẩm.
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setCategoryForm({ categoryName: "", isActive: true });
              setCategoryError(null);
              setCategoryModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-lime-400 text-lime-600 bg-white hover:bg-lime-50 text-sm font-semibold transition"
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
            Thêm loại sản phẩm
          </button>
          <button
            type="button"
            onClick={openAdd}
            disabled={!hasCategories}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow font-semibold transition ${
              hasCategories
                ? "bg-lime-400 hover:bg-lime-500 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
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
        </div>
      </header>

      {/* Filters */}
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
        <span className="text-sm text-gray-400 ml-auto flex items-center gap-3">
          {loadingCategories && (
            <span className="text-xs text-gray-400">
              Đang tải danh mục sản phẩm...
            </span>
          )}
          <span>{filtered.length} sản phẩm</span>
        </span>
      </div>

      {/* Table */}
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
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.isActive ? "bg-green-500" : "bg-gray-400"
                          }`}
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

      {/* Soft delete confirm */}
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

      {/* Hard delete confirm */}
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

      {/* Add/Edit Product Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === "add" ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg
                  className="w-6 h-6"
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    value={form.productName}
                    onChange={(e) =>
                      setForm({ ...form, productName: e.target.value })
                    }
                    placeholder="Nhập tên sản phẩm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="Nhập mã SKU"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục *
                  </label>
                  <select
                    value={form.categoryId || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        categoryId: e.target.value
                          ? parseInt(e.target.value, 10)
                          : 0,
                      })
                    }
                    disabled={!hasCategories}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="" disabled>
                      {hasCategories
                        ? "Chọn danh mục sản phẩm"
                        : "Chưa có danh mục nào"}
                    </option>
                    {categoryIds.map((id) => (
                      <option key={id} value={id}>
                        {getCategoryName(id)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-400">
                    Mỗi sản phẩm phải thuộc một loại đã tồn tại trong hệ thống.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    value={form.measureUnit}
                    onChange={(e) =>
                      setForm({ ...form, measureUnit: e.target.value })
                    }
                    placeholder="Ví dụ: cái, ly, kg..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã vạch
                </label>
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) =>
                    setForm({ ...form, barcode: e.target.value })
                  }
                  placeholder="Nhập mã vạch"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Mô tả chi tiết sản phẩm"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá vốn *
                  </label>
                  <input
                    type="number"
                    value={form.importPrice}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        importPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá bán *
                  </label>
                  <input
                    type="number"
                    value={form.listPrice}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        listPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="w-4 h-4 accent-lime-400 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Đang bán
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-white font-semibold text-sm transition disabled:opacity-50"
                >
                  {submitting
                    ? "Đang xử lý..."
                    : modalMode === "add"
                      ? "Thêm sản phẩm"
                      : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Thêm loại sản phẩm
              </h2>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg
                  className="w-6 h-6"
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

            <form onSubmit={handleSubmitCategory} className="space-y-4">
              {categoryError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {categoryError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên loại sản phẩm *
                </label>
                <input
                  type="text"
                  value={categoryForm.categoryName}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      categoryName: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: Cà phê, Trà, Bánh ngọt..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="category-is-active"
                  checked={categoryForm.isActive}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-lime-400 rounded"
                />
                <label
                  htmlFor="category-is-active"
                  className="text-sm text-gray-700"
                >
                  Đang sử dụng
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  disabled={categorySubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={categorySubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-white font-semibold text-sm transition disabled:opacity-50"
                >
                  {categorySubmitting ? "Đang lưu..." : "Thêm loại sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}