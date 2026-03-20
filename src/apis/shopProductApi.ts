import { apiClient } from "../configs/axios";
import type { Product } from "./productApi";

// Payload riêng cho shop-products (backend dùng FileInterceptor('image'))
export type CreateShopProductPayload = {
  categoryId: number;
  productName: string;
  image: File | string;
  barcode?: string;
  description?: string;
  measureUnit?: string;
  importPrice: number;
  listPrice: number;
  isActive?: boolean;
};

export type UpdateShopProductPayload = Partial<CreateShopProductPayload>;

const debugLoggingEnabled =
  typeof process !== "undefined" &&
  process.env != null &&
  process.env.NODE_ENV !== "production";

/**
 * API cho /shop-products — SHOPOWNER tạo/quản lý sản phẩm riêng của shop.
 * Backend lấy shop_id từ JWT tự động, không cần gửi trong body.
 *
 * Phân quyền backend:
 *   POST   /shop-products         → SHOPOWNER (shop_id từ JWT)
 *   GET    /shop-products         → SHOPOWNER + STAFF (shop_id từ JWT)
 *   PATCH  /shop-products/:id     → SHOPOWNER + ADMIN
 *   DELETE /shop-products/:id     → SHOPOWNER
 */

function unwrap<T>(raw: unknown): T {
  if (raw != null && typeof raw === "object" && "data" in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

function toNumber(value: unknown): number {
  if (value == null) return 0;

  // Handle Prisma Decimal format: { s: 1, e: 4, d: [29000] }
  if (typeof value === "object" && value !== null) {
    const obj = value as any;
    if (Array.isArray(obj.d) && obj.d.length > 0) {
      const sign = obj.s === -1 ? -1 : 1;
      return sign * (obj.d[0] || 0);
    }
  }

  // Handle Prisma Decimal with $numberDecimal
  if (
    typeof value === "object" &&
    value !== null &&
    "$numberDecimal" in (value as object)
  ) {
    return Number((value as any).$numberDecimal);
  }

  const obj = value as { toNumber?: () => number };
  if (typeof obj?.toNumber === "function") return obj.toNumber();
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Map backend ShopProductResponseDto (snake_case) → frontend Product (camelCase).
 * Dùng cùng shape với productApi.Product để useMenuStore tương thích.
 */
function mapShopProduct(raw: Record<string, unknown>): Product {
  const imageRaw = String(raw.image ?? "");
  const image = imageRaw.replaceAll("\\", "/");
  return {
    productId: Number(raw.id ?? raw.productId),
    categoryId: Number(raw.category_id ?? raw.categoryId),
    productName: String(raw.product_name ?? raw.productName ?? ""),
    image,
    barcode: raw.barcode != null ? String(raw.barcode) : null,
    description: raw.description != null ? String(raw.description) : null,
    measureUnit: raw.measure_unit != null ? String(raw.measure_unit) : null,
    importPrice: toNumber(raw.import_price ?? raw.importPrice),
    listPrice: toNumber(raw.list_price ?? raw.listPrice),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? true),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ""),
  };
}

/**
 * GET /shop-products
 * SHOPOWNER + STAFF: lấy danh sách sản phẩm của shop mình (shop_id từ JWT).
 */
export const getShopProducts = async (
  isActive?: boolean,
): Promise<Product[]> => {
  const res = await apiClient.get("/shop-products");
  const raw = unwrap<unknown>(res.data);
  const arr = Array.isArray(raw) ? raw : [];
  const products = arr.map((item) =>
    mapShopProduct((item as Record<string, unknown>) ?? {}),
  );
  if (isActive !== undefined) {
    return products.filter((p) => p.isActive === isActive);
  }
  return products;
};

// ===== POS helper (needs category_name + image) =====

export type PosShopProduct = {
  id: number;
  shopProductId: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName: string;
  image: string;
  isActive: boolean;
};

/**
 * GET /shop-products (raw) → dùng cho POS.
 * Backend response có category_name + image (URL).
 */
export const getPosShopProducts = async (
  isActive?: boolean,
): Promise<PosShopProduct[]> => {
  const res = await apiClient.get("/shop-products");
  const raw = unwrap<unknown>(res.data);
  const arr = Array.isArray(raw) ? raw : [];
  const mapped = arr.map((item) => {
    const r = (item as Record<string, unknown>) ?? {};
    const imageRaw = String(r.image ?? "");
    return {
      id: Number(r.id ?? r.productId),
      shopProductId: Number(r.id ?? r.productId),
      name: String(r.product_name ?? r.productName ?? ""),
      price: toNumber(r.list_price ?? r.listPrice),
      categoryId: Number(r.category_id ?? r.categoryId),
      categoryName: String(r.category_name ?? r.categoryName ?? ""),
      image: imageRaw.replaceAll("\\", "/"),
      isActive: Boolean(r.is_active ?? r.isActive ?? true),
    } satisfies PosShopProduct;
  });
  if (isActive !== undefined) {
    return mapped.filter((p) => p.isActive === isActive);
  }
  return mapped;
};

/**
 * POST /shop-products
 * SHOPOWNER: tạo sản phẩm mới cho shop. Backend tự gắn shop_id từ JWT.
 */
export const createShopProduct = async (
  payload: CreateShopProductPayload,
): Promise<Product> => {
  const categoryId = Number(payload.categoryId);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error(
      "Danh mục sản phẩm không hợp lệ. Vui lòng chọn danh mục trước.",
    );
  }
  const listPrice = Number(payload.listPrice);
  const importPrice = Number(payload.importPrice);

  // multipart (khuyến nghị) khi có File ảnh
  if (payload.image instanceof File) {
    const form = new FormData();
    /**
     * Backend hiện tại vừa:
     * - nhận file qua FileInterceptor('image')
     * - validate DTO yêu cầu `image` là string (không rỗng)
     *
     * Để tương thích mà không sửa backend: gửi 2 part cùng field name `image`
     * - part text: tên file (để pass validation)
     * - part file: file thật (để multer lấy vào req.file)
     *
     * Lưu ý: append text trước để đảm bảo req.body.image có giá trị.
     */
    form.append("image", payload.image.name);
    form.append("image", payload.image);
    form.append("categoryId", String(categoryId));
    form.append("productName", String(payload.productName).trim());
    form.append("listPrice", String(Number.isNaN(listPrice) ? 0 : listPrice));
    form.append("importPrice", String(Number.isNaN(importPrice) ? 0 : importPrice));
    // deploy DTO: barcode là string (thường bị validate nếu thiếu) → luôn gửi
    form.append("barcode", payload.barcode != null ? String(payload.barcode).trim() : "");
    if (payload.description != null) form.append("description", String(payload.description));
    if (payload.measureUnit != null) form.append("measureUnit", String(payload.measureUnit));
    // Không gửi isActive trong multipart để tránh backend validate boolean fail
    // (form-data luôn là string; backend hiện lấy default is_active ở DB/service).

    const res = await apiClient.post("/shop-products", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return mapShopProduct(unwrap<Record<string, unknown>>(res.data) ?? {});
  }

  // fallback JSON nếu chỉ có string URL/path
  const image =
    (typeof payload.image === "string" && payload.image.trim()) ||
    `/placeholder-${Date.now()}-${Math.random().toString(36).slice(2)}.png`;

  const body: Record<string, unknown> = {
    categoryId,
    productName: String(payload.productName).trim(),
    image,
    listPrice: Number.isNaN(listPrice) ? 0 : listPrice,
    importPrice: Number.isNaN(importPrice) ? 0 : importPrice,
    isActive: payload.isActive ?? true,
    barcode: payload.barcode != null ? String(payload.barcode).trim() : "",
  };
  if (payload.description != null && String(payload.description).trim())
    body.description = String(payload.description).trim();
  if (payload.measureUnit != null && String(payload.measureUnit).trim())
    body.measureUnit = String(payload.measureUnit).trim();

  const res = await apiClient.post("/shop-products", body);
  return mapShopProduct(unwrap<Record<string, unknown>>(res.data) ?? {});
};

/**
 * PATCH /shop-products/:id
 * SHOPOWNER: cập nhật sản phẩm.
 */
export const updateShopProduct = async (
  id: number,
  payload: UpdateShopProductPayload,
): Promise<Product> => {
  // multipart khi đổi ảnh
  if (payload.image instanceof File) {
    const form = new FormData();
    form.append("image", payload.image);
    if (payload.productName !== undefined) form.append("productName", String(payload.productName).trim());
    if (payload.barcode !== undefined) form.append("barcode", String(payload.barcode).trim());
    if (payload.description !== undefined) form.append("description", String(payload.description ?? ""));
    if (payload.measureUnit !== undefined) form.append("measureUnit", String(payload.measureUnit ?? ""));
    if (payload.listPrice !== undefined) form.append("listPrice", String(Number(payload.listPrice)));
    if (payload.importPrice !== undefined) form.append("importPrice", String(Number(payload.importPrice)));
    if (payload.isActive !== undefined) form.append("isActive", String(Boolean(payload.isActive)));

    const res = await apiClient.patch(`/shop-products/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return mapShopProduct(unwrap<Record<string, unknown>>(res.data) ?? {});
  }

  const body: Record<string, unknown> = {};
  if (payload.categoryId !== undefined) body.categoryId = Number(payload.categoryId);
  if (payload.productName !== undefined) body.productName = String(payload.productName).trim();
  if (payload.image !== undefined) body.image = String(payload.image).trim() || null;
  if (payload.barcode !== undefined) body.barcode = String(payload.barcode).trim() || null;
  if (payload.description !== undefined) body.description = String(payload.description).trim() || null;
  if (payload.measureUnit !== undefined) body.measureUnit = String(payload.measureUnit).trim() || null;
  if (payload.listPrice !== undefined) body.listPrice = Number(payload.listPrice);
  if (payload.importPrice !== undefined) body.importPrice = Number(payload.importPrice);
  if (payload.isActive !== undefined) body.isActive = Boolean(payload.isActive);

  if (debugLoggingEnabled) {
    console.log("🔧 updateShopProduct PATCH /shop-products/" + id);
    console.log("📦 Request Body:", JSON.stringify(body, null, 2));
  }

  try {
    const res = await apiClient.patch(`/shop-products/${id}`, body);
    if (debugLoggingEnabled) {
      console.log("✅ updateShopProduct response:", res.data);
    }
    return mapShopProduct(unwrap<Record<string, unknown>>(res.data) ?? {});
  } catch (err: any) {
    if (debugLoggingEnabled) {
      console.error(
        "❌ updateShopProduct error:",
        err.response?.data || err.message,
      );
    }
    throw err;
  }
};

/**
 * DELETE /shop-products/:id
 * SHOPOWNER: xóa sản phẩm khỏi shop.
 */
export const deleteShopProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/shop-products/${id}`);
};
