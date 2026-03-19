"use client";

import { useState, useEffect, useCallback } from "react";
import { getCategories } from "@/apis/categoryApi";
import {
  getProducts,
  createProduct,
  updateProduct,
  softDeleteProduct,
  hardDeleteProduct,
  getProductImageUrl,
  type Product,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/apis/productApi";
import {
  Badge,
  LoadingRow,
  EmptyRow,
  ErrorRow,
} from "@/features/admin/AdminTabsCommon";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n) + " ₫";

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    { id: number; categoryName: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<CreateProductPayload>({
    categoryId: 0,
    productName: "",
    barcode: "",
    description: "",
    measureUnit: "ly",
    importPrice: 0,
    listPrice: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<UpdateProductPayload>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [softDeleteTarget, setSoftDeleteTarget] = useState<Product | null>(null);
  const [softDeleting, setSoftDeleting] = useState(false);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Product | null>(null);
  const [hardDeleting, setHardDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productsList, categoriesList] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsList);
      setCategories(
        categoriesList.map((c) => ({ id: c.id, categoryName: c.categoryName })),
      );
    } catch {
      setError("Không thể tải danh sách sản phẩm hoặc danh mục");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFormError("Vui lòng chọn file ảnh (jpg, png, gif, webp)");
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      setImageFile(file);
      setFormError("");
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.productName.trim();
    if (!name) {
      setFormError("Tên sản phẩm không được trống");
      return;
    }
    if (!imageFile) {
      setFormError("Vui lòng chọn ảnh sản phẩm (upload từ máy)");
      return;
    }
    const categoryId = form.categoryId || categories[0]?.id;
    if (!categoryId || !categories.some((c) => c.id === categoryId)) {
      setFormError(
        "Vui lòng chọn danh mục. Cần tạo danh mục trước (tab Danh mục).",
      );
      return;
    }
    if (form.listPrice <= 0) {
      setFormError("Giá bán phải lớn hơn 0");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const payload: CreateProductPayload = {
        categoryId,
        productName: name,
        barcode: form.barcode?.trim() || undefined,
        description: form.description?.trim() || undefined,
        measureUnit: form.measureUnit?.trim() || undefined,
        importPrice: Number(form.importPrice) || 0,
        listPrice: Number(form.listPrice) || 0,
        isActive: form.isActive ?? true,
      };
      const created = await createProduct(payload, imageFile);
      setProducts((prev) => [created, ...prev]);
      setShowForm(false);
      setForm({
        categoryId: categories[0]?.id ?? 0,
        productName: "",
        barcode: "",
        description: "",
        measureUnit: "ly",
        importPrice: 0,
        listPrice: 0,
        isActive: true,
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (err: unknown) {
      const msg =
        (err as {
          response?: { data?: { message?: string | string[] } };
          message?: string;
        })?.response?.data?.message ??
        (err as { message?: string }).message;
      setFormError(
        Array.isArray(msg) ? msg.join(", ") : String(msg || "Tạo sản phẩm thất bại"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setForm({
      categoryId: categories[0]?.id ?? 0,
      productName: "",
      barcode: "",
      description: "",
      measureUnit: "ly",
      importPrice: 0,
      listPrice: 0,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setFormError("");
  };

  const openEdit = (p: Product) => {
    setEditTarget(p);
    setEditForm({
      categoryId: p.categoryId,
      productName: p.productName,
      barcode: p.barcode ?? undefined,
      description: p.description ?? undefined,
      measureUnit: p.measureUnit ?? undefined,
      importPrice: p.importPrice,
      listPrice: p.listPrice,
      isActive: p.isActive,
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
    const name = (editForm.productName ?? editTarget.productName).trim();
    if (!name) {
      setEditError("Tên sản phẩm không được trống");
      return;
    }
    if ((editForm.listPrice ?? editTarget.listPrice) <= 0) {
      setEditError("Giá bán phải lớn hơn 0");
      return;
    }
    setEditSubmitting(true);
    setEditError("");
    try {
      const updated = await updateProduct(editTarget.productId, {
        categoryId: editForm.categoryId ?? editTarget.categoryId,
        productName: name,
        barcode:
          editForm.barcode !== undefined ? (editForm.barcode ?? "") : undefined,
        description:
          editForm.description !== undefined
            ? (editForm.description ?? "")
            : undefined,
        measureUnit:
          editForm.measureUnit !== undefined
            ? (editForm.measureUnit ?? "")
            : undefined,
        importPrice: editForm.importPrice ?? editTarget.importPrice,
        listPrice: editForm.listPrice ?? editTarget.listPrice,
        isActive: editForm.isActive ?? editTarget.isActive,
      });
      setProducts((prev) =>
        prev.map((item) =>
          item.productId === editTarget.productId ? updated : item,
        ),
      );
      closeEdit();
    } catch (err: unknown) {
      const msg =
        (err as {
          response?: { data?: { message?: string | string[] } };
          message?: string;
        })?.response?.data?.message ??
        (err as { message?: string }).message;
      setEditError(
        Array.isArray(msg) ? msg.join(", ") : String(msg || "Cập nhật thất bại"),
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!softDeleteTarget) return;
    setSoftDeleting(true);
    try {
      await softDeleteProduct(softDeleteTarget.productId);
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === softDeleteTarget.productId
            ? { ...p, isActive: false }
            : p,
        ),
      );
      setSoftDeleteTarget(null);
    } catch {
      setSoftDeleteTarget(null);
    } finally {
      setSoftDeleting(false);
    }
  };

  const handleHardDelete = async () => {
    if (!hardDeleteTarget) return;
    setHardDeleting(true);
    try {
      await hardDeleteProduct(hardDeleteTarget.productId);
      setProducts((prev) =>
        prev.filter((p) => p.productId !== hardDeleteTarget.productId),
      );
      setHardDeleteTarget(null);
    } catch {
      setHardDeleteTarget(null);
    } finally {
      setHardDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Danh sách sản phẩm (Admin)
          </h2>
          <p className="text-sm text-gray-500">
            Sản phẩm mẫu do Admin tạo. Upload ảnh từ máy. {products.length}{" "}
            sản phẩm.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition"
        >
          <span>+</span> Thêm sản phẩm (upload ảnh)
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-4"
        >
          <h3 className="font-semibold text-amber-800 mb-1">
            Tạo sản phẩm mới — upload ảnh từ máy
          </h3>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tên sản phẩm *
              </label>
              <input
                required
                type="text"
                placeholder="VD: Cà phê sữa đá"
                value={form.productName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, productName: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Danh mục *
              </label>
              <select
                value={form.categoryId || categories[0]?.id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              >
                {categories.length === 0 ? (
                  <option value={0}>— Chưa có danh mục —</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryName}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ảnh sản phẩm * (chọn file từ máy)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Barcode (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Mã vạch"
                value={form.barcode ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, barcode: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Đơn vị
              </label>
              <input
                type="text"
                placeholder="ly, hộp, kg"
                value={form.measureUnit ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, measureUnit: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Giá nhập (VND) *
              </label>
              <input
                type="number"
                min={0}
                value={form.importPrice ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, importPrice: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Giá bán (VND) *
              </label>
              <input
                type="number"
                min={0}
                value={form.listPrice ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, listPrice: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Mô tả (tùy chọn)
              </label>
              <textarea
                rows={2}
                placeholder="Mô tả ngắn"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="product-active"
                checked={form.isActive ?? true}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <label
                htmlFor="product-active"
                className="text-sm text-gray-700"
              >
                Đang bán (active)
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={
                submitting || !imageFile || categories.length === 0
              }
              className="px-5 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : "Tạo sản phẩm"}
            </button>
            <button
              type="button"
              onClick={resetForm}
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
              <th className="px-4 py-3 text-left">Ảnh</th>
              <th className="px-4 py-3 text-left">Tên</th>
              <th className="px-4 py-3 text-left">Danh mục</th>
              <th className="px-4 py-3 text-right">Giá nhập</th>
              <th className="px-4 py-3 text-right">Giá bán</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRow cols={8} />
            ) : error ? (
              <ErrorRow cols={8} message={error} onRetry={load} />
            ) : products.length === 0 ? (
              <EmptyRow
                cols={8}
                message="Chưa có sản phẩm nào. Hãy tạo danh mục trước (tab Danh mục), sau đó thêm sản phẩm và chọn ảnh từ máy."
              />
            ) : (
              products.map((p) => (
                <tr key={p.productId} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400 font-mono">
                    #{p.productId}
                  </td>
                  <td className="px-4 py-3">
                    {getProductImageUrl(p.image) ? (
                      <img
                        src={getProductImageUrl(p.image)}
                        alt=""
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.productName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {categories.find((c) => c.id === p.categoryId)
                      ?.categoryName ?? `#${p.categoryId}`}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {formatPrice(p.importPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatPrice(p.listPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      text={p.isActive ? "Đang bán" : "Tắt"}
                      color={p.isActive ? "green" : "gray"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                        title="Sửa"
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
                      {p.isActive && (
                        <button
                          type="button"
                          onClick={() => setSoftDeleteTarget(p)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                          title="Ngừng bán"
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
                      )}
                      <button
                        type="button"
                        onClick={() => setHardDeleteTarget(p)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                        title="Xóa vĩnh viễn"
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                Chỉnh sửa: {editTarget.productName}
              </h3>
              <button
                type="button"
                onClick={closeEdit}
                className="text-gray-400 hover:text-gray-700 transition p-1"
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
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {editError && (
                <p className="text-red-500 text-sm">{editError}</p>
              )}
              <div className="flex gap-4">
                {getProductImageUrl(editTarget.image) && (
                  <img
                    src={getProductImageUrl(editTarget.image)}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <p className="text-xs text-gray-500 self-center">
                  Ảnh hiện tại (sửa thông tin bên dưới; đổi ảnh mới cần tạo sản
                  phẩm khác hoặc backend hỗ trợ upload khi update).
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.productName ?? editTarget.productName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, productName: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Danh mục
                </label>
                <select
                  value={editForm.categoryId ?? editTarget.categoryId}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      categoryId: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Giá nhập (VND)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.importPrice ?? editTarget.importPrice}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        importPrice: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Giá bán (VND) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.listPrice ?? editTarget.listPrice}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        listPrice: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  value={editForm.barcode ?? editTarget.barcode ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, barcode: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Đơn vị
                </label>
                <input
                  type="text"
                  value={editForm.measureUnit ?? editTarget.measureUnit ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      measureUnit: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  value={editForm.description ?? editTarget.description ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-product-active"
                  checked={editForm.isActive ?? editTarget.isActive}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label
                  htmlFor="edit-product-active"
                  className="text-sm text-gray-700"
                >
                  Đang bán (active)
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {editSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {softDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-gray-800 mb-2">
              Ngừng bán sản phẩm?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sản phẩm &quot;{softDeleteTarget.productName}&quot; sẽ được đánh
              dấu là Tắt (is_active = false). Bạn có thể bật lại bằng cách sửa.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSoftDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSoftDelete}
                disabled={softDeleting}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50"
              >
                {softDeleting ? "Đang xử lý..." : "Ngừng bán"}
              </button>
            </div>
          </div>
        </div>
      )}

      {hardDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-red-700 mb-2">
              Xóa vĩnh viễn?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sản phẩm &quot;{hardDeleteTarget.productName}&quot; sẽ bị xóa khỏi
              hệ thống và không khôi phục được. Ảnh trên server cũng bị xóa.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setHardDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleHardDelete}
                disabled={hardDeleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {hardDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
