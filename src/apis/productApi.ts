import { apiClient } from "../configs/axios";

// ===== TYPES (khớp backend ProductResponseDto, CreateProductDto) =====

export interface Product {
  productId: number;
  categoryId: number;
  productName: string;
  /** URL hoặc path ảnh sản phẩm - backend bắt buộc */
  image: string;
  /** Alias hiển thị (map từ image) */
  sku?: string;
  barcode?: string | null;
  description?: string | null;
  measureUnit?: string | null;
  importPrice: number;
  listPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductPayload {
  categoryId: number;
  productName: string;
  /** Backend bắt buộc - URL ảnh hoặc placeholder */
  image: string;
  barcode?: string;
  description?: string;
  measureUnit?: string;
  importPrice: number;
  listPrice: number;
  isActive?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

// ================= HELPERS =================

/** Backend có thể trả trực tiếp hoặc bọc trong { data } */
function unwrap<T>(raw: unknown): T {
  if (raw == null) return raw as T;
  if (typeof raw === 'object' && 'data' in (raw as object)) {
    const inner = (raw as { data: unknown }).data;
    return inner as T;
  }
  return raw as T;
}

function toNumber(value: unknown): number {
  if (value == null) return 0;

  // Handle Prisma Decimal format: { s: 1, e: 4, d: [29000] }
  if (typeof value === 'object' && value !== null) {
    const obj = value as any;
    if (Array.isArray(obj.d) && obj.d.length > 0) {
      const sign = obj.s === -1 ? -1 : 1;
      return sign * (obj.d[0] || 0);
    }
  }

  // Handle Prisma Decimal with $numberDecimal
  if (typeof value === 'object' && value !== null && '$numberDecimal' in (value as object)) {
    return Number((value as any).$numberDecimal);
  }

  const obj = value as { toNumber?: () => number };
  if (typeof obj?.toNumber === 'function') return obj.toNumber();
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function mapProduct(raw: Record<string, unknown>): Product {
  return {
    productId: Number(raw.productId ?? raw.id),
    categoryId: Number(raw.categoryId ?? raw.category_id),
    productName: String(raw.productName ?? raw.product_name ?? ''),
    image: String(raw.image ?? ''),
    sku: raw.sku != null ? String(raw.sku) : String(raw.image ?? ''),
    barcode: raw.barcode != null ? String(raw.barcode) : null,
    description: raw.description != null ? String(raw.description) : null,
    measureUnit:
      raw.measureUnit != null
        ? String(raw.measureUnit)
        : raw.measure_unit != null
        ? String(raw.measure_unit)
        : null,
    importPrice: toNumber(raw.importPrice ?? raw.import_price),
    listPrice: toNumber(raw.listPrice ?? raw.list_price),
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ''),
  };
}

// ===== PRODUCT APIs ─────────────────────────────────────────────────────────────
// Backend: GET /products?isActive= | POST /products | GET|PATCH|DELETE /products/:id | DELETE /products/:id/hard

/** GET /products - Không query khi lấy tất cả; gửi isActive=true|false khi lọc (khớp ParseBoolPipe) */
export const getProducts = async (isActive?: boolean): Promise<Product[]> => {
  const params: Record<string, string> = {};
  if (isActive === true) params.isActive = 'true';
  else if (isActive === false) params.isActive = 'false';
  const res = await apiClient.get('/products', { params });
  const list = unwrap<unknown>(res.data);
  const arr = Array.isArray(list) ? list : [];
  return arr.map((item) => mapProduct((item as Record<string, unknown>) ?? {}));
};

/** GET /products/:id */
export const getProductById = async (id: number): Promise<Product> => {
  const res = await apiClient.get(`/products/${id}`);
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapProduct(raw ?? {});
};

/** POST /products - Body khớp backend CreateProductDto (camelCase, số là number) */
export const createProduct = async (
  payload: CreateProductPayload,
): Promise<Product> => {
  const categoryId = Number(payload.categoryId);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error('Danh mục sản phẩm không hợp lệ. Vui lòng chọn danh mục cho cửa hàng trước.');
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
  const res = await apiClient.post('/products', body);
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapProduct(raw ?? {});
};

/** PATCH /products/:id - Chỉ gửi field có trong payload, số là number (khớp UpdateProductDto) */
export const updateProduct = async (
  id: number,
  payload: UpdateProductPayload,
): Promise<Product> => {
  const body: Record<string, unknown> = {};
  if (payload.categoryId !== undefined) body.categoryId = Number(payload.categoryId);
  if (payload.productName !== undefined) body.productName = String(payload.productName).trim();
  if (payload.image !== undefined) body.image = String(payload.image).trim();
  if (payload.barcode !== undefined) body.barcode = String(payload.barcode).trim() || undefined;
  if (payload.description !== undefined) body.description = String(payload.description).trim() || undefined;
  if (payload.measureUnit !== undefined) body.measureUnit = String(payload.measureUnit).trim() || undefined;
  if (payload.listPrice !== undefined) body.listPrice = Number(payload.listPrice);
  if (payload.importPrice !== undefined) body.importPrice = Number(payload.importPrice);
  if (payload.isActive !== undefined) body.isActive = Boolean(payload.isActive);

  const res = await apiClient.patch(`/products/${id}`, body);
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapProduct(raw ?? {});
};

/** DELETE /products/:id - Soft delete (ngừng bán) */
export const softDeleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};

/** DELETE /products/:id/hard - Xóa hẳn */
export const hardDeleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}/hard`);
};
