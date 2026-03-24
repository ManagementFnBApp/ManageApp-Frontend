"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Product, CreateProductPayload } from "@/apis/productApi";
import { getCategories } from "@/apis/categoryApi";
import { getShopCategories, addShopCategories } from "@/apis/shopCategoryApi";
import { useMenuStore } from "@/data/useMenuStore";
import { getStoredRoleNormalized } from "@/apis/auth";

type Category = { id: number; name: string };
type ModalMode = "add" | "edit" | null;

const formatPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n) + " ₫";

/** Khi cửa hàng chưa gắn danh mục — chỉ dùng một câu thống nhất trên trang / trong form. */
const MSG_NO_SHOP_CATEGORIES =
  "Vui lòng chọn danh mục sản phẩm cho cửa hàng của bạn.";

export default function MenuManagePage() {
  const router = useRouter();

  const [role, setRole] = useState<string>(() => getStoredRoleNormalized());

  // Chỉ SHOPOWNER mới được truy cập trang này.
  // Nghe sự kiện role đổi sau khi user nâng cấp subscription để tránh redirect nhầm.
  useEffect(() => {
    const syncRole = () => setRole(getStoredRoleNormalized());
    syncRole();
    window.addEventListener("lumio:role-changed", syncRole);
    return () => window.removeEventListener("lumio:role-changed", syncRole);
  }, []);

  useEffect(() => {
    if (role !== "SHOPOWNER") {
      // Tránh trường hợp role vừa được update ngay sau mount.
      const t = window.setTimeout(() => {
        const latest = getStoredRoleNormalized();
        if (latest !== "SHOPOWNER") router.replace("/manager");
      }, 400);
      return () => window.clearTimeout(t);
    }
  }, [role, router]);

  const {
    products,
    loading,
    error: apiError,
    refresh,
    addProduct,
    editProduct,
    toggleActive,
  } = useMenuStore();

  // ── Danh mục cửa hàng đã chọn (dùng cho form sản phẩm) ──
  const [shopCategories, setShopCategories] = useState<Category[]>([]);
  const [shopCategoriesLoading, setShopCategoriesLoading] = useState(true);
  const [shopCategoriesError, setShopCategoriesError] = useState<string | null>(
    null,
  );

  const fetchShopCategories = useCallback(async () => {
    let attempt = 0;
    const run = async () => {
      setShopCategoriesLoading(true);
      try {
        const list = await getShopCategories();
        setShopCategories(list);
        setShopCategoriesError(null);
        attempt = 0;
      } catch (err: any) {
        const status = err?.status ?? err?.originalError?.response?.status;
        console.error("Failed to fetch shop categories:", err);

        // Backend vừa kích hoạt subscription có thể chưa sẵn sàng ngay.
        if (status === 403 && attempt < 3) {
          attempt += 1;
          setShopCategoriesLoading(true);
          const delayMs = [1200, 2400, 4200][attempt - 1] ?? 3000;
          setTimeout(() => {
            void run();
          }, delayMs);
          return;
        }

        setShopCategoriesError("Không thể tải danh mục cửa hàng");
        setShopCategories([]);
      } finally {
        setShopCategoriesLoading(false);
      }
    };

    await run();
  }, []);

  useEffect(() => {
    fetchShopCategories();
  }, [fetchShopCategories]);

  // ── Modal "Chọn thêm danh mục" (danh sách Admin tạo) ──
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [showPickCategoryModal, setShowPickCategoryModal] = useState(false);
  const [pickCategoryLoading, setPickCategoryLoading] = useState(false);
  const [pickCategorySubmitting, setPickCategorySubmitting] = useState(false);
  const [pickCategoryError, setPickCategoryError] = useState<string | null>(
    null,
  );

  const openPickCategoryModal = useCallback(async () => {
    setShowPickCategoryModal(true);
    setPickCategoryError(null);
    setPickCategoryLoading(true);
    try {
      const res = await getCategories();
      setAllCategories(
        res.map((c: { id: number; categoryName: string }) => ({
          id: c.id,
          name: c.categoryName,
        })),
      );
    } catch (err) {
      setPickCategoryError("Không thể tải danh sách danh mục");
      setAllCategories([]);
    } finally {
      setPickCategoryLoading(false);
    }
  }, []);

  const addCategoriesToShop = useCallback(
    async (categoryIds: number[]) => {
      if (categoryIds.length === 0) return;
      setPickCategorySubmitting(true);
      setPickCategoryError(null);
      try {
        await addShopCategories(categoryIds);
        await fetchShopCategories();
      } catch (err) {
        setPickCategoryError(
          (err as { message?: string })?.message ?? "Thêm danh mục thất bại",
        );
      } finally {
        setPickCategorySubmitting(false);
      }
    },
    [fetchShopCategories],
  );

  const EMPTY_FORM: CreateProductPayload = {
    categoryId: shopCategories[0]?.id ?? 0,
    productName: "",
    image: "",
    barcode: "",
    description: "",
    measureUnit: "ly",
    importPrice: 0,
    listPrice: 0,
    isActive: true,
  };

  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<CreateProductPayload>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message?: string) => {
    if (!message?.trim()) return;
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Filtered list ──
  const filtered = products.filter((p) => {
    const matchSearch =
      !search.trim() ||
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      (p.image || "").toLowerCase().includes(search.toLowerCase());
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && p.isActive) ||
      (filterActive === "inactive" && !p.isActive);
    return matchSearch && matchActive;
  });

  // ── Open modals ──
  const openAdd = () => {
    if (shopCategories.length === 0) {
      setFormError(MSG_NO_SHOP_CATEGORIES);
      return;
    }
    setForm({ ...EMPTY_FORM, categoryId: shopCategories[0].id });
    setImageFile(null);
    setFormError(null);
    setEditTarget(null);
    setModalMode("add");
  };

  const openEdit = (product: Product) => {
    setForm({
      categoryId: product.categoryId,
      productName: product.productName,
      image: product.image || "",
      barcode: product.barcode ?? "",
      description: product.description ?? "",
      measureUnit: product.measureUnit ?? "ly",
      importPrice: product.importPrice,
      listPrice: product.listPrice,
      isActive: product.isActive,
    });
    setFormError(null);
    setImageFile(null);
    setEditTarget(product);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditTarget(null);
    setImageFile(null);
  };

  // ── Submit form ──
  const getApiErrorMessage = (err: unknown): string => {
    const e = err as {
      message?: string | string[];
      originalError?: { response?: { data?: { message?: string | string[] } } };
      response?: { data?: { message?: string | string[] } };
    };
    const msg =
      e?.response?.data?.message ??
      e?.originalError?.response?.data?.message ??
      e?.message;

    const normalizeOne = (raw: string): string => {
      const m = raw.trim();
      const lower = m.toLowerCase();

      if (lower === "image should not be empty") {
        return "Ảnh sản phẩm không được để trống.";
      }
      if (lower === "image must be a string") {
        return "Ảnh sản phẩm không đúng định dạng mà backend yêu cầu.";
      }
      if (lower === "isactive must be a boolean value") {
        return "Trạng thái bán (isActive) không hợp lệ.";
      }
      return m;
    };

    if (Array.isArray(msg)) {
      return msg.map((item) => `- ${normalizeOne(String(item))}`).join("\n");
    }
    if (typeof msg === "string" && msg.trim()) {
      return normalizeOne(msg);
    }
    return "Có lỗi xảy ra. Thử lại hoặc kiểm tra backend (port 2999) đã chạy.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim()) {
      setFormError("Tên sản phẩm không được trống.");
      return;
    }
    if (!String(form.barcode ?? "").trim()) {
      setFormError("Barcode không được trống.");
      return;
    }
    if (form.listPrice <= 0) {
      setFormError("Giá bán phải lớn hơn 0.");
      return;
    }
    if (modalMode === "add") {
      const validCategoryId = Number(form.categoryId);
      if (
        !validCategoryId ||
        !shopCategories.some((c) => c.id === validCategoryId)
      ) {
        setFormError(MSG_NO_SHOP_CATEGORIES);
        return;
      }
      if (!imageFile) {
        setFormError("Vui lòng chọn ảnh sản phẩm.");
        return;
      }
    }

    setSubmitting(true);
    setFormError(null);
    const importPrice = Number(form.importPrice);
    const listPrice = Number(form.listPrice);
    try {
      if (modalMode === "add") {
        const result = await addProduct({
          categoryId: Number(form.categoryId),
          productName: form.productName.trim(),
          image: imageFile as File,
          barcode: String(form.barcode ?? "").trim(),
          description: form.description?.trim() || undefined,
          measureUnit: form.measureUnit?.trim() || undefined,
          importPrice: Number.isNaN(importPrice) ? 0 : importPrice,
          listPrice: Number.isNaN(listPrice) ? 0 : listPrice,
          isActive: form.isActive ?? true,
        });
        closeModal();
        showToast(result.message);
        refresh();
      } else if (editTarget) {
        // Tránh gửi categoryId/isActive trong update để tránh backend truyền thẳng vào Prisma bị lỗi.
        // Status vẫn dùng nút toggle ở table.
        // Chỉ gửi các field thật sự thay đổi để PATCH đúng nghĩa partial update.
        const nextProductName = form.productName.trim();
        const prevProductName = String(editTarget.productName ?? "").trim();

        const nextBarcode = String(form.barcode ?? "").trim() || undefined;
        const prevBarcode = String(editTarget.barcode ?? "").trim() || undefined;

        const nextDescription = form.description?.trim() || undefined;
        const prevDescription = String(editTarget.description ?? "").trim() || undefined;

        const nextMeasureUnit = form.measureUnit?.trim() || undefined;
        const prevMeasureUnit = String(editTarget.measureUnit ?? "").trim() || undefined;

        const nextImportPrice = Number.isNaN(importPrice) ? 0 : importPrice;
        const prevImportPrice = Number(editTarget.importPrice ?? 0);

        const nextListPrice = Number.isNaN(listPrice) ? 0 : listPrice;
        const prevListPrice = Number(editTarget.listPrice ?? 0);

        const changes: Record<string, unknown> = {};
        if (nextProductName !== prevProductName) changes.productName = nextProductName;
        if (nextBarcode !== prevBarcode) changes.barcode = nextBarcode;
        if (nextDescription !== prevDescription) changes.description = nextDescription;
        if (nextMeasureUnit !== prevMeasureUnit) changes.measureUnit = nextMeasureUnit;
        if (nextImportPrice !== prevImportPrice) changes.importPrice = nextImportPrice;
        if (nextListPrice !== prevListPrice) changes.listPrice = nextListPrice;
        if (imageFile) changes.image = imageFile;

        if (Object.keys(changes).length === 0) {
          setFormError("Không có thay đổi để cập nhật.");
          return;
        }

        const result = await editProduct(editTarget.productId, changes);
        closeModal();
        showToast(result.message);
        refresh();
      }
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryName = (id: number) =>
    shopCategories.find((c) => c.id === id)?.name ?? `Cat #${id}`;

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      {/* ── Toast ── */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 flex items-center gap-3 bg-emerald-500 rounded-2xl shadow-xl px-5 py-4 min-w-75 max-w-sm">
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
            {toastMessage}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openAdd}
            disabled={shopCategories.length === 0 || shopCategoriesLoading}
            className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-xl shadow transition ${
              shopCategories.length === 0 || shopCategoriesLoading
                ? "bg-gray-300 text-gray-400 cursor-not-allowed pointer-events-none"
                : "bg-lime-400 hover:bg-lime-500 text-white"
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

      {/* ── Shop categories error banner ── */}
      {shopCategoriesError && (
        <div className="px-8 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
          <span className="text-amber-700 text-sm font-medium">
            {shopCategoriesError}
          </span>
          <button
            type="button"
            onClick={fetchShopCategories}
            className="ml-auto text-xs underline text-amber-600 hover:text-amber-800 transition"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Danh mục cửa hàng (đã chọn) + Chọn thêm ── */}
      <div className="px-8 py-4 bg-white border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            Danh mục cửa hàng:
          </span>
          {shopCategoriesLoading ? (
            <span className="text-sm text-gray-400">Đang tải...</span>
          ) : shopCategories.length === 0 ? (
            <span className="text-sm text-amber-600">
              {MSG_NO_SHOP_CATEGORIES}
            </span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {shopCategories.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-lime-100 text-lime-800"
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={openPickCategoryModal}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition"
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
            Chọn thêm danh mục
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="px-8 py-4 flex flex-wrap gap-3 items-center bg-white border-b border-gray-100">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, ảnh..."
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
                  <th className="px-5 py-3 text-left">Ảnh / Mã</th>
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
                        <p className="text-xs text-gray-400 truncate max-w-50">
                          {p.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {getCategoryName(p.categoryId)}
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-500 truncate max-w-30">
                      {p.image ? (
                        <div className="flex items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.image}
                            alt={p.productName}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-gray-50 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      ) : (
                        "—"
                      )}
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
                          try {
                            const result = await toggleActive(p.productId);
                            showToast(result.message);
                            refresh();
                          } catch (err: unknown) {
                            setFormError(getApiErrorMessage(err));
                          }
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
                      <div className="flex items-center justify-center">
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
                    disabled={modalMode === "edit"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none bg-white"
                  >
                    {shopCategories.map((c) => (
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
                    Ảnh sản phẩm {modalMode === "add" ? "*" : "(tùy chọn)"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  />
                  {modalMode === "edit" && (
                    <p className="mt-1 text-xs text-gray-400">
                      Nếu không chọn ảnh mới, hệ thống sẽ giữ ảnh hiện tại.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Barcode *
                  </label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) =>
                      setForm({ ...form, barcode: e.target.value })
                    }
                    placeholder="Ví dụ: CF-SUA-DA-001"
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

              {modalMode === "add" && (
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
              )}

              {formError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg whitespace-pre-line">
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

      {/* ══ Modal: Chọn thêm danh mục cho cửa hàng (từ danh sách Admin) ══ */}
      {showPickCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                Chọn danh mục cho cửa hàng
              </h2>
              <button
                type="button"
                onClick={() => setShowPickCategoryModal(false)}
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
            <p className="px-6 pb-3 text-sm text-gray-500">
              Danh sách do Admin tạo. Chọn danh mục bạn muốn thêm vào cửa hàng.
            </p>
            {pickCategoryError && (
              <div className="mx-6 mb-3 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm">
                {pickCategoryError}
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {pickCategoryLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : allCategories.length === 0 ? (
                <p className="py-8 text-center text-gray-500 text-sm">
                  Chưa có danh mục nào. Admin cần tạo danh mục trước.
                </p>
              ) : (
                <ul className="space-y-2">
                  {allCategories.map((c) => {
                    const alreadyAdded = shopCategories.some(
                      (sc) => sc.id === c.id,
                    );
                    return (
                      <li
                        key={c.id}
                        className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                      >
                        <span className="font-medium text-gray-800">
                          {c.name}
                        </span>
                        {alreadyAdded ? (
                          <span className="text-xs font-medium text-lime-600 bg-lime-100 px-2.5 py-1 rounded-full">
                            Đã thêm
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={pickCategorySubmitting}
                            onClick={() => addCategoriesToShop([c.id])}
                            className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            Thêm vào cửa hàng
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
