import { apiClient } from "../configs/axios";
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "./productApi";

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

function toDate(value: unknown): Date {
  if (value == null) {
    return new Date(0);
  }
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
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
  return {
    productId: Number(raw.id ?? raw.productId),
    categoryId: Number(raw.category_id ?? raw.categoryId),
    productName: String(raw.product_name ?? raw.productName ?? ""),
    image: String(raw.image ?? ""),
    barcode: raw.barcode != null ? String(raw.barcode) : null,
    description: raw.description != null ? String(raw.description) : null,
    measureUnit: raw.measure_unit != null ? String(raw.measure_unit) : null,
    importPrice: toNumber(raw.import_price ?? raw.importPrice),
    listPrice: toNumber(raw.list_price ?? raw.listPrice),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? true),
    createdAt: toDate(raw.createdAt ?? raw.created_at),
    updatedAt: toDate(raw.updatedAt ?? raw.updated_at),
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

/**
 * POST /shop-products
 * SHOPOWNER: tạo sản phẩm mới cho shop. Backend tự gắn shop_id từ JWT.
 */
export const createShopProduct = async (
  payload: CreateProductPayload,
): Promise<Product> => {
  const categoryId = Number(payload.categoryId);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error(
      "Danh mục sản phẩm không hợp lệ. Vui lòng chọn danh mục trước.",
    );
  }
  const image =
    (payload.image && String(payload.image).trim()) ||
    `/placeholder-${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  const listPrice = Number(payload.listPrice);
  const importPrice = Number(payload.importPrice);

  const body: Record<string, unknown> = {
    categoryId,
    productName: String(payload.productName).trim(),
    image,
    listPrice: Number.isNaN(listPrice) ? 0 : listPrice,
    importPrice: Number.isNaN(importPrice) ? 0 : importPrice,
    isActive: payload.isActive ?? true,
  };
  if (payload.barcode != null && String(payload.barcode).trim())
    body.barcode = String(payload.barcode).trim();
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
  payload: UpdateProductPayload,
): Promise<Product> => {
  const body: Record<string, unknown> = {};
  if (payload.categoryId !== undefined)
    body.categoryId = Number(payload.categoryId);
  if (payload.productName !== undefined)
    body.productName = String(payload.productName).trim();
  if (payload.image !== undefined)
    body.image = String(payload.image).trim() || null;
  if (payload.barcode !== undefined)
    body.barcode = String(payload.barcode).trim() || null;
  if (payload.description !== undefined)
    body.description = String(payload.description).trim() || null;
  if (payload.measureUnit !== undefined)
    body.measureUnit = String(payload.measureUnit).trim() || null;
  if (payload.listPrice !== undefined)
    body.listPrice = Number(payload.listPrice);
  if (payload.importPrice !== undefined)
    body.importPrice = Number(payload.importPrice);
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
